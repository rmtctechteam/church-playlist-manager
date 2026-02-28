## ADDED Requirements

### Requirement: List available service types
The system SHALL provide an endpoint that returns all preset worship service types and their section templates.

#### Scenario: Get service types
- **WHEN** a GET request is sent to `/api/service-types`
- **THEN** the system returns a 200 response with an array of service types, each containing an `id`, `name`, and `sections` array (e.g., `{ "id": "holy-communion", "name": "Holy Communion", "sections": ["Gathering", "Word", "Communion", "Sending"] }`)

### Requirement: Create a playlist
The system SHALL allow creating a new playlist with a name and a service type. The system SHALL generate a unique ID, initialize the `sections` array from the selected service type's template (each section with an empty `songIds` array), and record `createdAt` and `updatedAt` timestamps.

#### Scenario: Create a playlist with a service type
- **WHEN** a POST request is sent to `/api/playlists` with `{ "name": "Sunday Worship", "type": "holy-communion" }`
- **THEN** the system returns a 201 response with the created playlist containing a generated `id`, the given `name`, `type` set to `"holy-communion"`, `sections` initialized to `[{ "name": "Gathering", "songIds": [] }, { "name": "Word", "songIds": [] }, { "name": "Communion", "songIds": [] }, { "name": "Sending", "songIds": [] }]`, null `date`, null `notes`, and valid timestamps

#### Scenario: Create a custom playlist
- **WHEN** a POST request is sent to `/api/playlists` with `{ "name": "Special Event", "type": "custom", "sections": [{ "name": "Welcome" }, { "name": "Main Set" }] }`
- **THEN** the system returns a 201 response with `type` set to `"custom"` and `sections` initialized from the provided section names with empty `songIds` arrays

#### Scenario: Create a playlist without a name
- **WHEN** a POST request is sent to `/api/playlists` with no `name` field or an empty `name`
- **THEN** the system returns a 400 response with an error message indicating name is required

#### Scenario: Create a playlist with an invalid type
- **WHEN** a POST request is sent to `/api/playlists` with a `type` that is not a valid service type ID and is not `"custom"`
- **THEN** the system returns a 400 response with an error message indicating the type is invalid

### Requirement: List all playlists
The system SHALL return all playlists sorted by date descending (most recent first), with playlists without dates listed last.

#### Scenario: List playlists
- **WHEN** a GET request is sent to `/api/playlists`
- **THEN** the system returns a 200 response with an array of all playlists sorted by date descending, with dateless playlists at the end

#### Scenario: List playlists when none exist
- **WHEN** a GET request is sent to `/api/playlists` and no playlists have been created
- **THEN** the system returns a 200 response with an empty array

### Requirement: Get a single playlist with song details
The system SHALL return a playlist by ID with each section's songs resolved to full song objects. Each resolved song object SHALL merge playlist-level overrides (key, tempo, notes) on top of the master song values: if an override is set it takes precedence; otherwise the master value is used. Songs that no longer exist SHALL be represented with the song ID and a `notFound: true` flag.

#### Scenario: Get an existing playlist
- **WHEN** a GET request is sent to `/api/playlists/:id` with a valid playlist ID
- **THEN** the system returns a 200 response with the playlist and each section containing a `songs` array of resolved song objects, where each song's `key`, `tempo`, and `notes` reflect the effective value (override if set, master otherwise)

#### Scenario: Song override applied
- **WHEN** a song slot in a section has `key: "A"` stored as an override and the master song has `key: "G"`
- **THEN** the resolved song object in the response has `key: "A"`

#### Scenario: No override falls back to master
- **WHEN** a song slot has `key: null` and the master song has `key: "G"`
- **THEN** the resolved song object has `key: "G"`

#### Scenario: Get a playlist with a missing song
- **WHEN** a GET request is sent to `/api/playlists/:id` and one of the song slots in a section references a song that no longer exists
- **THEN** the corresponding entry in that section's `songs` array SHALL contain `{ "id": "<songId>", "notFound": true }`

#### Scenario: Get a non-existent playlist
- **WHEN** a GET request is sent to `/api/playlists/:id` with an ID that does not exist
- **THEN** the system returns a 404 response with an error message

### Requirement: Update a playlist
The system SHALL allow updating a playlist's name, sections (including song assignments and per-song music overrides), date, notes, and `googleDoc` URL. The `googleDoc` field SHALL be populated automatically when a Google Doc is created via the doc creation endpoint, in addition to being settable manually. The system SHALL update the `updatedAt` timestamp on each update.

#### Scenario: Update playlist name
- **WHEN** a PUT request is sent to `/api/playlists/:id` with `{ "name": "New Name" }`
- **THEN** the system returns a 200 response with the updated playlist and an updated `updatedAt` timestamp

#### Scenario: Save sections with overrides
- **WHEN** a PUT request is sent with `sections: [{ name: "Opening", songs: [{ id: "amazing-grace", key: "A", tempo: null, notes: "Capo 2" }] }]`
- **THEN** the playlist is saved with the override values and a subsequent GET returns them merged into the resolved song

#### Scenario: Backward-compatible read of legacy songIds
- **WHEN** an existing playlist stored with `songIds: ["amazing-grace"]` is read
- **THEN** the system normalises it to `songs: [{ id: "amazing-grace", key: null, tempo: null, notes: null }]` transparently, and the response is correct

#### Scenario: googleDoc field set automatically on doc creation
- **WHEN** a user successfully creates a Google Doc from a playlist
- **THEN** the playlist's `googleDoc` field is updated to the new doc URL without requiring a separate save action

#### Scenario: Update a non-existent playlist
- **WHEN** a PUT request is sent to `/api/playlists/:id` with an ID that does not exist
- **THEN** the system returns a 404 response with an error message

### Requirement: Delete a playlist
The system SHALL allow deleting a playlist by ID. Deletion SHALL be permanent and SHALL also remove associated usage records.

#### Scenario: Delete an existing playlist
- **WHEN** a DELETE request is sent to `/api/playlists/:id` with a valid playlist ID
- **THEN** the system returns a 204 response and the playlist is permanently removed from storage

#### Scenario: Delete a non-existent playlist
- **WHEN** a DELETE request is sent to `/api/playlists/:id` with an ID that does not exist
- **THEN** the system returns a 404 response with an error message

### Requirement: Persistent storage
The system SHALL persist all playlists to `data/playlists.json`. The file SHALL be written atomically (write to temp file, then rename) to minimize corruption risk.

#### Scenario: Playlists survive server restart
- **WHEN** a playlist is created, the server is restarted, and a GET request is sent to `/api/playlists`
- **THEN** the previously created playlist is included in the response

#### Scenario: Storage file does not exist on first run
- **WHEN** the server starts and `data/playlists.json` does not exist
- **THEN** the system treats it as an empty playlist list and creates the file on first write
