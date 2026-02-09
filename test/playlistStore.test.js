const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const os = require('os');

// We need to override the data dir. The simplest approach is to test the
// store by directly manipulating the file it reads/writes. Since the store
// hardcodes the path, we'll test at the integration level.
// Instead, let's write a helper that reimplements the store logic for a temp dir.
// Actually, let's just test the real store by temporarily setting up its data file.

describe('playlistStore', () => {
  const dataDir = path.join(__dirname, '..', 'data');
  const playlistsFile = path.join(dataDir, 'playlists.json');
  let backup = null;

  beforeEach(() => {
    // Backup existing file if present
    try {
      backup = fs.readFileSync(playlistsFile, 'utf-8');
    } catch (_) {
      backup = null;
    }
    // Start clean
    try { fs.unlinkSync(playlistsFile); } catch (_) {}
    // Clear require cache so module re-reads
    delete require.cache[require.resolve('../src/playlistStore')];
  });

  afterEach(() => {
    // Restore backup
    if (backup !== null) {
      fs.writeFileSync(playlistsFile, backup);
    } else {
      try { fs.unlinkSync(playlistsFile); } catch (_) {}
    }
  });

  it('returns empty array when no file exists', () => {
    const store = require('../src/playlistStore');
    assert.deepEqual(store.findAll(), []);
  });

  it('creates a playlist with generated fields', () => {
    const store = require('../src/playlistStore');
    const pl = store.create({
      name: 'Test',
      type: 'acts',
      sections: [{ name: 'Adoration', songIds: [] }],
    });

    assert.ok(pl.id);
    assert.equal(pl.name, 'Test');
    assert.equal(pl.type, 'acts');
    assert.ok(pl.createdAt);
    assert.ok(pl.updatedAt);
    assert.equal(pl.date, null);
    assert.equal(pl.notes, null);
  });

  it('persists and retrieves playlists', () => {
    const store = require('../src/playlistStore');
    const created = store.create({
      name: 'Persist Test',
      type: 'holy-communion',
      sections: [{ name: 'Gathering', songIds: ['song1'] }],
    });

    const found = store.findById(created.id);
    assert.equal(found.name, 'Persist Test');
    assert.deepEqual(found.sections[0].songIds, ['song1']);
  });

  it('updates a playlist', () => {
    const store = require('../src/playlistStore');
    const created = store.create({
      name: 'Original',
      type: 'acts',
      sections: [{ name: 'Adoration', songIds: [] }],
    });

    const updated = store.update(created.id, { name: 'Updated', date: '2026-03-01' });
    assert.equal(updated.name, 'Updated');
    assert.equal(updated.date, '2026-03-01');
    assert.notEqual(updated.updatedAt, created.updatedAt);
  });

  it('returns null when updating non-existent playlist', () => {
    const store = require('../src/playlistStore');
    assert.equal(store.update('nonexistent', { name: 'X' }), null);
  });

  it('deletes a playlist', () => {
    const store = require('../src/playlistStore');
    const created = store.create({
      name: 'Delete Me',
      type: 'acts',
      sections: [],
    });

    assert.equal(store.remove(created.id), true);
    assert.equal(store.findById(created.id), null);
  });

  it('returns false when deleting non-existent playlist', () => {
    const store = require('../src/playlistStore');
    assert.equal(store.remove('nonexistent'), false);
  });

  it('writes atomically (temp file + rename)', () => {
    const store = require('../src/playlistStore');
    store.create({ name: 'Atomic', type: 'acts', sections: [] });

    // The file should exist and be valid JSON
    const content = fs.readFileSync(playlistsFile, 'utf-8');
    const data = JSON.parse(content);
    assert.equal(data.length, 1);
    assert.equal(data[0].name, 'Atomic');

    // No .tmp file should remain
    assert.equal(fs.existsSync(playlistsFile + '.tmp'), false);
  });
});
