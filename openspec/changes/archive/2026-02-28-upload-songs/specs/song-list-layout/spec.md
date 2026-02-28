## MODIFIED Requirements

### Requirement: Split-panel master-detail layout
The All Songs page SHALL use a two-panel layout with the song list on the left and a detail panel on the right. Selecting a song in the list SHALL populate the detail panel without navigating away from the list. An "Upload Song" button SHALL appear at the bottom of the song list panel for adding new songs from the browser.

#### Scenario: Initial layout with no song selected
- **WHEN** the user navigates to the All Songs page
- **THEN** the left panel shows the song list with search, filter, and sort controls at the top, the song list in the middle, and an "Upload Song" button at the bottom; the right panel shows a placeholder message prompting the user to select a song

#### Scenario: Select a song from the list
- **WHEN** the user clicks a song in the left panel list
- **THEN** the right panel displays the song's title, key, full lyrics, and the date it was last added to a playlist
- **AND** the clicked song is visually highlighted in the list as the active selection

#### Scenario: Switch between songs
- **WHEN** the user clicks a different song while one is already selected
- **THEN** the right panel updates to show the newly selected song's details
- **AND** the active highlight moves to the newly selected song

#### Scenario: Detail panel shows last used date
- **WHEN** a song is selected and it has been added to a dated playlist
- **THEN** the detail panel shows the date it was last used below the song title

#### Scenario: Detail panel for never-used song
- **WHEN** a song is selected and it has never been added to a dated playlist
- **THEN** the detail panel shows "Never used in a playlist" instead of a date

#### Scenario: Responsive stacking on small screens
- **WHEN** the viewport width is below 768px
- **THEN** the panels SHALL stack vertically with the list above and detail below
