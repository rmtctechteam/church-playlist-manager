const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');

// Use in-memory DB for all tests
process.env.ANALYTICS_DB_PATH = ':memory:';

function freshDb() {
  delete require.cache[require.resolve('../src/analyticsDb')];
  return require('../src/analyticsDb');
}

const SONGS_MAP = new Map([
  ['Amazing Grace', { id: 'Amazing Grace', key: 'G', tempo: '72' }],
  ['Holy Forever', { id: 'Holy Forever', key: 'C', tempo: '80' }],
  ['10000 Reasons', { id: '10000 Reasons', key: 'G', tempo: '73' }],
]);

const PLAYLIST_1 = {
  id: 'pl-test-1',
  date: '2026-03-01',
  type: 'holy-communion',
  theme: 'Grace and Mercy',
  bibleLessons: 'John 3:16, Romans 8:1',
  sections: [
    { name: 'Opening', songIds: ['Amazing Grace'] },
    { name: 'Communion', songIds: ['Holy Forever'] },
  ],
};

const PLAYLIST_2 = {
  id: 'pl-test-2',
  date: '2026-03-08',
  type: 'acts',
  theme: null,
  bibleLessons: null,
  sections: [
    { name: 'Adoration', songIds: ['Amazing Grace', '10000 Reasons'] },
  ],
};

describe('analyticsDb — drop-in compatibility', () => {
  let db;
  beforeEach(() => { db = freshDb(); });

  it('returns empty usage for unknown song', () => {
    const usage = db.getUsageForSong('nonexistent');
    assert.equal(usage.songId, 'nonexistent');
    assert.equal(usage.count, 0);
    assert.equal(usage.lastUsed, null);
    assert.deepEqual(usage.history, []);
  });

  it('syncForPlaylist records usage for a dated playlist', () => {
    db.syncForPlaylist(PLAYLIST_1, SONGS_MAP);

    const grace = db.getUsageForSong('Amazing Grace');
    assert.equal(grace.count, 1);
    assert.equal(grace.lastUsed, '2026-03-01');
    assert.equal(grace.history[0].playlistId, 'pl-test-1');
    assert.equal(grace.history[0].date, '2026-03-01');
  });

  it('does not create usage for dateless playlist', () => {
    db.syncForPlaylist({ ...PLAYLIST_1, date: null }, SONGS_MAP);
    assert.equal(db.getUsageForSong('Amazing Grace').count, 0);
  });

  it('syncForPlaylist replaces existing rows on update', () => {
    db.syncForPlaylist(PLAYLIST_1, SONGS_MAP);
    // Update: remove Holy Forever, add 10000 Reasons
    const updated = {
      ...PLAYLIST_1,
      sections: [
        { name: 'Opening', songIds: ['Amazing Grace'] },
        { name: 'Communion', songIds: ['10000 Reasons'] },
      ],
    };
    db.syncForPlaylist(updated, SONGS_MAP);

    assert.equal(db.getUsageForSong('Amazing Grace').count, 1);
    assert.equal(db.getUsageForSong('Holy Forever').count, 0);
    assert.equal(db.getUsageForSong('10000 Reasons').count, 1);
  });

  it('removeForPlaylist deletes all rows for that playlist', () => {
    db.syncForPlaylist(PLAYLIST_1, SONGS_MAP);
    assert.equal(db.getUsageForSong('Amazing Grace').count, 1);
    db.removeForPlaylist('pl-test-1');
    assert.equal(db.getUsageForSong('Amazing Grace').count, 0);
  });

  it('tracks usage across multiple playlists — count and lastUsed correct', () => {
    db.syncForPlaylist(PLAYLIST_1, SONGS_MAP); // Amazing Grace on 2026-03-01
    db.syncForPlaylist(PLAYLIST_2, SONGS_MAP); // Amazing Grace on 2026-03-08

    const usage = db.getUsageForSong('Amazing Grace');
    assert.equal(usage.count, 2);
    assert.equal(usage.lastUsed, '2026-03-08');
    assert.equal(usage.history[0].date, '2026-03-08');
    assert.equal(usage.history[1].date, '2026-03-01');
  });

  it('getSongsUsedSince returns correct song IDs', () => {
    db.syncForPlaylist(PLAYLIST_1, SONGS_MAP); // 2026-03-01
    db.syncForPlaylist(PLAYLIST_2, SONGS_MAP); // 2026-03-08

    const ids = db.getSongsUsedSince('2026-03-05');
    assert.ok(ids.includes('Amazing Grace'));
    assert.ok(ids.includes('10000 Reasons'));
    assert.ok(!ids.includes('Holy Forever'));
  });

  it('getUsageSummary returns count and lastUsed for all songs', () => {
    db.syncForPlaylist(PLAYLIST_1, SONGS_MAP);
    db.syncForPlaylist(PLAYLIST_2, SONGS_MAP);

    const summary = db.getUsageSummary();
    assert.equal(summary['Amazing Grace'].count, 2);
    assert.equal(summary['Amazing Grace'].lastUsed, '2026-03-08');
    assert.equal(summary['Holy Forever'].count, 1);
    assert.equal(summary['Holy Forever'].lastUsed, '2026-03-01');
  });
});

