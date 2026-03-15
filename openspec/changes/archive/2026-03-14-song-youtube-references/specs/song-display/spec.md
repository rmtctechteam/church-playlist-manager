## MODIFIED Requirements

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
- **THEN** the song list is displayed again

#### Scenario: YouTube references section shown
- **WHEN** a song has one or more YouTube URLs
- **THEN** the detail view displays a "YouTube References" section with a link card for each URL

#### Scenario: YouTube link card opens new tab
- **WHEN** the user taps a YouTube link card
- **THEN** the video opens in a new browser tab

#### Scenario: No YouTube references
- **WHEN** a song has no YouTube URLs
- **THEN** the detail view shows an "Add YouTube reference" prompt in place of the section

#### Scenario: Add YouTube URL from detail view
- **WHEN** the user enters a valid YouTube URL in the add field and clicks Add
- **THEN** the URL is saved via PATCH and the card appears in the YouTube References section

#### Scenario: Remove YouTube URL from detail view
- **WHEN** the user clicks the remove (✕) button on a YouTube link card
- **THEN** the URL is removed via PATCH and the card disappears from the section
