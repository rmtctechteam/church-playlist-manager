## MODIFIED Requirements

### Requirement: List all songs
The API SHALL expose `GET /api/songs` which returns a JSON array of all songs. Each song in the list includes metadata fields only (id, title, artist, key, tempo) and a `lyricsPreview` field — lyrics are excluded to keep responses lightweight.

#### Scenario: Retrieve full song list
- **WHEN** a client sends `GET /api/songs` with no query parameters
- **THEN** the API responds with HTTP 200 and a JSON array containing metadata for every song in the library, including a `lyricsPreview` field containing the first two non-empty lines of lyrics joined by " / ", or `null` if the song has no lyrics

### Requirement: Search songs by query
The API SHALL accept an optional query parameter `q` on `GET /api/songs`. When provided, the API filters songs to those whose title or artist or lyrics contains the query string. Matching SHALL be case-insensitive. Each result SHALL include a `lyricsPreview` field.

#### Scenario: Search matching title
- **WHEN** a client sends `GET /api/songs?q=amazing`
- **THEN** the response includes songs whose title contains "amazing" (case-insensitive) and excludes non-matching songs, each with a `lyricsPreview` field

#### Scenario: Search matching artist
- **WHEN** a client sends `GET /api/songs?q=newton`
- **THEN** the response includes songs whose artist contains "newton" (case-insensitive), each with a `lyricsPreview` field

#### Scenario: Search matching lyrics
- **WHEN** a client sends `GET /api/songs?q=newton`
- **THEN** the response includes songs whose lyrics contains "newton" (case-insensitive), each with a `lyricsPreview` field

#### Scenario: Search with multiple matches
- **WHEN** a client sends `GET /api/songs?q=newton`
- **THEN** the API responds with a list of the songs, artists and lyrics matched when containing 'newton'. The results returned will be ranked by title matches first, artists match second, and lyric match last.

#### Scenario: Search with no matches
- **WHEN** a client sends `GET /api/songs?q=xyznonexistent`
- **THEN** the API responds with HTTP 200 and an empty JSON array

#### Scenario: Case-insensitive matching
- **WHEN** a client sends `GET /api/songs?q=AMAZING`
- **THEN** the results are the same as searching for "amazing"