describe('analyticsDb — enriched data', () => {
  let db;
  beforeEach(() => { db = freshDb(); });

  it('syncForPlaylist captures service_type from playlist.type', () => {
    db.syncForPlaylist(PLAYLIST_1, SONGS_MAP);
    const detail = db.getSongUsageDetail('Amazing Grace');
    assert.equal(detail[0].serviceType, 'holy-communion');
  });

  it('syncForPlaylist captures section_name per song position', () => {
    db.syncForPlaylist(PLAYLIST_1, SONGS_MAP);
    const graceDetail = db.getSongUsageDetail('Amazing Grace');
    assert.equal(graceDetail[0].sectionName, 'Opening');

    const foreverDetail = db.getSongUsageDetail('Holy Forever');
    assert.equal(foreverDetail[0].sectionName, 'Communion');
  });

  it('syncForPlaylist captures theme and bible_lessons', () => {
    db.syncForPlaylist(PLAYLIST_1, SONGS_MAP);
    const detail = db.getSongUsageDetail('Amazing Grace');
    assert.equal(detail[0].theme, 'Grace and Mercy');
    assert.equal(detail[0].bibleLessons, 'John 3:16, Romans 8:1');
  });

  it('syncForPlaylist captures song_key and song_tempo from songsMap', () => {
    db.syncForPlaylist(PLAYLIST_1, SONGS_MAP);
    const detail = db.getSongUsageDetail('Amazing Grace');
    assert.equal(detail[0].songKey, 'G');
    assert.equal(detail[0].songTempo, '72');
  });

  it('syncForPlaylist stores null for song_key when song not in map', () => {
    db.syncForPlaylist(PLAYLIST_1, new Map()); // empty map
    const detail = db.getSongUsageDetail('Amazing Grace');
    assert.equal(detail[0].songKey, null);
    assert.equal(detail[0].songTempo, null);
  });

  it('syncForPlaylist stores null theme/bible_lessons when playlist has none', () => {
    db.syncForPlaylist(PLAYLIST_2, SONGS_MAP);
    const detail = db.getSongUsageDetail('10000 Reasons');
    assert.equal(detail[0].theme, null);
    assert.equal(detail[0].bibleLessons, null);
  });
});

