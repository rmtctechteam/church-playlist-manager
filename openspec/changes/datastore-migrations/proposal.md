## Why

The app is deployed on Railway with volume-mounted persistent storage for `data/`. Without a migration strategy, any change to the shape of `playlists.json`, `usage.json`, or `analytics.db` will silently break the app on startup — either crashing on unexpected fields or losing data. This feature establishes a durable, consistent migration pattern across all three datastores before future data model changes are made.

## What Changes

- Add versioned `migrate(data)` function to `src/playlistStore.js` — runs on every load, transforms old shapes to current shape, writes back if upgraded
- Add versioned `migrate(data)` function to `src/usageStore.js` — same pattern
- Add `PRAGMA user_version`-based DDL migration runner to `src/analyticsDb.js` — replaces ad-hoc `CREATE TABLE IF NOT EXISTS` with a numbered migration block system
- Add a `_migration` table (already exists in analytics.db) to track one-time data migrations separately from schema version
- Define a general datastore migration pattern spec that applies to any future datastores added to the app

## Capabilities

### New Capabilities

- `json-store-migrations`: Versioned startup migration for JSON file-based datastores (`playlists.json`, `usage.json`). Each store tracks a `version` field and runs sequential upgrade blocks on load.
- `sqlite-migrations`: `PRAGMA user_version`-based DDL migration runner for `analytics.db`. Each schema change is a numbered migration block applied in order on startup.
- `datastore-migration-pattern`: General pattern and conventions for adding migration support to any future datastore introduced to the app.

### Modified Capabilities

_(none — this is purely additive infrastructure)_

## Impact

- `src/playlistStore.js` — add `migrate(data)` called in `load()`, write back if version changed
- `src/usageStore.js` — add `migrate(data)` called in `load()`, write back if version changed
- `src/analyticsDb.js` — replace `runDDL()` with a migration runner using `PRAGMA user_version`
- `data/playlists.json` — gains a top-level `version` field on first migration run
- `data/usage.json` — gains a top-level `{ version, records }` wrapper on first migration run
- No API or frontend changes
- No new dependencies
