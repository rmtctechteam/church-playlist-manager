## MODIFIED Requirements

### Requirement: Display full song details
The frontend SHALL allow the user to select a song from the list and view its full details: title, artist, key, tempo, music notes, and complete lyrics. A Music section groups key and notes together beneath the metadata header. Lyrics are displayed as groups of lines separated by visual spacing. Section labels are not displayed.

#### Scenario: View song details
- **WHEN** the user clicks on a song in the list
- **THEN** the page displays the song's title, artist, key, tempo, and full lyrics grouped by section with visual spacing between groups (section labels are not shown)

#### Scenario: View song with music notes
- **WHEN** the user clicks on a song that has a `notes` value
- **THEN** the detail panel displays a Music section containing the key (if present) and the notes text below the metadata header and above the lyrics

#### Scenario: Return to song list
- **WHEN** the user is viewing song details and clicks a back/return control
- **THEN** the user returns to the song list with their previous search preserved