describe('analyticsDb — analytics queries', () => {
  let db;
  beforeEach(() => {
    db = freshDb();
    db.syncForPlaylist(PLAYLIST_1, SONGS_MAP); // Amazing Grace: Opening, holy-communion
    db.syncForPlaylist(PLAYLIST_2, SONGS_MAP); // Amazing Grace: Adoration, acts
  });

  it('getUsageByServiceType returns grouped counts', () => {
    const result = db.getUsageByServiceType('Amazing Grace');
    assert.equal(result.length, 2);
    // Both appear once; order may vary since counts are equal
    const types = result.map(r => r.serviceType).sort();
    assert.deepEqual(types, ['acts', 'holy-communion']);
    assert.ok(result.every(r => r.count === 1));
  });

  it('getUsageBySection returns grouped counts', () => {
    const result = db.getUsageBySection('Amazing Grace');
    const sections = result.map(r => r.sectionName).sort();
    assert.deepEqual(sections, ['Adoration', 'Opening']);
  });

  it('getSongFrequencyReport returns songs sorted by count DESC', () => {
    const report = db.getSongFrequencyReport(null);
    // Amazing Grace used 2 times, others 1 time each
    assert.equal(report[0].songId, 'Amazing Grace');
    assert.equal(report[0].count, 2);
    assert.equal(report[0].lastUsed, '2026-03-08');
  });

  it('getSongFrequencyReport filters by sinceDate', () => {
    const report = db.getSongFrequencyReport('2026-03-05');
    // Only PLAYLIST_2 (2026-03-08) qualifies
    const ids = report.map(r => r.songId);
    assert.ok(ids.includes('Amazing Grace'));
    assert.ok(ids.includes('10000 Reasons'));
    assert.ok(!ids.includes('Holy Forever'));
    // Amazing Grace count is 1 within this window
    const grace = report.find(r => r.songId === 'Amazing Grace');
    assert.equal(grace.count, 1);
  });

  it('getUsageByServiceType returns empty array for unused song', () => {
    assert.deepEqual(db.getUsageByServiceType('nonexistent'), []);
  });

  it('getUsageBySection returns empty array for unused song', () => {
    assert.deepEqual(db.getUsageBySection('nonexistent'), []);
  });

  it('getSongUsageDetail returns empty array for unused song', () => {
    assert.deepEqual(db.getSongUsageDetail('nonexistent'), []);
  });
});

describe('analyticsDb — migration', () => {
  const fs = require('fs');
  const path = require('path');
  const dataDir = path.join(__dirname, '..', 'data');
  const usageFile = path.join(dataDir, 'usage.json');
  const playlistsFile = path.join(dataDir, 'playlists.json');
  let usageBackup = null;
  let playlistsBackup = null;

  beforeEach(() => {
    try { usageBackup = fs.readFileSync(usageFile, 'utf-8'); } catch (_) { usageBackup = null; }
    try { playlistsBackup = fs.readFileSync(playlistsFile, 'utf-8'); } catch (_) { playlistsBackup = null; }
    try { fs.writeFileSync(usageFile, '[]'); } catch (_) {}
    try { fs.writeFileSync(playlistsFile, '[]'); } catch (_) {}
  });

  afterEach(() => {
    if (usageBackup !== null) fs.writeFileSync(usageFile, usageBackup);
    else { try { fs.unlinkSync(usageFile); } catch (_) {} }
    if (playlistsBackup !== null) fs.writeFileSync(playlistsFile, playlistsBackup);
    else { try { fs.unlinkSync(playlistsFile); } catch (_) {} }
  });

  it('initialize() with no usage.json proceeds without error', () => {
    fs.unlinkSync(usageFile);
    const db = freshDb();
    assert.doesNotThrow(() => db.initialize(SONGS_MAP));
  });

  it('initialize() is idempotent — second call is a no-op', () => {
    const db = freshDb();
    db.initialize(SONGS_MAP);
    assert.doesNotThrow(() => db.initialize(SONGS_MAP));
  });

  it('getUsageSummary returns empty object with no data', () => {
    const db = freshDb();
    db.initialize(SONGS_MAP);
    const summary = db.getUsageSummary();
    assert.deepEqual(summary, {});
  });
});
