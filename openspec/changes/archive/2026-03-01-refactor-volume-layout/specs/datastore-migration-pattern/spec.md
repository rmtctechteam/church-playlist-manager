## MODIFIED Requirements

### Requirement: Every new JSON datastore uses the versioned envelope from day one
Any new JSON file datastore added to the app SHALL use the `{ version, records }` envelope structure from its first commit. Starting at version 1 avoids the need for a legacy-detection migration path. The file SHALL be stored under a `VOLUME_PATH` subdirectory appropriate to its type.

#### Scenario: New JSON store introduced
- **WHEN** a new JSON file store is created
- **THEN** it initialises with `{ "version": 1, "records": [] }`, includes a `migrate(data)` function and a `CURRENT_VERSION` constant, and resolves its path from `VOLUME_PATH`

#### Scenario: Developer adds a field to a new JSON store
- **WHEN** a record-level field is added or renamed in a new JSON store
- **THEN** a new version block is added to `migrate(data)` and `CURRENT_VERSION` is incremented

### Requirement: Every new SQLite datastore uses the MIGRATIONS array pattern
Any new SQLite database added to the app SHALL define a `const MIGRATIONS` array and a `runMigrations()` function using `PRAGMA user_version`. It SHALL NOT use standalone `CREATE TABLE IF NOT EXISTS` calls outside of the migrations array. The database file SHALL be stored under a `VOLUME_PATH` subdirectory.

#### Scenario: New SQLite store introduced
- **WHEN** a new SQLite database module is created
- **THEN** it includes a `MIGRATIONS` array with the initial schema as entry 0, `runMigrations()` is called on startup, and the DB path is resolved from `VOLUME_PATH`

#### Scenario: Developer adds a column to an existing table
- **WHEN** a new column is needed on an existing SQLite table
- **THEN** an `ALTER TABLE ... ADD COLUMN` statement is added as a new entry in `MIGRATIONS`
