## Context

Currently the app uses two separate root-level directories:
- `songs/` — song `.txt` files (read by `src/server.js`, `src/songParser.js`)
- `data/` — `playlists.json`, `usage.json`, `analytics.db` (read by store modules)

On Railway this requires two separate volume mounts. Consolidating into one volume with subdirectories reduces operational complexity and aligns with the migration infrastructure added in the `datastore-migrations` change.

**Current paths:**
```
songs/                    → SONGS_DIR
data/playlists.json       → DATA_DIR + playlistStore
data/usage.json           → DATA_DIR + usageStore
data/analytics.db         → DB_PATH in analyticsDb
```

**Target paths (all under one volume root):**
```
volume/songs/             → SONGS_DIR
volume/config/            → DATA_DIR (playlists.json, usage.json)
volume/analytics/         → analytics.db
```

## Goals / Non-Goals

**Goals:**
- Single Railway volume mount covers all persistent data
- One env var (`VOLUME_PATH`) controls the volume root for all modules
- Local dev works without setting `VOLUME_PATH` (sensible default)
- Subdirectories are created automatically on startup if they don't exist

**Non-Goals:**
- Changing any data formats, APIs, or frontend behaviour
- Automating the Railway data migration (manual step, documented in migration plan)
- Moving the `openspec/` directory or any source code outside `src/`

## Decisions

### 1. Single `VOLUME_PATH` environment variable

All path constants are derived from one env var:

```js
const VOLUME_PATH = process.env.VOLUME_PATH || path.join(__dirname, '..', 'volume');
const SONGS_DIR   = path.join(VOLUME_PATH, 'songs');
const CONFIG_DIR  = path.join(VOLUME_PATH, 'config');
const ANALYTICS_DIR = path.join(VOLUME_PATH, 'analytics');
```

**Rationale:** One var to set in Railway, one var to document. Alternatives considered:
- Separate `SONGS_PATH`, `CONFIG_PATH`, `ANALYTICS_PATH` env vars — more flexible but more to configure; unnecessary at this scale
- Hardcode subdirectory names as env vars — overcomplicates Railway setup

### 2. Local dev default: `./volume`

`VOLUME_PATH` defaults to `path.join(__dirname, '..', 'volume')` — a new `volume/` directory at the project root. This replaces the separate `songs/` and `data/` directories for local dev.

**Existing local data migration:** developers copy their existing files:
```
songs/*.txt        → volume/songs/
data/playlists.json → volume/config/playlists.json
data/usage.json    → volume/config/usage.json
data/analytics.db  → volume/analytics/analytics.db
```

### 3. Path resolution centralised in each module

Each module resolves its own paths from `VOLUME_PATH` — no shared path utility module. This keeps modules self-contained and avoids circular dependencies.

- `src/server.js` — resolves `SONGS_DIR`
- `src/playlistStore.js` — resolves `CONFIG_DIR`
- `src/usageStore.js` — resolves `CONFIG_DIR`
- `src/analyticsDb.js` — resolves `ANALYTICS_DIR` and `DB_PATH`

### 4. `volume/` added to `.gitignore`, committed empty via `.gitkeep` files

`volume/songs/.gitkeep`, `volume/config/.gitkeep`, `volume/analytics/.gitkeep` are committed so the directory structure exists on Railway after deploy, before the volume is mounted.

## Risks / Trade-offs

- **Existing local dev data in `songs/` and `data/`** — developers must manually copy files to `volume/` subdirectories. Mitigation: document clearly in README and migration plan.
- **Railway volume migration** — existing Railway volume data must be copied to new subdirectory layout before deploying new code, or the app will start with empty stores. Mitigation: step-by-step migration plan below.
- **`analytics.db` path change** — `analyticsDb.js` currently supports `ANALYTICS_DB_PATH` env var override. This is preserved but now secondary to `VOLUME_PATH`.

## Migration Plan

### Railway (production)

1. Before deploying new code, use Railway shell to copy existing data:
   ```bash
   mkdir -p /app/volume/config /app/volume/songs /app/volume/analytics
   cp /app/data/playlists.json /app/volume/config/
   cp /app/data/usage.json /app/volume/config/
   cp /app/data/analytics.db /app/volume/analytics/
   cp /app/songs/*.txt /app/volume/songs/
   ```
2. Add `VOLUME_PATH=/app/volume` to Railway environment variables
3. Reconfigure Railway volumes: remove the two existing mounts, add one mount at `/app/volume`
4. Deploy new code
5. Verify app starts and data is intact

### Local dev

```bash
mkdir -p volume/songs volume/config volume/analytics
cp songs/*.txt volume/songs/
cp data/playlists.json volume/config/
cp data/usage.json volume/config/
cp data/analytics.db volume/analytics/
```

No `.env` change needed — `VOLUME_PATH` defaults to `./volume`.

## Open Questions

- Should the old `songs/` and `data/` directories be removed from the repo, or left as empty placeholders? (Recommendation: remove them from git tracking via `.gitignore` updates; the `volume/` structure replaces both.)
