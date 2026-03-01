const fs = require('fs');
const path = require('path');

const VOLUME_PATH = process.env.VOLUME_PATH || path.join(__dirname, '..', 'volume');
const DATA_DIR = path.join(VOLUME_PATH, 'config');
const USAGE_FILE = path.join(DATA_DIR, 'usage.json');

const CURRENT_VERSION = 1;

function migrate(data) {
  // Handle legacy bare array (version 0)
  if (Array.isArray(data)) {
    data = { version: 0, records: data };
  }

  let { version, records } = data;

  if (version < 1) {
    // Version 1: adopt versioned envelope — no record-level changes needed
    version = 1;
  }

  // Future: if (version < 2) { ... version = 2; }

  return { version, records };
}

function load() {
  let raw;
  try {
    raw = JSON.parse(fs.readFileSync(USAGE_FILE, 'utf-8'));
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }

  const before = Array.isArray(raw) ? 0 : raw.version;
  const migrated = migrate(raw);

  if (migrated.version !== before) {
    const tmp = USAGE_FILE + '.tmp';
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(tmp, JSON.stringify(migrated, null, 2));
    fs.renameSync(tmp, USAGE_FILE);
  }

  return migrated.records;
}

function save(records) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const tmp = USAGE_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify({ version: CURRENT_VERSION, records }, null, 2));
  fs.renameSync(tmp, USAGE_FILE);
}

function getUsageForSong(songId) {
  const records = load();
  const history = records
    .filter(r => r.songId === songId)
    .sort((a, b) => b.date.localeCompare(a.date));

  return {
    songId,
    count: history.length,
    lastUsed: history.length > 0 ? history[0].date : null,
    history: history.map(({ playlistId, date }) => ({ playlistId, date })),
  };
}

function syncForPlaylist(playlist) {
  const records = load();
  // Remove existing records for this playlist
  const filtered = records.filter(r => r.playlistId !== playlist.id);

  // Add new records if playlist has a date
  if (playlist.date) {
    for (const section of playlist.sections) {
      for (const songId of section.songIds) {
        filtered.push({
          songId,
          playlistId: playlist.id,
          date: playlist.date,
        });
      }
    }
  }

  save(filtered);
}

function removeForPlaylist(playlistId) {
  const records = load();
  const filtered = records.filter(r => r.playlistId !== playlistId);
  save(filtered);
}

function getSongsUsedSince(dateStr) {
  const records = load();
  const ids = new Set();
  for (const r of records) {
    if (r.date >= dateStr) ids.add(r.songId);
  }
  return [...ids];
}

function getUsageSummary() {
  const records = load();
  const summary = {};
  for (const r of records) {
    if (!summary[r.songId]) {
      summary[r.songId] = { count: 0, lastUsed: r.date };
    }
    summary[r.songId].count++;
    if (r.date > summary[r.songId].lastUsed) {
      summary[r.songId].lastUsed = r.date;
    }
  }
  return summary;
}

module.exports = { getUsageForSong, syncForPlaylist, removeForPlaylist, getSongsUsedSince, getUsageSummary };
