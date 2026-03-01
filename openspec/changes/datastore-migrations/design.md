## Context

The app runs on Railway with three persistent datastores mounted as a volume at `/app/data/`:

- `playlists.json` — array of playlist objects, managed by `src/playlistStore.js`
- `usage.json` — array of usage records, managed by `src/usageStore.js` (legacy; largely superseded by analytics.db but still written)
- `analytics.db` — SQLite database, managed by `src/analyticsDb.js`

Currently none of these stores have a formal migration strategy. Schema changes introduced by new code will silently break the app against existing volume data.

## Goals / Non-Goals

**Goals:**
- Establish a versioned migration pattern for `playlists.json` and `usage.json` that runs automatically on startup
- Establish a `PRAGMA user_version`-based DDL migration runner for `analytics.db`
- Define a general convention for any future datastores
- Ensure migrations are idempotent — safe to run repeatedly
- Ensure zero data loss — migrations transform in place, write back atomically

**Non-Goals:**
- Rollback/down migrations — not needed at this scale; forward-only
- A migration CLI or admin UI
- Migrating song `.txt` files (schema is defined by the parser, not a store)
- Changing any API or frontend behaviour

## Decisions

### 1. JSON stores: wrap array in `{ version, records }` envelope

**Current shape (`playlists.json`):**
```json
[ { "id": "...", "name": "...", ... } ]
```

**New shape:**
```json
{
  "version": 1,
  "records": [ { "id": "...", "name": "...", ... } ]
}
```

Same wrapper applied to `usage.json`.

**Rationale:** A top-level `version` field requires a wrapper object. Alternatives considered:
- Store version in a separate `_version.json` file — adds filesystem complexity, two files must stay in sync
- Embed version in every record — bloated, harder to query
- Use filename versioning — inflexible for runtime migrations

The wrapper is the simplest, most conventional approach. Version `1` represents the current shape — no data transformation needed, just the envelope added on first run.

### 2. JSON migration: run on every `load()`, write back if upgraded

Each store's `load()` function will:
1. Parse the raw file
2. Detect bare array (legacy, version 0) or versioned envelope
3. Pass through `migrate(data)` which applies sequential version blocks
4. If the version changed, write the upgraded data back to disk atomically (`.tmp` rename)
5. Return the records array

**Migration function shape:**
```js
const CURRENT_VERSION = 1;

function migrate(data) {
  // Handle legacy bare array (version 0)
  if (Array.isArray(data)) {
    data = { version: 0, records: data };
  }

  let { version, records } = data;

  if (version < 1) {
    // Version 1: no record-level changes, just envelope adoption
    version = 1;
  }

  // Future: if (version < 2) { ... version = 2; }

  return { version, records };
}
```

### 3. SQLite: `PRAGMA user_version` migration runner

**Current approach:** `runDDL()` uses `CREATE TABLE IF NOT EXISTS` — safe for additive changes but cannot handle column renames, drops, or data backfills.

**New approach:** Replace `runDDL()` with `runMigrations()`:

```js
const MIGRATIONS = [
  // v1 — initial schema (existing tables)
  `CREATE TABLE IF NOT EXISTS song_usage ( ... );
   CREATE INDEX IF NOT EXISTS ...;
   CREATE TABLE IF NOT EXISTS _migration ( ... );`,

  // v2 — future example
  // `ALTER TABLE song_usage ADD COLUMN new_col TEXT;`
];

function runMigrations() {
  const current = db.pragma('user_version', { simple: true });
  for (let i = current; i < MIGRATIONS.length; i++) {
    db.exec(MIGRATIONS[i]);
    db.pragma(`user_version = ${i + 1}`);
  }
}
```

`PRAGMA user_version` is an integer stored in the SQLite file header — no separate tracking table needed for schema version. The existing `_migration` table is retained for tracking one-time data migrations (e.g., the `usage_json_imported` flag).

**Rationale over alternatives:**
- `CREATE TABLE IF NOT EXISTS` only — cannot handle column changes
- Separate schema version table — redundant, SQLite has `user_version` built in
- External migration library (e.g., `better-sqlite3-migrate`) — unnecessary dependency at this scale

### 4. Future datastores: follow the same conventions

Any new JSON store must:
- Use the `{ version, records }` envelope from day one
- Export a `migrate(data)` function
- Call it in `load()` and write back if version changed

Any new SQLite store must:
- Use `PRAGMA user_version` migration runner
- Add migrations as numbered entries in a `MIGRATIONS` array

This convention will be documented in `openspec/specs/datastore-migration-pattern/spec.md`.

## Risks / Trade-offs

- **Concurrent writes during migration** — Node.js is single-threaded and Railway runs one instance, so this is not a concern in practice
- **Large JSON files** — `playlists.json` is small; if it grows significantly, reading and writing the full file on every load will become slow. Mitigation: accept this now; migrate to SQLite if it becomes a problem
- **SQLite `ALTER TABLE` limitations** — SQLite does not support `DROP COLUMN` (before v3.35) or `RENAME COLUMN` (before v3.25). Mitigation: document workarounds in the pattern spec (recreate table via `CREATE TABLE ... AS SELECT`)
- **`usage.json` shape change** — wrapping the bare array in an envelope is a one-time breaking read. Any external tooling reading the raw file directly will need updating. Mitigation: none expected; file is internal only

## Migration Plan

1. Deploy new code — on first startup, `load()` detects the bare array, wraps it in the envelope, writes back
2. `analytics.db` `PRAGMA user_version` starts at 0; migration runner sets it to 1 after applying the initial schema block (no-op since tables already exist via `IF NOT EXISTS`)
3. No manual steps required on Railway
4. No rollback needed — if the new code is reverted, the old `load()` will fail on the envelope shape. Mitigation: take a data backup before deploying (Railway shell or pre-push hook)

## Open Questions

- Should `usage.json` eventually be deprecated entirely in favour of `analytics.db`? It is already largely superseded. Could be a follow-on change.
