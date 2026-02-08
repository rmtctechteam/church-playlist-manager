## ADDED Requirements

### Requirement: Display song library with search
The frontend SHALL display a list of all songs showing title and artist for each. A search input field SHALL filter the displayed list in real-time as the user types, using the search API.

#### Scenario: Initial page load
- **WHEN** the user navigates to the application
- **THEN** the page displays a search input and a list of all songs with their title and artist

#### Scenario: Search filters the song list
- **WHEN** the user types "grace" into the search input
- **THEN** the displayed list updates to show only songs matching "grace" in title or artist or lyrics. the results will be ranked by title, artist then lyric match in this order.

#### Scenario: Clear search shows all songs
- **WHEN** the user clears the search input
- **THEN** the full list of all songs is displayed again

### Requirement: Display full song details
The frontend SHALL allow the user to select a song from the list and view its full details: title, artist, key, tempo, and complete lyrics. Lyrics are displayed as groups of lines separated by visual spacing. Section labels are not displayed.

#### Scenario: View song details
- **WHEN** the user clicks on a song in the list
- **THEN** the page displays the song's title, artist, key, tempo, and full lyrics grouped by section with visual spacing between groups (section labels are not shown)

#### Scenario: Return to song list
- **WHEN** the user is viewing song details and clicks a back/return control
- **THEN** the user returns to the song list with their previous search preserved
