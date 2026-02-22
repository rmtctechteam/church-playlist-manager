## ADDED Requirements

### Requirement: Query song usage grouped by service type
The system SHALL provide an API endpoint that returns song usage counts grouped by service type, so worship leaders can see which service contexts a song is used in most.

#### Scenario: Get usage by service type for a song used in multiple service types
- **WHEN** a GET request is sent to `/api/songs/:id/analytics/by-service-type`
- **THEN** the system returns a 200 response with an array of `{ "serviceType": "<type>", "count": <number> }` objects sorted by count descending

#### Scenario: Get usage by service type for an unused song
- **WHEN** a GET request is sent to `/api/songs/:id/analytics/by-service-type` for a song with no usage records
- **THEN** the system returns a 200 response with an empty array `[]`

### Requirement: Query song usage grouped by section
The system SHALL provide an API endpoint that returns song usage counts grouped by section name, so worship leaders can see which sections a song is typically placed in.

#### Scenario: Get usage by section for a song used in multiple sections
- **WHEN** a GET request is sent to `/api/songs/:id/analytics/by-section`
- **THEN** the system returns a 200 response with an array of `{ "sectionName": "<name>", "count": <number> }` objects sorted by count descending

#### Scenario: Get usage by section for an unused song
- **WHEN** a GET request is sent to `/api/songs/:id/analytics/by-section` for a song with no usage records
- **THEN** the system returns a 200 response with an empty array `[]`

### Requirement: Song frequency report
The system SHALL provide an API endpoint that returns all songs sorted by usage frequency, so worship leaders can identify overused and underused songs.

#### Scenario: Get frequency report across all songs
- **WHEN** a GET request is sent to `/api/songs/analytics/frequency`
- **THEN** the system returns a 200 response with an array of `{ "songId": "<id>", "count": <number>, "lastUsed": "<date>" | null }` sorted by count descending

#### Scenario: Get frequency report filtered by date range
- **WHEN** a GET request is sent to `/api/songs/analytics/frequency?since=YYYY-MM-DD`
- **THEN** the system returns only usage events on or after the given date, with counts reflecting that window

### Requirement: Enriched usage detail per song
The system SHALL expose full contextual data for each usage event of a song, including service type, section, theme, bible lessons, key, and tempo.

#### Scenario: Get enriched usage detail for a song
- **WHEN** a GET request is sent to `/api/songs/:id/analytics/detail`
- **THEN** the system returns a 200 response with an array of objects, each containing `{ "playlistId", "date", "serviceType", "sectionName", "theme", "bibleLessons", "songKey", "songTempo" }` sorted by date descending

#### Scenario: Get enriched detail for an unused song
- **WHEN** a GET request is sent to `/api/songs/:id/analytics/detail` for a song that has never been used
- **THEN** the system returns a 200 response with an empty array `[]`
