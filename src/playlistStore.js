const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.join(__dirname, '..', 'data');
const PLAYLISTS_FILE = path.join(DATA_DIR, 'playlists.json');

function normaliseSections(sections) {
  if (!Array.isArray(sections)) return sections;
  return sections.map(section => {
    if (section.songs) return section;
    const songIds = section.songIds || [];
    return { ...section, songs: songIds.map(id => ({ id, key: null, tempo: null, notes: null })) };
  });
}

function load() {
  try {
    const data = fs.readFileSync(PLAYLISTS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }
}

function save(playlists) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const tmp = PLAYLISTS_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(playlists, null, 2));
  fs.renameSync(tmp, PLAYLISTS_FILE);
}

function findAll() {
  return load().map(p => ({ ...p, sections: normaliseSections(p.sections) }));
}

function findById(id) {
  const p = load().find(p => p.id === id);
  if (!p) return null;
  return { ...p, sections: normaliseSections(p.sections) };
}

function create(playlist) {
  const now = new Date().toISOString();
  const newPlaylist = {
    id: crypto.randomUUID(),
    name: playlist.name,
    type: playlist.type,
    date: playlist.date || null,
    sections: playlist.sections,
    theme: playlist.theme || null,
    bibleLessons: playlist.bibleLessons || null,
    googleDoc: playlist.googleDoc || null,
    notes: playlist.notes || null,
    createdAt: now,
    updatedAt: now,
  };
  const playlists = load();
  playlists.push(newPlaylist);
  save(playlists);
  return newPlaylist;
}

function update(id, updates) {
  const playlists = load();
  const index = playlists.findIndex(p => p.id === id);
  if (index === -1) return null;

  const existing = playlists[index];
  if (updates.name !== undefined) existing.name = updates.name;
  if (updates.date !== undefined) existing.date = updates.date;
  if (updates.sections !== undefined) existing.sections = updates.sections;
  if (updates.theme !== undefined) existing.theme = updates.theme;
  if (updates.bibleLessons !== undefined) existing.bibleLessons = updates.bibleLessons;
  if (updates.googleDoc !== undefined) existing.googleDoc = updates.googleDoc;
  if (updates.notes !== undefined) existing.notes = updates.notes;
  existing.updatedAt = new Date().toISOString();

  playlists[index] = existing;
  save(playlists);
  return existing;
}

function remove(id) {
  const playlists = load();
  const index = playlists.findIndex(p => p.id === id);
  if (index === -1) return false;
  playlists.splice(index, 1);
  save(playlists);
  return true;
}

module.exports = { findAll, findById, create, update, remove };
