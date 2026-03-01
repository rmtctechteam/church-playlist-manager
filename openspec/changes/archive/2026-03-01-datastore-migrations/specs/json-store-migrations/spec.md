## ADDED Requirements

### Requirement: JSON stores use a versioned envelope
Each JSON file datastore (`playlists.json`, `usage.json`) SHALL wrap its records in a `{ version, records }` envelope at the top level. The `version` field SHALL be a positive integer representing the current schema version. The `records` field SHALL contain the array of data records.

#### Scenario: Fresh file created
- **WHEN** no data file exists yet
- **THEN** the store initialises with `{ "version": 1, "records": [] }` on first write

#### Scenario: Legacy bare array detected on load
- **WHEN** the file contains a bare JSON array (no version field)
- **THEN** the store treats it as version 0 and runs migrations to bring it to the current version

#### Scenario: Versioned envelope loaded
- **WHEN** the file contains a `{ version, records }` object
- **THEN** the store reads the version and runs any pending migrations from that version to the current version

### Requirement: Migration runs automatically on every load
Each JSON store's `load()` function SHALL call `migrate(data)` before returning records. The migrate function SHALL be idempotent — calling it on already-current data SHALL produce no changes.

#### Scenario: Data already at current version
- **WHEN** the file version matches `CURRENT_VERSION`
- **THEN** `migrate()` returns the data unchanged and no file write occurs

#### Scenario: Data is behind current version
- **WHEN** the file version is less than `CURRENT_VERSION`
- **THEN** `migrate()` applies each version block in sequence and returns the upgraded data

### Requirement: Upgraded data is written back atomically
If `migrate()` returns a higher version than what was read from disk, the store SHALL write the upgraded envelope back to disk before returning records. The write SHALL use a `.tmp` file rename to prevent partial writes.

#### Scenario: Migration produces a version change
- **WHEN** `migrate()` returns a version higher than the file's version
- **THEN** the upgraded envelope is written to `<file>.tmp` and atomically renamed to `<file>`

#### Scenario: No version change
- **WHEN** `migrate()` returns the same version as the file
- **THEN** no file write occurs

### Requirement: Migration blocks are sequential and additive
The `migrate(data)` function SHALL contain numbered `if (version < N)` blocks, one per version increment. Each block SHALL transform the records from the previous shape to the new shape and increment `version`. Blocks SHALL NOT be removed or reordered once deployed.

#### Scenario: Adding a new version block
- **WHEN** a new version block `if (version < N)` is added
- **THEN** files at version `N-1` are upgraded to version `N` on next load, and files already at version `N` are unaffected

#### Scenario: Multiple versions behind
- **WHEN** the file is multiple versions behind current
- **THEN** all intermediate version blocks are applied in order in a single load
