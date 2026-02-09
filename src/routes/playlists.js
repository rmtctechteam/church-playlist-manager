const express = require('express');
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
