## ADDED Requirements

### Requirement: Record song usage from playlists
The system SHALL automatically record a usage entry for each song across all sections of a playlist when that playlist has a date assigned. Usage records SHALL be stored in `data/usage.json`.

#### Scenario: Usage recorded when playlist is created with a date
- **WHEN** a playlist is created with sections containing songs (e.g., Gathering: ["Song A"], Communion: ["Song B"]) and `date: "2026-02-15"`
- **THEN** usage records are created for both Song A and Song B with `date: "2026-02-15"` and the playlist's ID

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
The system SHALL persist all usage records to `data/usage.json` using atomic file writes.

#### Scenario: Usage data survives server restart
- **WHEN** usage records exist, the server is restarted, and usage is queried
- **THEN** the previously recorded usage data is returned

#### Scenario: Usage file does not exist on first run
- **WHEN** the server starts and `data/usage.json` does not exist
- **THEN** the system treats it as empty and creates the file on first write
