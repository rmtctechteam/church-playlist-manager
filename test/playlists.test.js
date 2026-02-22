const { describe, it, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

describe('playlist API routes', () => {
  const dataDir = path.join(__dirname, '..', 'data');
  const playlistsFile = path.join(dataDir, 'playlists.json');
  const usageFile = path.join(dataDir, 'usage.json');
  let server;
  let baseUrl;
  let plBackup = null;
  let usBackup = null;

  before(async () => {
    // Backup existing data files
    try { plBackup = fs.readFileSync(playlistsFile, 'utf-8'); } catch (_) { plBackup = null; }
    try { usBackup = fs.readFileSync(usageFile, 'utf-8'); } catch (_) { usBackup = null; }

    // Use in-memory SQLite for test isolation
    process.env.ANALYTICS_DB_PATH = ':memory:';

    // Clear data files BEFORE requiring server to prevent migration from importing real data
    try { fs.writeFileSync(playlistsFile, '[]'); } catch (_) {}
    try { fs.writeFileSync(usageFile, '[]'); } catch (_) {}

    // Clear module cache and start fresh
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
    // Clean data files before each test
    try { fs.writeFileSync(playlistsFile, '[]'); } catch (_) {}
    try { fs.writeFileSync(usageFile, '[]'); } catch (_) {}
    // Reset in-memory SQLite DB between tests
    try { require('../src/analyticsDb')._resetForTesting(); } catch (_) {}
  });

  after(async () => {
    await new Promise((resolve) => server.close(resolve));
    // Restore backups
    if (plBackup !== null) fs.writeFileSync(playlistsFile, plBackup);
    else try { fs.unlinkSync(playlistsFile); } catch (_) {}
    if (usBackup !== null) fs.writeFileSync(usageFile, usBackup);
    else try { fs.unlinkSync(usageFile); } catch (_) {}
  });

  it('GET /api/service-types returns all types', async () => {
    const res = await fetch(`${baseUrl}/api/service-types`);
    assert.equal(res.status, 200);
    const types = await res.json();
    assert.equal(types.length, 3);
    const ids = types.map(t => t.id).sort();
    assert.deepEqual(ids, ['acts', 'holy-communion', 'praise-and-worship']);
  });

  it('POST /api/playlists creates a playlist', async () => {
    const res = await fetch(`${baseUrl}/api/playlists`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test', type: 'acts' }),
    });
    assert.equal(res.status, 201);
    const pl = await res.json();
    assert.equal(pl.name, 'Test');
    assert.equal(pl.type, 'acts');
    assert.equal(pl.sections.length, 4);
    assert.equal(pl.sections[0].name, 'Adoration');
  });

  it('POST /api/playlists validates name required', async () => {
    const res = await fetch(`${baseUrl}/api/playlists`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'acts' }),
    });
    assert.equal(res.status, 400);
  });

  it('POST /api/playlists validates type required', async () => {
    const res = await fetch(`${baseUrl}/api/playlists`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test' }),
    });
    assert.equal(res.status, 400);
  });

  it('POST /api/playlists rejects invalid type', async () => {
    const res = await fetch(`${baseUrl}/api/playlists`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test', type: 'invalid' }),
    });
    assert.equal(res.status, 400);
  });

  it('POST /api/playlists creates custom type', async () => {
    const res = await fetch(`${baseUrl}/api/playlists`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Custom',
        type: 'custom',
        sections: [{ name: 'Intro' }, { name: 'Main' }],
      }),
    });
    assert.equal(res.status, 201);
    const pl = await res.json();
    assert.equal(pl.type, 'custom');
    assert.equal(pl.sections.length, 2);
    assert.equal(pl.sections[0].name, 'Intro');
  });

  it('GET /api/playlists returns sorted list', async () => {
    await fetch(`${baseUrl}/api/playlists`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Early', type: 'acts', date: '2026-01-01' }),
    });
    await fetch(`${baseUrl}/api/playlists`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Late', type: 'acts', date: '2026-12-01' }),
    });

    const res = await fetch(`${baseUrl}/api/playlists`);
    const list = await res.json();
    assert.equal(list.length, 2);
    assert.equal(list[0].name, 'Late');
    assert.equal(list[1].name, 'Early');
  });

  it('GET /api/playlists?upcoming=true filters future dates', async () => {
    await fetch(`${baseUrl}/api/playlists`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Past', type: 'acts', date: '2020-01-01' }),
    });
    await fetch(`${baseUrl}/api/playlists`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Future', type: 'acts', date: '2099-01-01' }),
    });

    const res = await fetch(`${baseUrl}/api/playlists?upcoming=true`);
    const list = await res.json();
    assert.equal(list.length, 1);
    assert.equal(list[0].name, 'Future');
  });

  it('GET /api/playlists/:id returns 404 for missing', async () => {
    const res = await fetch(`${baseUrl}/api/playlists/nonexistent`);
    assert.equal(res.status, 404);
  });

  it('GET /api/playlists/:id resolves songs', async () => {
    const createRes = await fetch(`${baseUrl}/api/playlists`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'With Songs', type: 'holy-communion' }),
    });
    const pl = await createRes.json();

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
          { name: 'Closing', songIds: ['nonexistent-song'] },
        ],
      }),
    });

    const res = await fetch(`${baseUrl}/api/playlists/${pl.id}`);
    const detail = await res.json();
    assert.ok(detail.sections[0].songs[0].title);
    assert.equal(detail.sections[5].songs[0].notFound, true);
  });

  it('PUT /api/playlists/:id updates', async () => {
    const createRes = await fetch(`${baseUrl}/api/playlists`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Original', type: 'acts' }),
    });
    const pl = await createRes.json();

    const res = await fetch(`${baseUrl}/api/playlists/${pl.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Updated' }),
    });
    assert.equal(res.status, 200);
    const updated = await res.json();
    assert.equal(updated.name, 'Updated');
  });

  it('PUT /api/playlists/:id returns 404 for missing', async () => {
    const res = await fetch(`${baseUrl}/api/playlists/nonexistent`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'X' }),
    });
    assert.equal(res.status, 404);
  });

  it('DELETE /api/playlists/:id removes', async () => {
    const createRes = await fetch(`${baseUrl}/api/playlists`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Delete Me', type: 'acts' }),
    });
    const pl = await createRes.json();

    const res = await fetch(`${baseUrl}/api/playlists/${pl.id}`, { method: 'DELETE' });
    assert.equal(res.status, 204);

    const getRes = await fetch(`${baseUrl}/api/playlists/${pl.id}`);
    assert.equal(getRes.status, 404);
  });

  it('DELETE /api/playlists/:id returns 404 for missing', async () => {
    const res = await fetch(`${baseUrl}/api/playlists/nonexistent`, { method: 'DELETE' });
    assert.equal(res.status, 404);
  });

  it('GET /api/playlists/:id/export returns a .docx file', async () => {
    const createRes = await fetch(`${baseUrl}/api/playlists`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Export Test', type: 'acts', date: '2026-03-01', theme: 'Grace' }),
    });
    const pl = await createRes.json();

    const res = await fetch(`${baseUrl}/api/playlists/${pl.id}/export`);
    assert.equal(res.status, 200);
    assert.equal(res.headers.get('content-type'), 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    assert.ok(res.headers.get('content-disposition').includes('Export Test.docx'));

    // .docx files are ZIP archives starting with PK magic bytes
    const buf = Buffer.from(await res.arrayBuffer());
    assert.ok(buf.length > 0);
    assert.equal(buf[0], 0x50); // 'P'
    assert.equal(buf[1], 0x4B); // 'K'
  });

  it('GET /api/playlists/:id/export returns 404 for missing', async () => {
    const res = await fetch(`${baseUrl}/api/playlists/nonexistent/export`);
    assert.equal(res.status, 404);
  });
});
