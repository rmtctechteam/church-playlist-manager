const { describe, it, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

describe('Songs usage API endpoints', () => {
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

  // Helper to create a playlist with a song on a given date
  async function createPlaylistWithSong(songId, date) {
    const createRes = await fetch(`${baseUrl}/api/playlists`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: `Test ${date}`, type: 'holy-communion', date }),
    });
    const pl = await createRes.json();
    await fetch(`${baseUrl}/api/playlists/${pl.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sections: [
          { name: 'Opening', songIds: [songId] },
          { name: 'Bible Readings', songIds: [] },
          { name: 'Birthday/Wedding', songIds: [] },
          { name: 'Offertory', songIds: [] },
          { name: 'Communion', songIds: [] },
          { name: 'Closing', songIds: [] },
        ],
      }),
    });
    return pl;
  }

  describe('GET /api/songs/used', () => {
    it('returns 400 when since parameter is missing', async () => {
      const res = await fetch(`${baseUrl}/api/songs/used`);
      assert.equal(res.status, 400);
      const body = await res.json();
      assert.ok(body.error);
    });

    it('returns empty array when no songs used since date', async () => {
      const res = await fetch(`${baseUrl}/api/songs/used?since=2099-01-01`);
      assert.equal(res.status, 200);
      const ids = await res.json();
      assert.deepEqual(ids, []);
    });

    it('returns song IDs used on or after the given date', async () => {
      await createPlaylistWithSong('10000 Reasons', '2026-02-15');
      await createPlaylistWithSong('Amazing Grace', '2026-02-10');

      const res = await fetch(`${baseUrl}/api/songs/used?since=2026-02-14`);
      assert.equal(res.status, 200);
      const ids = await res.json();
      assert.deepEqual(ids, ['10000 Reasons']);
    });
  });

  describe('GET /api/songs/usage-summary', () => {
    it('returns empty object when no usage data exists', async () => {
      const res = await fetch(`${baseUrl}/api/songs/usage-summary`);
      assert.equal(res.status, 200);
      const summary = await res.json();
      assert.deepEqual(summary, {});
    });

    it('returns usage summary with count and lastUsed', async () => {
      await createPlaylistWithSong('10000 Reasons', '2026-02-10');
      await createPlaylistWithSong('10000 Reasons', '2026-02-15');

      const res = await fetch(`${baseUrl}/api/songs/usage-summary`);
      assert.equal(res.status, 200);
      const summary = await res.json();
      assert.equal(summary['10000 Reasons'].count, 2);
      assert.equal(summary['10000 Reasons'].lastUsed, '2026-02-15');
    });
  });
});
