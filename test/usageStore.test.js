const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

describe('usageStore', () => {
  const dataDir = path.join(__dirname, '..', 'data');
  const usageFile = path.join(dataDir, 'usage.json');
  let backup = null;

  beforeEach(() => {
    try {
      backup = fs.readFileSync(usageFile, 'utf-8');
    } catch (_) {
      backup = null;
    }
    try { fs.unlinkSync(usageFile); } catch (_) {}
    delete require.cache[require.resolve('../src/usageStore')];
  });

  afterEach(() => {
    if (backup !== null) {
      fs.writeFileSync(usageFile, backup);
    } else {
      try { fs.unlinkSync(usageFile); } catch (_) {}
    }
  });

  it('returns empty usage for unknown song', () => {
    const store = require('../src/usageStore');
    const usage = store.getUsageForSong('nonexistent');
    assert.equal(usage.count, 0);
    assert.equal(usage.lastUsed, null);
    assert.deepEqual(usage.history, []);
  });

  it('syncs usage for a playlist with a date', () => {
    const store = require('../src/usageStore');
    store.syncForPlaylist({
      id: 'pl1',
      date: '2026-02-15',
      sections: [
        { name: 'Gathering', songIds: ['songA', 'songB'] },
        { name: 'Sending', songIds: ['songC'] },
      ],
    });

    const usageA = store.getUsageForSong('songA');
    assert.equal(usageA.count, 1);
    assert.equal(usageA.lastUsed, '2026-02-15');

    const usageC = store.getUsageForSong('songC');
    assert.equal(usageC.count, 1);
  });

  it('does not create usage for dateless playlist', () => {
    const store = require('../src/usageStore');
    store.syncForPlaylist({
      id: 'pl2',
      date: null,
      sections: [{ name: 'S1', songIds: ['songX'] }],
    });

    const usage = store.getUsageForSong('songX');
    assert.equal(usage.count, 0);
  });

  it('updates usage when playlist songs change', () => {
    const store = require('../src/usageStore');

    // Initial sync
    store.syncForPlaylist({
      id: 'pl3',
      date: '2026-03-01',
      sections: [{ name: 'S1', songIds: ['songA', 'songB'] }],
    });

    // Update: remove songB, add songC
    store.syncForPlaylist({
      id: 'pl3',
      date: '2026-03-01',
      sections: [{ name: 'S1', songIds: ['songA', 'songC'] }],
    });

    assert.equal(store.getUsageForSong('songA').count, 1);
    assert.equal(store.getUsageForSong('songB').count, 0);
    assert.equal(store.getUsageForSong('songC').count, 1);
  });

  it('removes usage for a deleted playlist', () => {
    const store = require('../src/usageStore');

    store.syncForPlaylist({
      id: 'pl4',
      date: '2026-04-01',
      sections: [{ name: 'S1', songIds: ['songD'] }],
    });

    assert.equal(store.getUsageForSong('songD').count, 1);

    store.removeForPlaylist('pl4');
    assert.equal(store.getUsageForSong('songD').count, 0);
  });

  it('tracks usage across multiple playlists', () => {
    const store = require('../src/usageStore');

    store.syncForPlaylist({
      id: 'pl5',
      date: '2026-01-01',
      sections: [{ name: 'S1', songIds: ['songE'] }],
    });

    store.syncForPlaylist({
      id: 'pl6',
      date: '2026-02-01',
      sections: [{ name: 'S1', songIds: ['songE'] }],
    });

    const usage = store.getUsageForSong('songE');
    assert.equal(usage.count, 2);
    assert.equal(usage.lastUsed, '2026-02-01');
    assert.equal(usage.history[0].date, '2026-02-01');
    assert.equal(usage.history[1].date, '2026-01-01');
  });
});
