## 1. Dependencies

- [x] 1.1 Add `better-sqlite3` to `package.json` dependencies and run `npm install`

## 2. Core Analytics Module

- [x] 2.1 Create `src/analyticsDb.js` — open DB, run DDL (`song_usage` table + indexes + `_migration` table)
- [x] 2.2 Implement `initialize(songsMap)` — run one-time migration from `usage.json` + `playlists.json`, enriching records with contextual fields
- [x] 2.3 Implement `syncForPlaylist(playlist, songsMap)` — delete + reinsert all rows for a playlist in a transaction, capturing `service_type`, `section_name`, `theme`, `bible_lessons`, `song_key`, `song_tempo`
- [x] 2.4 Implement `removeForPlaylist(playlistId)` — delete all rows for a given playlist ID
- [x] 2.5 Implement `getUsageForSong(songId)` — return `{songId, count, lastUsed, history}` (same shape as `usageStore`)
- [x] 2.6 Implement `getSongsUsedSince(dateStr)` — return distinct song IDs used on or after date
- [x] 2.7 Implement `getUsageSummary()` — return `{[songId]: {count, lastUsed}}` for all songs
- [x] 2.8 Implement `getSongUsageDetail(songId)` — return full enriched rows per usage event
- [x] 2.9 Implement `getUsageByServiceType(songId)` — return `[{serviceType, count}]` grouped, sorted by count desc
- [x] 2.10 Implement `getUsageBySection(songId)` — return `[{sectionName, count}]` grouped, sorted by count desc
- [x] 2.11 Implement `getSongFrequencyReport(sinceDate)` — return `[{songId, count, lastUsed}]` sorted by count desc, optional date filter

## 3. Server Integration

- [x] 3.1 Update `src/server.js` — require `analyticsDb`, build `songsMap` after `loadAllSongs`, call `analyticsDb.initialize(songsMap)`

## 4. Route Updates

- [x] 4.1 Update `src/routes/playlists.js` — replace `usageStore` with `analyticsDb`; build `songsMap` from `songs` param; pass to `syncForPlaylist`
- [x] 4.2 Update `src/routes/songs.js` — replace `usageStore` with `analyticsDb` for `/usage-summary`, `/used`, and `/:id/usage` endpoints
- [x] 4.3 Add analytics endpoints to `src/routes/songs.js`: `GET /api/songs/analytics/frequency`, `GET /api/songs/:id/analytics/by-service-type`, `GET /api/songs/:id/analytics/by-section`, `GET /api/songs/:id/analytics/detail`

## 5. Test Updates

- [x] 5.1 Update `test/playlists.test.js` — set `ANALYTICS_DB_PATH=:memory:` and clear `analyticsDb` from require cache in `before`/`beforeEach`
- [x] 5.2 Update `test/songsApi.test.js` — same isolation additions
- [x] 5.3 Update `test/songUsage.test.js` — same isolation additions
- [x] 5.4 Create `test/analyticsDb.test.js` — full test suite covering drop-in compatibility (same scenarios as `usageStore.test.js`) plus enriched-data assertions, analytics queries, and migration behavior

## 6. Verification

- [x] 6.1 Run `npm test` — all existing tests pass, all new `analyticsDb` tests pass
- [x] 6.2 Start server, create a dated playlist, verify `data/analytics.db` is created with enriched rows
- [x] 6.3 Verify migration: rename or backup `analytics.db`, restart server with existing `usage.json`, confirm records imported with enriched fields
