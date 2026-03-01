const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const VOLUME_PATH = process.env.VOLUME_PATH || path.join(__dirname, '..', 'volume');
const ANALYTICS_DIR = path.join(VOLUME_PATH, 'analytics');
const CONFIG_DIR = path.join(VOLUME_PATH, 'config');
const DB_PATH = process.env.ANALYTICS_DB_PATH || path.join(ANALYTICS_DIR, 'analytics.db');
const USAGE_FILE = path.join(CONFIG_DIR, 'usage.json');
const PLAYLISTS_FILE = path.join(CONFIG_DIR, 'playlists.json');

let db;

const MIGRATIONS = [
  // v1 — initial schema
  `CREATE TABLE IF NOT EXISTS song_usage (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      song_id       TEXT NOT NULL,
      playlist_id   TEXT NOT NULL,
      date          TEXT NOT NULL,
      service_type  TEXT,
      section_name  TEXT,
      theme         TEXT,
      bible_lessons TEXT,
      song_key      TEXT,
      song_tempo    TEXT,
      created_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    );
    CREATE INDEX IF NOT EXISTS idx_song_usage_song_id     ON song_usage(song_id);
    CREATE INDEX IF NOT EXISTS idx_song_usage_playlist_id ON song_usage(playlist_id);
    CREATE INDEX IF NOT EXISTS idx_song_usage_date        ON song_usage(date);
    CREATE TABLE IF NOT EXISTS _migration (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );`,
  // Future migrations: add new entries here, e.g.:
  // v2 — `ALTER TABLE song_usage ADD COLUMN new_col TEXT;`
];

function open() {
  fs.mkdirSync(ANALYTICS_DIR, { recursive: true });
  db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
}

function runMigrations() {
  const current = db.pragma('user_version', { simple: true });
  for (let i = current; i < MIGRATIONS.length; i++) {
    db.exec(MIGRATIONS[i]);
    db.pragma(`user_version = ${i + 1}`);
  }
}

// Called from server.js after songs are loaded — runs one-time migration
function initialize(songsMap) {
  const already = db.prepare("SELECT value FROM _migration WHERE key = 'usage_json_imported'").get();
  if (already) return;

  let usageRecords = [];
  try {
    usageRecords = JSON.parse(fs.readFileSync(USAGE_FILE, 'utf-8'));
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
  }

  let playlists = [];
  try {
    playlists = JSON.parse(fs.readFileSync(PLAYLISTS_FILE, 'utf-8'));
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
  }

  const playlistMap = new Map(playlists.map(p => [p.id, p]));

  const insert = db.prepare(`
    INSERT INTO song_usage (song_id, playlist_id, date, service_type, section_name, theme, bible_lessons, song_key, song_tempo)
    VALUES (@song_id, @playlist_id, @date, @service_type, @section_name, @theme, @bible_lessons, @song_key, @song_tempo)
  `);

  const migrate = db.transaction(() => {
    for (const record of usageRecords) {
      const playlist = playlistMap.get(record.playlistId);
      let section_name = null;
      let service_type = null;
      let theme = null;
      let bible_lessons = null;
      let song_key = null;
      let song_tempo = null;

      if (playlist) {
        service_type = playlist.type || null;
        theme = playlist.theme || null;
        bible_lessons = playlist.bibleLessons || null;
        const section = playlist.sections && playlist.sections.find(s => {
          const ids = s.songs ? s.songs.map(e => e.id) : (s.songIds || []);
          return ids.includes(record.songId);
        });
        section_name = section ? section.name : null;
      }

      if (songsMap) {
        const song = songsMap.get(record.songId);
        if (song) {
          song_key = song.key || null;
          song_tempo = song.tempo || null;
        }
      }

      insert.run({
        song_id: record.songId,
        playlist_id: record.playlistId,
        date: record.date,
        service_type,
        section_name,
        theme,
        bible_lessons,
        song_key,
        song_tempo,
      });
    }

    db.prepare("INSERT INTO _migration (key, value) VALUES ('usage_json_imported', '1')").run();
  });

  migrate();
}

// --- Drop-in replacements for usageStore ---

