const { describe, it, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

describe('GET /api/songs/:id/usage', () => {
  const dataDir = path.join(__dirname, '..', 'data');
  const playlistsFile = path.join(dataDir, 'playlists.json');
  const usageFile = path.join(dataDir, 'usage.json');
  let server;
  let baseUrl;
  let plBackup = null;
  let usBackup = null;

  before(async () => {
    try { plBackup = fs.readFileSync(playlistsFile, 'utf-8'); } catch (_) { plBackup = null; }
    try { usBackup = fs.readFileSync(usageFile, 'utf-8'); } catch (_) { usBackup = null; }

    process.env.ANALYTICS_DB_PATH = ':memory:';

    // Clear data files BEFORE requiring server to prevent migration from importing real data
    try { fs.writeFileSync(playlistsFile, '[]'); } catch (_) {}
    try { fs.writeFileSync(usageFile, '[]'); } catch (_) {}

    delete require.cache[require.resolve('../src/playlistStore')];
    delete require.cache[require.resolve('../src/usageStore')];
    delete require.cache[require.resolve('../src/analyticsDb')];
    delete require.cache[require.resolve('../src/routes/playlists')];
    delete require.cache[require.resolve('../src/routes/songs')];
    delete require.cache[require.resolve('../src/server')];

    const app = require('../src/server');
    await new Promise((resolve) => {
      server = app.listen(0, () => {
        baseUrl = `http://localhost:${server.address().port}`;
        resolve();
      });
    });
  });

  beforeEach(() => {
    try { fs.writeFileSync(playlistsFile, '[]'); } catch (_) {}
    try { fs.writeFileSync(usageFile, '[]'); } catch (_) {}
    try { require('../src/analyticsDb')._resetForTesting(); } catch (_) {}
  });

  after(async () => {
    await new Promise((resolve) => server.close(resolve));
    if (plBackup !== null) fs.writeFileSync(playlistsFile, plBackup);
    else try { fs.unlinkSync(playlistsFile); } catch (_) {}
    if (usBackup !== null) fs.writeFileSync(usageFile, usBackup);
    else try { fs.unlinkSync(usageFile); } catch (_) {}
  });

  it('returns zero usage for unused song', async () => {
    const res = await fetch(`${baseUrl}/api/songs/10000%20Reasons/usage`);
    assert.equal(res.status, 200);
    const usage = await res.json();
    assert.equal(usage.count, 0);
    assert.equal(usage.lastUsed, null);
    assert.deepEqual(usage.history, []);
  });

  it('returns usage after song is added to a dated playlist', async () => {
    // Create a playlist with a date
    const createRes = await fetch(`${baseUrl}/api/playlists`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Usage Test',
        type: 'holy-communion',
        date: '2026-03-15',
      }),
    });
    const pl = await createRes.json();

    // Add song to a section
    await fetch(`${baseUrl}/api/playlists/${pl.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sections: [
          { name: 'Opening', songIds: ['10000 Reasons'] },
          { name: 'Bible Readings', songIds: [] },
          { name: 'Birthday/Wedding', songIds: [] },
          { name: 'Offertory', songIds: [] },
          { name: 'Communion', songIds: [] },
          { name: 'Closing', songIds: [] },
        ],
      }),
    });

    const res = await fetch(`${baseUrl}/api/songs/10000%20Reasons/usage`);
    const usage = await res.json();
    assert.equal(usage.count, 1);
    assert.equal(usage.lastUsed, '2026-03-15');
  });
});
