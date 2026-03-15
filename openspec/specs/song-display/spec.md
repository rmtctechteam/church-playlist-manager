## ADDED Requirements

### Requirement: Display song library with search
The frontend SHALL display a list of all songs showing only the song title for each. A search input field SHALL filter the displayed list in real-time as the user types, using the search API. The list SHALL include sort and filter controls above the song list.

#### Scenario: Initial page load
- **WHEN** the user navigates to the All Songs page
- **THEN** the page displays search, filter, and sort controls, and a list of all songs showing only their title

#### Scenario: Search filters the song list
- **WHEN** the user types "grace" into the search input
- **THEN** the displayed list updates to show only songs matching "grace" in title or artist or lyrics. The results will be ranked by title, artist then lyric match in this order.

#### Scenario: Clear search shows all songs
- **WHEN** the user clears the search input
- **THEN** the full list of all songs is displayed again

### Requirement: Display full song details
The frontend SHALL allow the user to select a song from the list and view its full details: title, artist, key, tempo, music notes, complete lyrics, and YouTube reference links. A Music section groups key and notes together beneath the metadata header. Lyrics are displayed as groups of lines separated by visual spacing. Section labels are not displayed. A YouTube References section SHALL appear below the Music section when one or more YouTube URLs are stored for the song, displaying each as a tappable link card that opens the video in a new tab. An inline edit control SHALL allow adding, editing, and removing YouTube URLs from the detail view.

#### Scenario: View song details
- **WHEN** the user clicks on a song in the list
- **THEN** the page displays the song's title, artist, key, tempo, and full lyrics grouped by section with visual spacing between groups (section labels are not shown)

#### Scenario: View song with music notes
- **WHEN** the user clicks on a song that has a `notes` value
- **THEN** the detail panel displays a Music section containing the key (if present) and the notes text below the metadata header and above the lyrics

#### Scenario: Return to song list
- **WHEN** the user is viewing song details and clicks a back/return control
- **THEN** the user returns to the song list with their previous search preserved

#### Scenario: YouTube references section shown
- **WHEN** a song has one or more YouTube URLs
- **THEN** the detail view displays a "YouTube References" section with a link card for each URL

#### Scenario: YouTube link card opens new tab
- **WHEN** the user taps a YouTube link card
- **THEN** the video opens in a new browser tab

#### Scenario: No YouTube references
- **WHEN** a song has no YouTube URLs
- **THEN** the detail view shows an "Add YouTube reference" prompt in place of the section

#### Scenario: Search YouTube from detail view
- **WHEN** the user clicks the "Search YouTube" button in the YouTube References section
- **THEN** a new tab opens with a YouTube search pre-filled with the song's title and artist

#### Scenario: Add YouTube URL from detail view
- **WHEN** the user enters a valid YouTube URL in the add field and clicks Add
- **THEN** the URL is saved via PATCH and the card appears in the YouTube References section

#### Scenario: Remove YouTube URL from detail view
- **WHEN** the user clicks the remove (✕) button on a YouTube link card
- **THEN** the URL is removed via PATCH and the card disappears from the section

### Requirement: Sort song list
The frontend SHALL provide a sort control that allows the user to change the order of the song list. The available sort options SHALL be: Title A-Z (default), Title Z-A, Last Used, and Most Used.

#### Scenario: Default sort is Title A-Z
- **WHEN** the user navigates to the All Songs page
- **THEN** songs are listed in alphabetical order by title (A to Z)

#### Scenario: Sort by Title Z-A
- **WHEN** the user selects "Title Z-A" sort
- **THEN** songs are listed in reverse alphabetical order by title

#### Scenario: Sort by Last Used
- **WHEN** the user selects "Last Used" sort
- **THEN** songs are listed with the most recently used song first, and songs never used are listed last

#### Scenario: Sort by Most Used
- **WHEN** the user selects "Most Used" sort
- **THEN** songs are listed with the highest usage count first, and songs never used are listed last

#### Scenario: Sort persists with filter and search
- **WHEN** the user changes the sort while a filter or search is active
- **THEN** the current filtered/searched results are re-sorted in the new order
