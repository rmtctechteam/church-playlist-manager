## MODIFIED Requirements

### Requirement: JSON stores use a versioned envelope
Each JSON file datastore (`playlists.json`, `usage.json`) SHALL wrap its records in a `{ version, records }` envelope at the top level. The `version` field SHALL be a positive integer representing the current schema version. The `records` field SHALL contain the array of data records. These files SHALL be stored under `<VOLUME_PATH>/config/`.

#### Scenario: Fresh file created
- **WHEN** no data file exists yet
- **THEN** the store initialises with `{ "version": 1, "records": [] }` on first write under `<VOLUME_PATH>/config/`

#### Scenario: Legacy bare array detected on load
- **WHEN** the file contains a bare JSON array (no version field)
- **THEN** the store treats it as version 0 and runs migrations to bring it to the current version

#### Scenario: Versioned envelope loaded
- **WHEN** the file contains a `{ version, records }` object
- **THEN** the store reads the version and runs any pending migrations from that version to the current version

#### Scenario: Config directory resolved from VOLUME_PATH
- **WHEN** `VOLUME_PATH` is set to `/app/volume`
- **THEN** `playlists.json` and `usage.json` are read and written at `/app/volume/config/`
