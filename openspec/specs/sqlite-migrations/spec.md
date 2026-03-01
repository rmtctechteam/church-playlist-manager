## ADDED Requirements

### Requirement: SQLite schema version tracked via PRAGMA user_version
The analytics database SHALL use `PRAGMA user_version` to track the current schema version. `user_version` SHALL be incremented after each migration block is applied. No separate schema version table is needed for DDL versioning. The database file SHALL be stored at `<VOLUME_PATH>/analytics/analytics.db`.

#### Scenario: Fresh database created
- **WHEN** `analytics.db` does not exist
- **THEN** all migration blocks are applied in order starting from version 0, and `user_version` is set to the total number of migrations

#### Scenario: Existing database with lower user_version
- **WHEN** the database exists and `PRAGMA user_version` is less than the number of migrations
- **THEN** only the pending migration blocks (from current version onward) are applied

#### Scenario: Database already at current version
- **WHEN** `PRAGMA user_version` equals the number of migrations
- **THEN** no migration blocks are applied and the database is unchanged

#### Scenario: Analytics directory resolved from VOLUME_PATH
- **WHEN** `VOLUME_PATH` is set to `/app/volume`
- **THEN** `analytics.db` is opened at `/app/volume/analytics/analytics.db`

### Requirement: Migrations defined as a sequential MIGRATIONS array
All DDL migrations SHALL be defined in a `const MIGRATIONS` array in `src/analyticsDb.js`. Each entry SHALL be a SQL string applied as a single `db.exec()` call. Entries SHALL NOT be removed or reordered once deployed.

#### Scenario: Migration block applied
- **WHEN** migration at index `i` is applied
- **THEN** `PRAGMA user_version` is set to `i + 1` immediately after

#### Scenario: Failed migration
- **WHEN** a migration block throws an error
- **THEN** the error propagates and the server fails to start, preventing corrupt state

### Requirement: runDDL replaced by runMigrations
The existing `runDDL()` function SHALL be replaced by `runMigrations()`. The initial schema (existing `song_usage` table, indexes, and `_migration` table) SHALL become migration block at index 0 (version 1). Subsequent schema changes SHALL be added as new entries.

#### Scenario: First deploy with new migration runner
- **WHEN** an existing database has `user_version = 0` and all tables already exist from the old `runDDL()`
- **THEN** migration block 0 uses `CREATE TABLE IF NOT EXISTS` so it is safe to re-run, and `user_version` is set to 1

### Requirement: One-time data migrations tracked separately via _migration table
Data migrations (e.g., importing records from a legacy JSON file) SHALL be tracked in the `_migration` table using named keys, not `PRAGMA user_version`. `PRAGMA user_version` SHALL only track DDL (schema) changes.

#### Scenario: One-time data migration already run
- **WHEN** the `_migration` table contains the key for a data migration
- **THEN** the data migration is skipped

#### Scenario: One-time data migration not yet run
- **WHEN** the `_migration` table does not contain the key for a data migration
- **THEN** the data migration runs and the key is inserted into `_migration`
