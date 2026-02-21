## ADDED Requirements

### Requirement: Render playlist display view
The system SHALL provide a read-only display view for a playlist that shows the playlist name, service type, date, and songs organized by section with each song's title and key. The playlist editor header section SHALL use larger typography and more spacious layout for the playlist name, date, theme, and bible lessons metadata fields.

#### Scenario: View a playlist in display mode
- **WHEN** the user clicks a "Display" button on a playlist
- **THEN** the UI shows a clean, read-only view with the playlist name, service type label, date (if set), and songs grouped under their section headings with title and key for each

#### Scenario: Display a playlist with a missing song
- **WHEN** the display view is rendered for a playlist containing a song ID in any section that no longer exists
- **THEN** the missing song is shown with its ID and a "not found" indicator instead of title and key

#### Scenario: Playlist editor header uses enlarged typography
- **WHEN** the user opens the playlist editor
- **THEN** the playlist name SHALL be displayed at a larger font size (1.5rem+), and the metadata fields (date, type, theme, bible lessons) SHALL have increased spacing and font sizes for improved readability

#### Scenario: Playlist editor metadata has card-based layout
- **WHEN** the user views the playlist editor sidebar
- **THEN** the metadata section SHALL use generous padding, larger labels, and visually distinct grouping consistent with the Apple-inspired design language

### Requirement: Include song lyrics in display view
The system SHALL optionally include song lyrics in the display view, toggled by a control in the UI.

#### Scenario: Toggle lyrics on
- **WHEN** the user enables the "Show Lyrics" toggle in the display view
- **THEN** each song's full lyrics are displayed below its title and key

#### Scenario: Toggle lyrics off
- **WHEN** the user disables the "Show Lyrics" toggle in the display view
- **THEN** only song titles and keys are shown (no lyrics)

### Requirement: Print-friendly output
The system SHALL provide print-friendly styling so the display view can be printed or used for projection. Navigation, buttons, and non-essential UI elements SHALL be hidden when printing.

#### Scenario: Print the playlist
- **WHEN** the user prints the page while the display view is active
- **THEN** the printed output contains only the playlist name, date, and song list (with or without lyrics based on toggle state), with no navigation or buttons visible

### Requirement: Display playlist notes
The system SHALL show the playlist's notes in the display view if notes are present.

#### Scenario: Display view with notes
- **WHEN** the display view is rendered for a playlist that has notes
- **THEN** the notes are displayed below the playlist header and above the song list

#### Scenario: Display view without notes
- **WHEN** the display view is rendered for a playlist that has no notes
- **THEN** no notes section is shown

### Requirement: Navigate to display from playlist list
The frontend SHALL provide a way to open the display view directly from the playlist list without entering the editor.

#### Scenario: Open display from playlist list
- **WHEN** the user clicks a "Display" action on a playlist in the playlist list
- **THEN** the display view opens for that playlist
