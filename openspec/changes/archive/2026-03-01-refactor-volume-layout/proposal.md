## Why

The app currently uses two separate root-level directories (`data/` and `songs/`) which require two separate Railway volume mounts. Consolidating all persistent storage under a single volume root with clear subdirectories simplifies Railway configuration, makes backup and restore straightforward, and establishes a clean convention for future datastores.

## What Changes

- **BREAKING** — `SONGS_DIR` moves from `songs/` → `<volume>/songs/`
- **BREAKING** — `DATA_DIR` moves from `data/` → `<volume>/config/`
- **BREAKING** — `DB_PATH` moves from `data/analytics.db` → `<volume>/analytics/analytics.db`
- A single environment variable `VOLUME_PATH` controls the volume root (defaults to `./volume` for local dev)
- All path constants in `src/server.js`, `src/playlistStore.js`, `src/usageStore.js`, and `src/analyticsDb.js` are derived from `VOLUME_PATH`
- Railway configuration changes from two volume mounts to one (mounted at e.g. `/app/volume`)

**New directory layout:**
```
volume/
  config/       # playlists.json, usage.json
  songs/        # song .txt files
  analytics/    # analytics.db
```

## Capabilities

### New Capabilities

- `volume-layout`: Defines the unified volume directory structure, the `VOLUME_PATH` environment variable, and path resolution conventions for all datastores.

### Modified Capabilities

- `song-parser`: `SONGS_DIR` path source changes — now resolved from `VOLUME_PATH` instead of a hardcoded relative path. No change to parsing behaviour.
- `json-store-migrations`: `DATA_DIR` path source changes — now resolved from `VOLUME_PATH/config`. No change to migration behaviour.
- `sqlite-migrations`: `DB_PATH` now resolved from `VOLUME_PATH/analytics`. No change to migration behaviour.
- `datastore-migration-pattern`: Update convention — new datastores derive paths from `VOLUME_PATH` subdirectories.

## Impact

- `src/server.js` — `SONGS_DIR` derived from `VOLUME_PATH`
- `src/playlistStore.js` — `DATA_DIR` derived from `VOLUME_PATH/config`
- `src/usageStore.js` — `DATA_DIR` derived from `VOLUME_PATH/config`
- `src/analyticsDb.js` — `DATA_DIR` and `DB_PATH` derived from `VOLUME_PATH/analytics`
- `.env` — add `VOLUME_PATH` for local dev
- `README.md` — update deployment instructions; one volume mount instead of two
- Railway — reconfigure from two mounts to one mount at `/app/volume`
- Existing data on Railway volume must be migrated manually (copy files to new subdirectory layout)
- No API or frontend changes
- No new npm dependencies
