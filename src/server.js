const express = require('express');
const path = require('path');
const { loadAllSongs } = require('./songParser');
const { createSongsRouter } = require('./routes/songs');
const { createPlaylistsRouter } = require('./routes/playlists');
const { createLectionaryRouter } = require('./routes/lectionary');
const analyticsDb = require('./analyticsDb');

const app = express();
const PORT = process.env.PORT || 3000;
const SONGS_DIR = path.join(__dirname, '..', 'songs');

// Parse JSON request bodies
app.use(express.json());

// Load songs into memory
const songs = loadAllSongs(SONGS_DIR);
console.log(`Loaded ${songs.length} song(s) from ${SONGS_DIR}`);

// Initialize analytics DB and run one-time migration (after songs are loaded)
const songsMap = new Map(songs.map(s => [s.id, s]));
analyticsDb.initialize(songsMap);

// API routes
app.use('/api/songs', createSongsRouter(songs));
app.use('/api', createPlaylistsRouter(songs));
app.use('/api/lectionary', createLectionaryRouter());

// Serve static frontend files
app.use(express.static(path.join(__dirname, '..', 'public')));

// Only listen when run directly (not when required by tests)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

module.exports = app;
