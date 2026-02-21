const express = require('express');
const router = express.Router();
const usageStore = require('../usageStore');

function createSongsRouter(songs) {
  // Strip lyrics from a song for list responses
  function toSummary({ lyrics, ...meta }) {
    return meta;
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
    res.json(usageStore.getSongsUsedSince(since));
  });

  // GET /api/songs/usage-summary — bulk usage summary for all songs
  router.get('/usage-summary', (req, res) => {
    res.json(usageStore.getUsageSummary());
  });

  // GET /api/songs/:id/usage — usage history for a song
  router.get('/:id/usage', (req, res) => {
    res.json(usageStore.getUsageForSong(req.params.id));
  });

  // GET /api/songs/:id — full song details with lyrics
  router.get('/:id', (req, res) => {
    const song = songs.find(s => s.id === req.params.id);
    if (!song) {
      return res.status(404).json({ error: 'Song not found' });
    }
    res.json(song);
  });

  return router;
}

module.exports = { createSongsRouter };
