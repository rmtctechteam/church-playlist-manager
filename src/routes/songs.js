const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const analyticsDb = require('../analyticsDb');
const { parseSongContent } = require('../songParser');

const upload = multer({ storage: multer.memoryStorage() });

function createSongsRouter(songs, songsDir) {
  // Strip lyrics from a song for list responses, adding a short preview
  function toSummary(song) {
    const { lyrics, ...meta } = song;
    const firstVerse = lyrics?.[1] ?? lyrics?.[0];
    const lines = (firstVerse?.lines || []).filter(l => l.trim());
    const lyricsPreview = lines.slice(0, 2).join(' / ') || null;
    return { ...meta, lyricsPreview };
  }

  // Build a flat lyrics string for a song (for search matching)
  function lyricsText(song) {
    return song.lyrics.map(s => s.lines.join(' ')).join(' ').toLowerCase();
  }

  // GET /api/songs — list all or search with ?q=
  router.get('/', (req, res) => {
    const q = req.query.q;
    if (!q) {
      return res.json(songs.map(toSummary));
    }

    const query = q.toLowerCase();

    // Score each song: title match = 1, artist match = 2, lyrics match = 3
    // Lower score = higher rank
    const scored = [];
    for (const song of songs) {
      const titleMatch = song.title && song.title.toLowerCase().includes(query);
      const artistMatch = song.artist && song.artist.toLowerCase().includes(query);
      const lyricsMatch = lyricsText(song).includes(query);

      if (titleMatch || artistMatch || lyricsMatch) {
        // Best (lowest) rank: title=1, artist=2, lyrics=3
        let rank = 3;
        if (artistMatch) rank = 2;
        if (titleMatch) rank = 1;
        scored.push({ song, rank });
      }
    }

    scored.sort((a, b) => a.rank - b.rank);
    res.json(scored.map(s => toSummary(s.song)));
  });

  // GET /api/songs/used?since=YYYY-MM-DD — song IDs used since date
  router.get('/used', (req, res) => {
    const since = req.query.since;
    if (!since) {
      return res.status(400).json({ error: 'Missing required query parameter: since' });
    }
    res.json(analyticsDb.getSongsUsedSince(since));
  });

  // GET /api/songs/usage-summary — bulk usage summary for all songs
  router.get('/usage-summary', (req, res) => {
    res.json(analyticsDb.getUsageSummary());
  });

  // GET /api/songs/analytics/frequency — song frequency report
  router.get('/analytics/frequency', (req, res) => {
    res.json(analyticsDb.getSongFrequencyReport(req.query.since || null));
  });

  // GET /api/songs/:id/usage — usage history for a song
  router.get('/:id/usage', (req, res) => {
    res.json(analyticsDb.getUsageForSong(req.params.id));
  });

  // GET /api/songs/:id/analytics/by-service-type
  router.get('/:id/analytics/by-service-type', (req, res) => {
    res.json(analyticsDb.getUsageByServiceType(req.params.id));
  });

  // GET /api/songs/:id/analytics/by-section
  router.get('/:id/analytics/by-section', (req, res) => {
    res.json(analyticsDb.getUsageBySection(req.params.id));
  });

  // GET /api/songs/:id/analytics/detail
  router.get('/:id/analytics/detail', (req, res) => {
    res.json(analyticsDb.getSongUsageDetail(req.params.id));
  });

  // GET /api/songs/:id — full song details with lyrics
  router.get('/:id', (req, res) => {
    const song = songs.find(s => s.id === req.params.id);
    if (!song) {
      return res.status(404).json({ error: 'Song not found' });
    }
    res.json(song);
  });

  // PATCH /api/songs/:id/youtube — update YouTube reference URLs
  router.patch('/:id/youtube', (req, res) => {
    const song = songs.find(s => s.id === req.params.id);
    if (!song) return res.status(404).json({ error: 'Song not found' });

    const { youtubeUrls } = req.body;
    if (!Array.isArray(youtubeUrls)) {
      return res.status(400).json({ error: 'youtubeUrls must be an array' });
    }
    if (youtubeUrls.length > 5) {
      return res.status(400).json({ error: 'Maximum 5 YouTube URLs allowed' });
    }
    for (const url of youtubeUrls) {
      if (typeof url !== 'string' || !url.startsWith('https://') || (!url.includes('youtube.com') && !url.includes('youtu.be'))) {
        return res.status(400).json({ error: `Invalid YouTube URL: ${url}` });
      }
    }

    // Find the song's file on disk
    const files = fs.readdirSync(songsDir);
    const filename = files.find(f => path.basename(f, '.txt') === song.id);
    if (!filename) return res.status(404).json({ error: 'Song file not found' });
    const filePath = path.join(songsDir, filename);

    // Read current file content
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split(/\r?\n/);

    // Find the end of the header (first blank line or end of file)
    let headerEnd = lines.findIndex(l => l.trim() === '');
    if (headerEnd === -1) headerEnd = lines.length;

    // Remove any existing YouTube: line from the header
    const headerLines = lines.slice(0, headerEnd).filter(l => !l.trim().toLowerCase().startsWith('youtube:'));
    const bodyLines = lines.slice(headerEnd);

    // Build new header — insert YouTube line before the first blank line separator
    if (youtubeUrls.length > 0) {
      headerLines.push(`YouTube: ${youtubeUrls.join(', ')}`);
    }

    const newContent = [...headerLines, ...bodyLines].join('\n');

    // Atomic write
    const tmpPath = filePath + '.tmp';
    fs.writeFileSync(tmpPath, newContent, 'utf-8');
    fs.renameSync(tmpPath, filePath);

    // Update in-memory song entry
    song.youtubeUrls = youtubeUrls;

    res.json(song);
  });

  // POST /api/songs/upload — upload one or more .txt song files
  router.post('/upload', upload.array('songs'), (req, res) => {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files provided' });
    }

    const results = [];

    for (const file of req.files) {
      const filename = file.originalname;
      const id = path.basename(filename, '.txt');
      const destPath = path.join(songsDir, filename);

      // 409 if file already exists
      if (fs.existsSync(destPath)) {
        results.push({ filename, success: false, error: 'File already exists' });
        continue;
      }

      // Validate by parsing
      let song;
      try {
        const content = file.buffer.toString('utf8');
        song = parseSongContent(id, content);
      } catch (err) {
        results.push({ filename, success: false, error: `Parse error: ${err.message}` });
        continue;
      }

      // Write to disk and add to in-memory array
      fs.writeFileSync(destPath, file.buffer);
      songs.push(song);
      results.push({ filename, success: true, song: toSummary(song) });
    }

    res.json(results);
  });

  return router;
}

module.exports = { createSongsRouter };
