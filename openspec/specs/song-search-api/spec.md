## ADDED Requirements

### Requirement: List all songs
The API SHALL expose `GET /api/songs` which returns a JSON array of all songs. Each song in the list includes metadata fields only (id, title, artist, key, tempo) — lyrics are excluded to keep responses lightweight.

#### Scenario: Retrieve full song list
- **WHEN** a client sends `GET /api/songs` with no query parameters
- **THEN** the API responds with HTTP 200 and a JSON array containing metadata for every song in the library

### Requirement: Search songs by query
The API SHALL accept an optional query parameter `q` on `GET /api/songs`. When provided, the API filters songs to those whose title or artist or lyrics contains the query string. Matching SHALL be case-insensitive.

#### Scenario: Search matching title
- **WHEN** a client sends `GET /api/songs?q=amazing`
- **THEN** the response includes songs whose title contains "amazing" (case-insensitive) and excludes non-matching songs

#### Scenario: Search matching artist
- **WHEN** a client sends `GET /api/songs?q=newton`
- **THEN** the response includes songs whose artist contains "newton" (case-insensitive)

#### Scenario: Search matching lyrics
- **WHEN** a client sends `GET /api/songs?q=newton`
- **THEN** the response includes songs whose lyrics contains "newton" (case-insensitive)

#### Scenario: Search with multiple matches
- **WHEN** a client sends `GET /api/songs?q=newton`
- **THEN** the API responds with a list of the songs, artists and lyrics matched when containing 'newton'.  the results returned will be ranked by title matches first, artists match second, and lyric match last.

#### Scenario: Search with no matches
- **WHEN** a client sends `GET /api/songs?q=xyznonexistent`
- **THEN** the API responds with HTTP 200 and an empty JSON array

#### Scenario: Case-insensitive matching
- **WHEN** a client sends `GET /api/songs?q=AMAZING`
- **THEN** the results are the same as searching for "amazing"

### Requirement: Get song details with lyrics
The API SHALL expose `GET /api/songs/:id` which returns the full song object including metadata and lyrics for the song matching the given ID.

#### Scenario: Retrieve existing song
- **WHEN** a client sends `GET /api/songs/amazing-grace`
- **THEN** the API responds with HTTP 200 and the full song object including id, title, artist, key, tempo, and lyrics array

#### Scenario: Song not found
- **WHEN** a client sends `GET /api/songs/nonexistent-song`
- **THEN** the API responds with HTTP 404 and a JSON error message

### Requirement: Get songs used since a date
The API SHALL expose `GET /api/songs/used?since=YYYY-MM-DD` which returns a JSON array of song IDs that have been added to a dated playlist on or after the given date.

#### Scenario: Retrieve songs used in the last week
- **WHEN** a client sends `GET /api/songs/used?since=2026-02-13`
- **THEN** the API responds with HTTP 200 and a JSON array of song ID strings for songs used on or after that date

#### Scenario: No songs used since date
- **WHEN** a client sends `GET /api/songs/used?since=2099-01-01`
- **THEN** the API responds with HTTP 200 and an empty JSON array

#### Scenario: Missing since parameter
- **WHEN** a client sends `GET /api/songs/used` without a since parameter
- **THEN** the API responds with HTTP 400 and a JSON error message

### Requirement: Get bulk usage summary for all songs
The API SHALL expose `GET /api/songs/usage-summary` which returns a JSON object mapping song IDs to their usage count and last-used date for all songs that have at least one usage record.

#### Scenario: Retrieve usage summary
- **WHEN** a client sends `GET /api/songs/usage-summary`
- **THEN** the API responds with HTTP 200 and a JSON object where each key is a song ID and each value contains `count` (number) and `lastUsed` (date string)

#### Scenario: No usage data exists
- **WHEN** a client sends `GET /api/songs/usage-summary` and no songs have usage records
- **THEN** the API responds with HTTP 200 and an empty JSON object
