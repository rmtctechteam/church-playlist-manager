## ADDED Requirements

### Requirement: All persistent storage lives under a single volume root
The app SHALL resolve all persistent storage paths from a single `VOLUME_PATH` environment variable. `VOLUME_PATH` defaults to `./volume` (relative to the project root) when not set. The volume root SHALL contain three subdirectories: `songs/`, `config/`, and `analytics/`.

#### Scenario: VOLUME_PATH set via environment variable
- **WHEN** the `VOLUME_PATH` environment variable is set to `/app/volume`
- **THEN** all storage paths are resolved relative to `/app/volume`

#### Scenario: VOLUME_PATH not set (local dev)
- **WHEN** `VOLUME_PATH` is not set
- **THEN** all storage paths are resolved relative to `./volume` in the project root

### Requirement: Subdirectories are created automatically on startup
Each module SHALL create its required subdirectory on startup if it does not exist, using `fs.mkdirSync(..., { recursive: true })`. The app SHALL NOT require manual directory creation before first run.

#### Scenario: Fresh volume with no subdirectories
- **WHEN** the volume root exists but subdirectories do not
- **THEN** each module creates its subdirectory automatically on first write

#### Scenario: Subdirectories already exist
- **WHEN** subdirectories already exist
- **THEN** `mkdirSync` with `recursive: true` is a no-op and no error is thrown

### Requirement: Volume subdirectory layout
The volume SHALL use the following fixed subdirectory structure:

- `<VOLUME_PATH>/songs/` — song `.txt` files (read by server and song parser)
- `<VOLUME_PATH>/config/` — `playlists.json` and `usage.json`
- `<VOLUME_PATH>/analytics/` — `analytics.db`

#### Scenario: Songs directory resolved correctly
- **WHEN** `VOLUME_PATH=/app/volume`
- **THEN** `SONGS_DIR` resolves to `/app/volume/songs`

#### Scenario: Config directory resolved correctly
- **WHEN** `VOLUME_PATH=/app/volume`
- **THEN** `DATA_DIR` in playlist and usage stores resolves to `/app/volume/config`

#### Scenario: Analytics directory resolved correctly
- **WHEN** `VOLUME_PATH=/app/volume`
- **THEN** `DB_PATH` resolves to `/app/volume/analytics/analytics.db`

### Requirement: volume/ directory is committed with .gitkeep placeholders
The `volume/songs/`, `volume/config/`, and `volume/analytics/` directories SHALL be committed to git using `.gitkeep` files so the directory structure exists after a fresh deploy. The contents of these directories (data files, song files) SHALL be git-ignored.

#### Scenario: Fresh Railway deploy with no volume mounted
- **WHEN** the app is deployed with no volume mounted
- **THEN** the `volume/` directory structure exists from the repo but contains no data files

#### Scenario: Railway volume mounted at /app/volume
- **WHEN** a Railway volume is mounted at `/app/volume` and `VOLUME_PATH=/app/volume`
- **THEN** the mounted volume overlays the committed directory structure and persists data across deploys
