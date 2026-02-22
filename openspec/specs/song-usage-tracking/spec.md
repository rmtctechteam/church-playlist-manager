## ADDED Requirements

### Requirement: Record song usage from playlists
The system SHALL automatically record a usage entry for each song across all sections of a playlist when that playlist has a date assigned. Each usage record SHALL capture `service_type`, `section_name`, `theme`, `bible_lessons`, `song_key`, and `song_tempo` in addition to `songId`, `playlistId`, and `date`. Usage records SHALL be stored in `data/analytics.db`.

#### Scenario: Usage recorded when playlist is created with a date
- **WHEN** a playlist is created with sections containing songs (e.g., Opening: ["Song A"], Communion: ["Song B"]) and `date: "2026-02-15"`
- **THEN** usage records are created for both Song A (section_name: "Opening") and Song B (section_name: "Communion") with `date: "2026-02-15"`, the playlist's ID, service_type from playlist.type, and theme/bible_lessons from the playlist

#### Scenario: Usage updated when playlist songs change
- **WHEN** a playlist with a date has its sections updated such that Song B is removed and Song C is added
- **THEN** the usage record for Song B is removed and a new usage record for Song C is created for that playlist

#### Scenario: No usage recorded for dateless playlists
- **WHEN** a playlist is created or updated without a `date` field
- **THEN** no usage records are created or modified for that playlist

### Requirement: Remove usage records on playlist deletion
The system SHALL remove all usage records associated with a playlist when that playlist is deleted.

#### Scenario: Delete a playlist with usage records
- **WHEN** a playlist with a date and songs is deleted
- **THEN** all usage records referencing that playlist's ID are removed from `data/usage.json`

### Requirement: Query song usage history
The system SHALL provide an API endpoint to retrieve usage history for a specific song, including how many times it has been used and the most recent date.

#### Scenario: Get usage for a song with history
- **WHEN** a GET request is sent to `/api/songs/:id/usage`
- **THEN** the system returns a 200 response with `{ "songId": "<id>", "count": <number>, "lastUsed": "<date>", "history": [{ "playlistId": "...", "date": "..." }, ...] }` sorted by date descending

#### Scenario: Get usage for a song with no history
- **WHEN** a GET request is sent to `/api/songs/:id/usage` for a song that has never been in a dated playlist
- **THEN** the system returns a 200 response with `{ "songId": "<id>", "count": 0, "lastUsed": null, "history": [] }`

### Requirement: Display usage information in the UI
The frontend SHALL show song usage information when viewing a song, so worship leaders can see how recently and frequently a song has been used.

#### Scenario: View usage on song detail
- **WHEN** the user views a song's detail page and the song has been used in playlists
- **THEN** the UI displays the number of times the song has been used and the most recent usage date

#### Scenario: View usage for an unused song
- **WHEN** the user views a song's detail page and the song has never been used
- **THEN** the UI displays an indication that the song has not been used yet

### Requirement: Persistent usage storage
The system SHALL persist all usage records to `data/analytics.db` (SQLite) using database transactions. On first startup, the system SHALL migrate existing records from `data/usage.json` into the SQLite database, enriching them with contextual fields from `data/playlists.json` and the in-memory song catalog.

#### Scenario: Usage data survives server restart
- **WHEN** usage records exist in `data/analytics.db`, the server is restarted, and usage is queried
- **THEN** the previously recorded usage data is returned

#### Scenario: Database does not exist on first run
- **WHEN** the server starts and `data/analytics.db` does not exist
- **THEN** the system creates the database, runs DDL to create the `song_usage` table and indexes, and proceeds normally

#### Scenario: Migration runs once on first startup after upgrade
- **WHEN** `data/usage.json` exists and `data/analytics.db` does not contain a migration flag
- **THEN** all records from `usage.json` are imported into `analytics.db` enriched with `service_type`, `section_name`, `theme`, `bible_lessons`, `song_key`, and `song_tempo` where available

#### Scenario: Migration is skipped on subsequent startups
- **WHEN** `data/analytics.db` already contains the migration completion flag
- **THEN** the migration import step is skipped and the server starts normally
