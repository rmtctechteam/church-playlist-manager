## MODIFIED Requirements

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
