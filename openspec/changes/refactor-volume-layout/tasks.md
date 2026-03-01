## 1. Volume Directory Structure

- [x] 1.1 Create `volume/songs/`, `volume/config/`, and `volume/analytics/` directories with `.gitkeep` files
- [x] 1.2 Add `volume/` contents to `.gitignore` (keep `.gitkeep` files, ignore data files)
- [x] 1.3 Remove `songs/` and `data/` from git tracking (keep local files, update `.gitignore`)

## 2. Path Resolution — src/server.js

- [x] 2.1 Read `VOLUME_PATH` from `process.env.VOLUME_PATH` with default `path.join(__dirname, '..', 'volume')`
- [x] 2.2 Derive `SONGS_DIR` as `path.join(VOLUME_PATH, 'songs')` and pass to song loader

## 3. Path Resolution — src/playlistStore.js

- [x] 3.1 Read `VOLUME_PATH` from `process.env.VOLUME_PATH` with default `path.join(__dirname, '..', 'volume')`
- [x] 3.2 Set `DATA_DIR` to `path.join(VOLUME_PATH, 'config')` and update `PLAYLISTS_FILE` accordingly

## 4. Path Resolution — src/usageStore.js

- [x] 4.1 Read `VOLUME_PATH` from `process.env.VOLUME_PATH` with default `path.join(__dirname, '..', 'volume')`
- [x] 4.2 Set `DATA_DIR` to `path.join(VOLUME_PATH, 'config')` and update `USAGE_FILE` accordingly

## 5. Path Resolution — src/analyticsDb.js

- [x] 5.1 Read `VOLUME_PATH` from `process.env.VOLUME_PATH` with default `path.join(__dirname, '..', 'volume')`
- [x] 5.2 Set `ANALYTICS_DIR` to `path.join(VOLUME_PATH, 'analytics')` and update `DB_PATH` accordingly
- [x] 5.3 Ensure `ANALYTICS_DIR` is created with `mkdirSync` before opening the database

## 6. Local Dev Data Migration

- [x] 6.1 Copy existing local song files from `songs/*.txt` to `volume/songs/`
- [x] 6.2 Copy `data/playlists.json` to `volume/config/playlists.json`
- [x] 6.3 Copy `data/usage.json` to `volume/config/usage.json`
- [x] 6.4 Copy `data/analytics.db` to `volume/analytics/analytics.db`

## 7. Smoke Test

- [x] 7.1 Start app locally — confirm songs load from `volume/songs/`
- [x] 7.2 Confirm playlists load and save correctly from `volume/config/`
- [x] 7.3 Confirm analytics DB opens from `volume/analytics/analytics.db`
- [x] 7.4 Restart app — confirm no errors and data persists

## 8. Documentation

- [x] 8.1 Update `README.md` — replace two-volume Railway setup with single volume at `/app/volume` and `VOLUME_PATH` env var
- [x] 8.2 Update `.env` example in README to include `VOLUME_PATH` (optional for local dev)
