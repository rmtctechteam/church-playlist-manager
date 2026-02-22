## Why

The current usage tracking system stores only three fields per event (`songId`, `playlistId`, `date`) in a flat JSON file, making it impossible to answer meaningful questions like "which songs do we use most for Communion?" or "what songs correlate with this theme?" Replacing the JSON store with SQLite enables rich, queryable analytics while the data is still fresh enough to migrate cleanly.

## What Changes

- **NEW**: SQLite database (`data/analytics.db`) replaces `data/usage.json` as the usage storage backend
- **NEW**: Each usage record captures six additional contextual fields: `service_type`, `section_name`, `theme`, `bible_lessons`, `song_key`, `song_tempo`
- **NEW**: Analytics query API — usage grouped by service type, section, and song frequency reports
- **NEW**: One-time migration imports existing `usage.json` records, enriched from `playlists.json` and in-memory song data
- **MODIFIED**: `syncForPlaylist` now accepts the songs map to capture key/tempo at time of recording
- **MODIFIED**: Usage storage spec — storage backend changes from `data/usage.json` to `data/analytics.db`; atomic-file-write requirement replaced by SQLite transaction guarantee

## Capabilities

### New Capabilities
- `song-analytics`: Rich analytics queries over song usage — frequency reports, grouping by service type and section, enriched per-event data including theme, bible lessons, key, and tempo

### Modified Capabilities
- `song-usage-tracking`: Storage backend changes from `data/usage.json` (atomic JSON file writes) to `data/analytics.db` (SQLite via `better-sqlite3`); API response shapes remain identical; additional context fields are captured per usage event

## Impact

- **New dependency**: `better-sqlite3` npm package (native addon, rebuilds on Railway deploy)
- **Files modified**: `src/server.js`, `src/routes/playlists.js`, `src/routes/songs.js`
- **New file**: `src/analyticsDb.js`
- **Storage**: `data/analytics.db` (already gitignored via `data/` rule)
- **Tests**: Existing integration tests need `ANALYTICS_DB_PATH=:memory:` isolation; new `test/analyticsDb.test.js` covers full API
- **Backward compatibility**: `src/usageStore.js` and `data/usage.json` remain on disk but are no longer the active store