function syncForPlaylist(playlist, songsMap) {
  const del = db.prepare('DELETE FROM song_usage WHERE playlist_id = ?');
  const insert = db.prepare(`
    INSERT INTO song_usage (song_id, playlist_id, date, service_type, section_name, theme, bible_lessons, song_key, song_tempo)
    VALUES (@song_id, @playlist_id, @date, @service_type, @section_name, @theme, @bible_lessons, @song_key, @song_tempo)
  `);

  const sync = db.transaction(() => {
    del.run(playlist.id);

    if (!playlist.date) return;

    for (const section of playlist.sections) {
      const entries = section.songs
        ? section.songs
        : (section.songIds || []).map(id => ({ id, key: null, tempo: null, notes: null }));
      for (const entry of entries) {
        const songId = entry.id;
        let song_key = entry.key || null;
        let song_tempo = entry.tempo || null;
        if (songsMap && (!song_key || !song_tempo)) {
          const master = songsMap.get(songId);
          if (master) {
            song_key = song_key || master.key || null;
            song_tempo = song_tempo || master.tempo || null;
          }
        }

        insert.run({
          song_id: songId,
          playlist_id: playlist.id,
          date: playlist.date,
          service_type: playlist.type || null,
          section_name: section.name || null,
          theme: playlist.theme || null,
          bible_lessons: playlist.bibleLessons || null,
          song_key,
          song_tempo,
        });
      }
    }
  });

  sync();
}

function removeForPlaylist(playlistId) {
  db.prepare('DELETE FROM song_usage WHERE playlist_id = ?').run(playlistId);
}

function getUsageForSong(songId) {
  const rows = db.prepare(
    'SELECT playlist_id, date FROM song_usage WHERE song_id = ? ORDER BY date DESC'
  ).all(songId);

  return {
    songId,
    count: rows.length,
    lastUsed: rows.length > 0 ? rows[0].date : null,
    history: rows.map(r => ({ playlistId: r.playlist_id, date: r.date })),
  };
}

function getSongsUsedSince(dateStr) {
  const rows = db.prepare(
    'SELECT DISTINCT song_id FROM song_usage WHERE date >= ?'
  ).all(dateStr);
  return rows.map(r => r.song_id);
}

function getUsageSummary() {
  const rows = db.prepare(
    'SELECT song_id, COUNT(*) as count, MAX(date) as last_used FROM song_usage GROUP BY song_id'
  ).all();

  const summary = {};
  for (const row of rows) {
    summary[row.song_id] = { count: row.count, lastUsed: row.last_used };
  }
  return summary;
}

// --- New analytics queries ---

function getSongUsageDetail(songId) {
  return db.prepare(`
    SELECT playlist_id, date, service_type, section_name, theme, bible_lessons, song_key, song_tempo
    FROM song_usage WHERE song_id = ? ORDER BY date DESC
  `).all(songId).map(r => ({
    playlistId: r.playlist_id,
    date: r.date,
    serviceType: r.service_type,
    sectionName: r.section_name,
    theme: r.theme,
    bibleLessons: r.bible_lessons,
    songKey: r.song_key,
    songTempo: r.song_tempo,
  }));
}

function getUsageByServiceType(songId) {
  return db.prepare(`
    SELECT service_type, COUNT(*) as count
    FROM song_usage WHERE song_id = ?
    GROUP BY service_type ORDER BY count DESC
  `).all(songId).map(r => ({ serviceType: r.service_type, count: r.count }));
}

function getUsageBySection(songId) {
  return db.prepare(`
    SELECT section_name, COUNT(*) as count
    FROM song_usage WHERE song_id = ?
    GROUP BY section_name ORDER BY count DESC
  `).all(songId).map(r => ({ sectionName: r.section_name, count: r.count }));
}

function getSongFrequencyReport(sinceDate) {
  const query = sinceDate
    ? 'SELECT song_id, COUNT(*) as count, MAX(date) as last_used FROM song_usage WHERE date >= ? GROUP BY song_id ORDER BY count DESC'
    : 'SELECT song_id, COUNT(*) as count, MAX(date) as last_used FROM song_usage GROUP BY song_id ORDER BY count DESC';

  const rows = sinceDate
    ? db.prepare(query).all(sinceDate)
    : db.prepare(query).all();

  return rows.map(r => ({ songId: r.song_id, count: r.count, lastUsed: r.last_used }));
}

function _resetForTesting() {
  db.prepare('DELETE FROM song_usage').run();
  db.prepare("DELETE FROM _migration WHERE key = 'usage_json_imported'").run();
}

// Initialize DB on require
open();
runMigrations();

module.exports = {
  initialize,
  syncForPlaylist,
  removeForPlaylist,
  getUsageForSong,
  getSongsUsedSince,
  getUsageSummary,
  getSongUsageDetail,
  getUsageByServiceType,
  getUsageBySection,
  getSongFrequencyReport,
  _resetForTesting,
};
