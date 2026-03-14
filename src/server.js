require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const { loadAllSongs } = require('./songParser');
const { createSongsRouter } = require('./routes/songs');
const { createPlaylistsRouter } = require('./routes/playlists');
const { createLectionaryRouter } = require('./routes/lectionary');
const { createGoogleDocsRouter } = require('./routes/googleDocs');
const { createSuggestionsRouter } = require('./routes/suggestions');
const { router: authRouter } = require('./auth');
const analyticsDb = require('./analyticsDb');

const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;
const VOLUME_PATH = process.env.VOLUME_PATH || path.join(__dirname, '..', 'volume');
const SONGS_DIR = path.join(VOLUME_PATH, 'songs');
fs.mkdirSync(SONGS_DIR, { recursive: true });

// Parse JSON request bodies
app.use(express.json());

// Session middleware (before routes)
app.use(session({
  secret: process.env.SESSION_SECRET || 'church-playlist-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 },
}));

// Auth routes
app.use('/auth', authRouter);

// Load songs into memory
const songs = loadAllSongs(SONGS_DIR);
console.log(`Loaded ${songs.length} song(s) from ${SONGS_DIR}`);

// Initialize analytics DB and run one-time migration (after songs are loaded)
const songsMap = new Map(songs.map(s => [s.id, s]));
analyticsDb.initialize(songsMap);

// API routes (no auth gate — Google Doc endpoint handles its own auth check)
app.use('/api/songs', createSongsRouter(songs, SONGS_DIR));
app.use('/api', createPlaylistsRouter(songs));
app.use('/api/lectionary', createLectionaryRouter());
app.use('/api', createGoogleDocsRouter(songs));
app.use('/api', createSuggestionsRouter(songs));

// Serve static frontend files
app.use(express.static(path.join(__dirname, '..', 'public')));

// Only listen when run directly (not when required by tests)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

module.exports = app;
