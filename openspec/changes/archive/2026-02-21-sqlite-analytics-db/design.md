## Context

Song usage is currently tracked in `data/usage.json` as a flat array of `{songId, playlistId, date}` records, managed by `src/usageStore.js`. The system supports basic queries (count, lastUsed, songs since date) but cannot answer analytical questions like "which songs are used most in Communion?" or "what songs pair with Lenten themes?" SQLite provides the relational query capability needed without adding infrastructure.

## Goals / Non-Goals

**Goals:**
- Replace `data/usage.json` with `data/analytics.db` (SQLite) as the active usage store
- Capture six additional contextual fields per usage event: `service_type`, `section_name`, `theme`, `bible_lessons`, `song_key`, `song_tempo`
- Maintain identical API response shapes so no frontend changes are required
- One-time migration of existing `usage.json` records, enriched from `playlists.json` and in-memory song data
- Enable analytical queries grouped by service type and section

**Non-Goals:**
- Frontend analytics dashboard (no UI changes in this change)
- External database server
- Removing or deprecating `usageStore.js` or `usage.json` (left intact for safety)

## Decisions

### 1. `better-sqlite3` over `sqlite3` or `sql.js`
`better-sqlite3` uses a synchronous API that matches the rest of the codebase (no async/await anywhere in `usageStore.js` callers). The async `sqlite3` package would require refactoring all call sites. `better-sqlite3` is also significantly faster for small embedded use cases. Trade-off: native addon requires compilation, which Railway handles automatically via `npm install` in the build step.

### 2. DB path configurable via `ANALYTICS_DB_PATH` env var
Setting `process.env.ANALYTICS_DB_PATH = ':memory:'` before re-requiring `analyticsDb.js` in tests creates an isolated in-memory database per test suite — no temp files, no cleanup needed. This requires a one-line addition to three existing integration test files rather than restructuring their setup.

### 3. `initialize(songsMap)` explicit call from `server.js`
Songs are loaded from disk after modules are `require`d. The module opens the DB and runs DDL on `require`, but defers migration to `initialize(songsMap)` so that song key/tempo can be looked up during the one-time import. `server.js` calls `analyticsDb.initialize(songsMap)` immediately after `loadAllSongs`.

### 4. `syncForPlaylist(playlist, songsMap)` accepts songsMap as second argument
Adds a `songsMap` parameter so `song_key` and `song_tempo` are captured at sync time. The existing `playlists.js` route already receives the `songs` array as a router-level parameter — a local `Map` is built once per router instantiation.

### 5. Store `date` as `TEXT YYYY-MM-DD`
Matches the existing convention in `usage.json`. SQLite TEXT comparisons on ISO dates are lexicographically correct, so `WHERE date >= ?` works without conversion.

### 6. `_migration` table to gate one-time import
A dedicated `_migration` table with a single `{key: 'usage_json_imported', value: '1'}` row prevents the import from running on subsequent server restarts. The migration itself runs inside a single SQLite transaction.

## Risks / Trade-offs

- **Native addon on Railway**: `better-sqlite3` must be compiled for the Railway Linux environment. Since `node_modules/` is not committed, Railway's build step runs `npm install` which triggers compilation. If Railway's build container lacks `python3` or `make`, the build will fail. → Mitigation: verify Railway build logs after first deploy; fallback is to add a `postinstall` script.
- **In-memory DB isolation in tests**: Each `delete require.cache` + re-require opens a fresh in-memory DB, meaning the `_migration` flag is never found — migration runs on every re-require in tests. Migration is safe to re-run (no-op if `usage.json` is `[]`) but adds test overhead. → Acceptable; migration with empty data is instant.
- **Duplicate songId within a section**: A song can appear twice in the same section (confirmed in real data). `syncForPlaylist` iterates `section.songIds` without de-duplicating, writing one row per occurrence — consistent with the existing `usageStore` behavior.

## Migration Plan

1. On `analyticsDb.initialize(songsMap)`: check `_migration` table for `usage_json_imported` flag
2. If absent: read `data/usage.json` and `data/playlists.json` from disk
3. Build `playlistMap: Map<id, playlist>` from playlists data
4. For each usage record: enrich with `service_type`, `section_name`, `theme`, `bible_lessons`, `song_key`, `song_tempo` (NULL where unavailable)
5. Bulk-insert all records in a single transaction; set migration flag
6. `data/usage.json` remains on disk but is no longer written to

**Rollback**: Set `ANALYTICS_DB_PATH` to a non-existent path to force the old `usageStore.js` back (requires reverting route files). Since `usage.json` is never modified by `analyticsDb`, rollback restores full fidelity.

## Open Questions

- None — scope is well-defined and implementation path is clear.
