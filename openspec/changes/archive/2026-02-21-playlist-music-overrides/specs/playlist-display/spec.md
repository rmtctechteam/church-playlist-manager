## MODIFIED Requirements

### Requirement: Display playlist songs with effective music values
The Display Playlist view SHALL show each song's effective key, tempo, and notes — using the playlist-level override if set, otherwise the master song value. A Music section SHALL appear for each song that has at least one non-null effective music value (key, tempo, or notes).

#### Scenario: Display song with key override
- **WHEN** the Display Playlist view renders a song that has a playlist-level key override
- **THEN** the override key is shown (not the master song key)

#### Scenario: Display song with notes override
- **WHEN** the Display Playlist view renders a song that has playlist-level notes set
- **THEN** the notes text is shown beneath the song title in the display view

#### Scenario: Display song with no overrides
- **WHEN** a song in a playlist has no overrides set
- **THEN** the master song's key and tempo are shown (same behaviour as before this change)
