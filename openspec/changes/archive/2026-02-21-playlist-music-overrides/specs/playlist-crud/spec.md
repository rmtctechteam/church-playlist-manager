## MODIFIED Requirements

### Requirement: Get a single playlist with song details
The system SHALL return a playlist by ID with each section's songs resolved to full song objects. Each resolved song object SHALL merge playlist-level overrides (key, tempo, notes) on top of the master song values: if an override is set it takes precedence; otherwise the master value is used.

#### Scenario: Retrieve playlist with songs
- **WHEN** a GET request is sent to `/api/playlists/:id`
- **THEN** the system returns the playlist with each section containing a `songs` array of resolved song objects, where each song's `key`, `tempo`, and `notes` reflect the effective value (override if set, master otherwise)

#### Scenario: Song override applied
- **WHEN** a song slot in a section has `key: "A"` stored as an override and the master song has `key: "G"`
- **THEN** the resolved song object in the response has `key: "A"`

#### Scenario: No override falls back to master
- **WHEN** a song slot has `key: null` and the master song has `key: "G"`
- **THEN** the resolved song object has `key: "G"`

### Requirement: Update a playlist's sections with music overrides
The system SHALL accept section updates where each song slot is an object with `id` plus optional `key`, `tempo`, and `notes` override fields. The system SHALL also accept the legacy `songIds` array format and normalise it to the new format internally.

#### Scenario: Save sections with overrides
- **WHEN** a PUT request is sent with `sections: [{ name: "Opening", songs: [{ id: "amazing-grace", key: "A", tempo: null, notes: "Capo 2" }] }]`
- **THEN** the playlist is saved with the override values and a subsequent GET returns them merged into the resolved song

#### Scenario: Backward-compatible read of legacy songIds
- **WHEN** an existing playlist stored with `songIds: ["amazing-grace"]` is read
- **THEN** the system normalises it to `songs: [{ id: "amazing-grace", key: null, tempo: null, notes: null }]` transparently, and the response is correct
