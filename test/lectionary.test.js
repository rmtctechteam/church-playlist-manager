const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');

describe('GET /api/lectionary', () => {
  let server;
  let baseUrl;

  before(async () => {
    delete require.cache[require.resolve('../src/server')];
    const app = require('../src/server');
    await new Promise((resolve) => {
      server = app.listen(0, () => {
        baseUrl = `http://localhost:${server.address().port}`;
        resolve();
      });
    });
  });

  after(async () => {
    await new Promise((resolve) => server.close(resolve));
  });

  it('returns 400 when date parameter is missing', async () => {
    const res = await fetch(`${baseUrl}/api/lectionary`);
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.ok(body.error.includes('date'));
  });

  it('returns 404 for a date not in the lectionary', async () => {
    const res = await fetch(`${baseUrl}/api/lectionary?date=1900-01-01`);
    assert.equal(res.status, 404);
    const body = await res.json();
    assert.ok(body.error.includes('No lectionary entry'));
  });

  it('returns theme and bible lessons for a valid date', async () => {
    // Feb 2, 2026 — "Entry of our Lord to the temple"
    const res = await fetch(`${baseUrl}/api/lectionary?date=2026-02-02`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(body.theme, 'should have a theme');
    assert.ok(body.bibleLessons, 'should have bibleLessons');
    // Theme should be English only (no Malayalam characters)
    assert.ok(!body.theme.includes('കർത്താവ'), 'theme should not contain Malayalam');
    // Should have multiple lesson references
    assert.ok(body.bibleLessons.includes(','), 'should have multiple lessons');
  });
});
