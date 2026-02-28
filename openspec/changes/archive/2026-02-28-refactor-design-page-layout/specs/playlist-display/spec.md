## MODIFIED Requirements

### Requirement: Render playlist display view
The system SHALL provide a read-only display view for a playlist that shows the playlist name, service type, date, and songs organized by section with each song's title, effective key, tempo, and notes. The playlist editor header section SHALL use Apple Design System styling with a Home navigation icon, and the Theme and Bible Lessons fields SHALL be editable directly in the summary panel (not the sidebar).

#### Scenario: View a playlist in display mode
- **WHEN** the user clicks a "Display" button on a playlist
- **THEN** the UI shows a clean, read-only view with the playlist name, service type label, date (if set), and songs grouped under their section headings with title, key, tempo, and notes for each (using playlist-level overrides where set, otherwise master song values)

#### Scenario: Display song with key override
- **WHEN** the Display Playlist view renders a song that has a playlist-level key override
- **THEN** the override key is shown (not the master song key)

#### Scenario: Display song with notes override
- **WHEN** the Display Playlist view renders a song that has playlist-level notes set
- **THEN** the notes text is shown beneath the song title in the display view

#### Scenario: Display a playlist with a missing song
- **WHEN** the display view is rendered for a playlist containing a song ID in any section that no longer exists
- **THEN** the missing song is shown with its ID and a "not found" indicator instead of title and key

#### Scenario: Playlist editor header uses Apple Design System styling
- **WHEN** the user opens the playlist editor
- **THEN** the page header SHALL use the system font stack (-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif), display the playlist name at 1.75rem or larger, use a clean light background with a subtle bottom border, and provide adequate vertical padding (16px+)

#### Scenario: Playlist editor metadata has card-based layout
- **WHEN** the user views the playlist editor
- **THEN** the metadata section SHALL use generous padding, larger labels, and visually distinct grouping consistent with the Apple-inspired design language

### Requirement: Playlist editor sidebar omits Theme and Bible Lessons
The playlist editor sidebar SHALL NOT contain Theme or Bible Lessons input fields. These fields are managed exclusively through the summary panel.

#### Scenario: Sidebar does not show Theme or Bible Lessons inputs
- **WHEN** the user opens the playlist editor sidebar
- **THEN** the sidebar SHALL contain Name, Type, Service Date, Song Sheet Google Doc, and Notes fields — but SHALL NOT contain Theme or Bible Lessons fields

### Requirement: Inline-editable Theme and Lessons in summary panel
The playlist editor summary panel SHALL display Theme and Lessons as editable input fields so users can update them without scrolling to a separate sidebar section.

#### Scenario: Theme field is editable in summary panel
- **WHEN** the user views the playlist editor summary panel
- **THEN** the Theme field SHALL be rendered as an editable textarea (not read-only text), pre-populated with the current theme value

#### Scenario: Lessons field is editable in summary panel
- **WHEN** the user views the playlist editor summary panel
- **THEN** the Lessons field SHALL be rendered as an editable textarea (not read-only text), pre-populated with the current bible lessons value

#### Scenario: Summary panel edits are saved with playlist
- **WHEN** the user edits Theme or Lessons in the summary panel and saves the playlist
- **THEN** the updated values SHALL be persisted to the playlist data

### Requirement: Home navigation icon in playlist editor header
The playlist editor page header SHALL include a Home icon button that returns the user to the home page.

#### Scenario: Home icon is present in editor header
- **WHEN** the user opens the playlist editor
- **THEN** the page header SHALL display a Home icon button (e.g., ⌂) positioned at the leading edge of the header

#### Scenario: Home icon navigates to home page
- **WHEN** the user clicks the Home icon button in the playlist editor header
- **THEN** the application SHALL navigate to the home page view, hiding the playlist editor
