const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const USAGE_FILE = path.join(DATA_DIR, 'usage.json');

function load() {
  try {
    const data = fs.readFileSync(USAGE_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }
}

function save(records) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const tmp = USAGE_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(records, null, 2));
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
