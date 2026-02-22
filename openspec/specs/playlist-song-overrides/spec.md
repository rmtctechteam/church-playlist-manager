## ADDED Requirements

### Requirement: Playlist sections store per-song music overrides
Each song slot in a playlist section SHALL store an optional key, tempo, and notes override alongside the song ID. These overrides take precedence over the master song values when the playlist is displayed or exported.

#### Scenario: Song slot with key override
- **WHEN** a song in a playlist section has `key: "A"` set as an override
- **THEN** the playlist editor and display view show "A" as the key for that song in that playlist, regardless of the master song's key

#### Scenario: Song slot with no override falls back to master
- **WHEN** a song in a playlist section has `key: null` (no override)
- **THEN** the playlist editor pre-fills the key input with the master song's key and the display view shows the master key

#### Scenario: Override notes per song in playlist
- **WHEN** a song slot has `notes: "Modulate to Bb after verse 2"`
- **THEN** the display view shows those notes for that song in the playlist

### Requirement: Playlist editor shows editable music fields per song
The playlist editor SHALL display key, tempo, and notes input fields for each song in a section. Fields SHALL be pre-filled with the master song values as placeholders and editable to set playlist-level overrides.

#### Scenario: Pre-filled from master song
- **WHEN** the user adds a song to a playlist section
- **THEN** the key and tempo inputs show the master song's key and tempo as placeholder text, with empty (no override) as the initial state

#### Scenario: User sets a key override
- **WHEN** the user types a value into the key field for a song in the editor
- **THEN** the override is saved with the playlist and used in the display view

#### Scenario: User clears a key override
- **WHEN** the user clears the key field for a song in the editor
- **THEN** the override is removed and the display view falls back to the master song key
