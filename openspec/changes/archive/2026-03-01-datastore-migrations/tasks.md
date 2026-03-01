## 1. playlistStore.js — JSON Migration

- [x] 1.1 Add `CURRENT_VERSION = 1` constant to `src/playlistStore.js`
- [x] 1.2 Add `migrate(data)` function that handles legacy bare array (version 0) and wraps it in `{ version, records }` envelope
- [x] 1.3 Update `load()` to call `migrate()`, write back the file atomically if the version changed, and return `data.records`
- [x] 1.4 Update `save()` to write the `{ version, records }` envelope instead of a bare array
- [x] 1.5 Verify `findAll()`, `findById()`, `create()`, `update()`, and `remove()` still work correctly after the load/save shape change

## 2. usageStore.js — JSON Migration

- [x] 2.1 Add `CURRENT_VERSION = 1` constant to `src/usageStore.js`
- [x] 2.2 Add `migrate(data)` function that handles legacy bare array (version 0) and wraps it in `{ version, records }` envelope
- [x] 2.3 Update `load()` to call `migrate()`, write back atomically if version changed, and return `data.records`
- [x] 2.4 Update `save()` to write the `{ version, records }` envelope instead of a bare array
- [x] 2.5 Verify all exported functions (`getUsageForSong`, `syncForPlaylist`, `removeForPlaylist`, `getSongsUsedSince`, `getUsageSummary`) work correctly after the shape change

## 3. analyticsDb.js — SQLite Migration Runner

- [x] 3.1 Define `const MIGRATIONS` array with the existing initial schema (current `runDDL()` contents) as entry 0
- [x] 3.2 Implement `runMigrations()` using `PRAGMA user_version` — read current version, apply pending blocks in order, increment `user_version` after each
- [x] 3.3 Replace the `runDDL()` call at module load with `runMigrations()`
- [x] 3.4 Remove the old `runDDL()` function
- [x] 3.5 Verify that an existing `analytics.db` with `user_version = 0` upgrades cleanly to version 1 without errors (tables already exist, `IF NOT EXISTS` makes it safe)

## 4. Smoke Test

- [x] 4.1 Start the app locally against existing `data/playlists.json` (bare array) — confirm it migrates to envelope on load and the app works normally
- [x] 4.2 Restart the app — confirm no second migration occurs (version already current, no file rewrite)
- [x] 4.3 Confirm `data/usage.json` migrates to envelope on first load
- [x] 4.4 Confirm analytics queries (`/api/songs/:id/analytics`) still return correct data after migration
