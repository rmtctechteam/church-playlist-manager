## MODIFIED Requirements

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
