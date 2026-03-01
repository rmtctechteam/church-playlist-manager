## ADDED Requirements

### Requirement: Every new JSON datastore uses the versioned envelope from day one
Any new JSON file datastore added to the app SHALL use the `{ version, records }` envelope structure from its first commit. Starting at version 1 avoids the need for a legacy-detection migration path.

#### Scenario: New JSON store introduced
- **WHEN** a new JSON file store is created
- **THEN** it initialises with `{ "version": 1, "records": [] }` and includes a `migrate(data)` function and a `CURRENT_VERSION` constant

#### Scenario: Developer adds a field to a new JSON store
- **WHEN** a record-level field is added or renamed in a new JSON store
- **THEN** a new version block is added to `migrate(data)` and `CURRENT_VERSION` is incremented

### Requirement: Every new SQLite datastore uses the MIGRATIONS array pattern
Any new SQLite database added to the app SHALL define a `const MIGRATIONS` array and a `runMigrations()` function using `PRAGMA user_version`. It SHALL NOT use standalone `CREATE TABLE IF NOT EXISTS` calls outside of the migrations array.

#### Scenario: New SQLite store introduced
- **WHEN** a new SQLite database module is created
- **THEN** it includes a `MIGRATIONS` array with the initial schema as entry 0, and `runMigrations()` is called on startup

#### Scenario: Developer adds a column to an existing table
- **WHEN** a new column is needed on an existing SQLite table
- **THEN** an `ALTER TABLE ... ADD COLUMN` statement is added as a new entry in `MIGRATIONS`

### Requirement: Migrations are forward-only
No datastore SHALL implement down/rollback migrations. All migration blocks are additive and permanent once deployed. Rollback strategy is manual data restoration from backup.

#### Scenario: Reverting a deployment
- **WHEN** a deployment is reverted to a previous code version
- **THEN** the previous code must be compatible with the migrated data shape, or a data backup must be restored manually

### Requirement: Migrations are documented in the design artifact of the change that introduces them
Any OpenSpec change that modifies a datastore's schema SHALL document the migration strategy in its `design.md` — including the old shape, new shape, and version bump. This is enforced by the global rule in `openspec/config.yaml`.

#### Scenario: New OpenSpec change modifies playlist data model
- **WHEN** a change adds, removes, or renames a field on playlists or playlist songs
- **THEN** the change's `design.md` includes a migration strategy section and `tasks.md` includes a task to update `migrate(data)` or the `MIGRATIONS` array
