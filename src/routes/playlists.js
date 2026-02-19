const express = require('express');
const { Document, Packer, Paragraph, TextRun, HeadingLevel } = require('docx');
const { getAllServiceTypes, getServiceType, isValidType } = require('../serviceTypes');
const playlistStore = require('../playlistStore');
const usageStore = require('../usageStore');

function createPlaylistsRouter(songs) {
  const router = express.Router();

  function resolveSongs(songIds) {
    return songIds.map(songId => {
      const song = songs.find(s => s.id === songId);
      return song || { id: songId, notFound: true };
    });
  }

  function buildDocContent(playlist) {
    const children = [];

    // Playlist name heading
    children.push(new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(playlist.name)] }));

    // Metadata lines
    if (playlist.date) {
      children.push(new Paragraph({ children: [new TextRun({ text: `Date: ${playlist.date}`, italics: true })] }));
    }
    if (playlist.theme) {
      children.push(new Paragraph({ children: [new TextRun({ text: `Theme: ${playlist.theme}`, italics: true })] }));
    }
    if (playlist.bibleLessons) {
      children.push(new Paragraph({ children: [new TextRun({ text: `Bible Lessons: ${playlist.bibleLessons}`, italics: true })] }));
    }

    // Spacing after metadata before first section
    children.push(new Paragraph({ children: [new TextRun({ text: '' })] }));

    // Sections with songs
    let songCount = 0;
    for (const section of playlist.sections) {
      const songs = (section.songs || []).filter(s => !s.notFound);

      children.push(new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(section.name)] }));

      for (const song of songs) {
        children.push(new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun(song.title || 'Untitled')] }));

        // Key / Tempo meta line
        const metaParts = [];
        if (song.key) metaParts.push(`Key: ${song.key}`);
        if (song.tempo) metaParts.push(`Tempo: ${song.tempo}`);
        if (metaParts.length > 0) {
          children.push(new Paragraph({ children: [new TextRun({ text: metaParts.join(' | '), italics: true })] }));
        }

        // Lyrics — blank line between each lyric section to preserve original spacing
        if (song.lyrics) {
          for (let li = 0; li < song.lyrics.length; li++) {
            if (li > 0) {
              children.push(new Paragraph({ children: [new TextRun({ text: '' })] }));
            }
            const lyricSection = song.lyrics[li];
            const runs = [];
            for (let i = 0; i < lyricSection.lines.length; i++) {
              if (i > 0) runs.push(new TextRun({ text: lyricSection.lines[i], break: 1 }));
              else runs.push(new TextRun(lyricSection.lines[i]));
            }
            children.push(new Paragraph({ children: runs }));
          }
        }

        // Spacing after song lyrics (separator before next heading)
        songCount++;
        children.push(new Paragraph({ children: [new TextRun({ text: '' })] }));
        children.push(new Paragraph({ children: [new TextRun({ text: '___', color: 'CCCCCC' })] }));
        children.push(new Paragraph({ children: [new TextRun({ text: '' })] }));
      }
    }

    return children;
  }

  // GET /api/service-types
  router.get('/service-types', (req, res) => {
    res.json(getAllServiceTypes());
  });

  // GET /api/playlists
  router.get('/playlists', (req, res) => {
    let playlists = playlistStore.findAll();

    if (req.query.upcoming === 'true') {
      const today = new Date().toISOString().slice(0, 10);
      playlists = playlists
        .filter(p => p.date && p.date >= today)
        .sort((a, b) => a.date.localeCompare(b.date));
    } else {
      // Sort by date desc, dateless last
      playlists.sort((a, b) => {
        if (!a.date && !b.date) return 0;
        if (!a.date) return 1;
        if (!b.date) return -1;
        return b.date.localeCompare(a.date);
      });
    }

    res.json(playlists);
  });

  // POST /api/playlists
  router.post('/playlists', (req, res) => {
    const { name, type, date, theme, bibleLessons, googleDoc, notes, sections: customSections } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }
    if (!type) {
      return res.status(400).json({ error: 'Type is required' });
    }
    if (!isValidType(type)) {
      return res.status(400).json({ error: `Invalid service type: ${type}` });
    }

    let sections;
    if (type === 'custom') {
      if (!customSections || !Array.isArray(customSections) || customSections.length === 0) {
        return res.status(400).json({ error: 'Custom type requires a sections array' });
      }
      sections = customSections.map(s => ({ name: s.name, songIds: s.songIds || [] }));
    } else {
      const serviceType = getServiceType(type);
      sections = serviceType.sections.map(name => ({ name, songIds: [] }));
    }

    const playlist = playlistStore.create({ name: name.trim(), type, date, theme, bibleLessons, googleDoc, notes, sections });
    usageStore.syncForPlaylist(playlist);
    res.status(201).json(playlist);
  });

  // GET /api/playlists/:id
  router.get('/playlists/:id', (req, res) => {
    const playlist = playlistStore.findById(req.params.id);
    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    const resolved = {
      ...playlist,
      sections: playlist.sections.map(section => ({
        ...section,
        songs: resolveSongs(section.songIds),
      })),
    };

    res.json(resolved);
  });

  // GET /api/playlists/:id/export
  router.get('/playlists/:id/export', async (req, res) => {
    const playlist = playlistStore.findById(req.params.id);
    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    const resolved = {
      ...playlist,
      sections: playlist.sections.map(section => ({
        ...section,
        songs: resolveSongs(section.songIds),
      })),
    };

    const doc = new Document({
      sections: [{ children: buildDocContent(resolved) }],
    });

    const buffer = await Packer.toBuffer(doc);
    const filename = `${playlist.name.replace(/[^a-zA-Z0-9 _-]/g, '')}.docx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  });

  // PUT /api/playlists/:id
  router.put('/playlists/:id', (req, res) => {
    const updates = {};
    if (req.body.name !== undefined) updates.name = req.body.name;
    if (req.body.date !== undefined) updates.date = req.body.date;
    if (req.body.theme !== undefined) updates.theme = req.body.theme;
    if (req.body.bibleLessons !== undefined) updates.bibleLessons = req.body.bibleLessons;
    if (req.body.googleDoc !== undefined) updates.googleDoc = req.body.googleDoc;
    if (req.body.notes !== undefined) updates.notes = req.body.notes;
    if (req.body.sections !== undefined) updates.sections = req.body.sections;

    const updated = playlistStore.update(req.params.id, updates);
    if (!updated) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    usageStore.syncForPlaylist(updated);
    res.json(updated);
  });

  // DELETE /api/playlists/:id
  router.delete('/playlists/:id', (req, res) => {
    const removed = playlistStore.remove(req.params.id);
    if (!removed) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    usageStore.removeForPlaylist(req.params.id);
    res.status(204).end();
  });

  return router;
}

module.exports = { createPlaylistsRouter };
