## ADDED Requirements

### Requirement: Song list items display a lyrics preview
Each song item in the All Songs list SHALL display the first two non-empty lines of the song's lyrics beneath the song title, so worship leaders can identify songs without clicking through to the detail panel.

#### Scenario: Song with lyrics shows preview
- **WHEN** the All Songs list is rendered and a song has at least one line of lyrics
- **THEN** each song list item displays the song title on the first line and up to two lines of lyrics (joined by " / ") on the second line in a muted, smaller font

#### Scenario: Song with no lyrics shows title only
- **WHEN** a song has no lyrics content
- **THEN** the list item displays only the song title with no preview line

#### Scenario: Preview is visually truncated on overflow
- **WHEN** the lyrics preview text is longer than the available width
- **THEN** the preview is truncated with an ellipsis and does not wrap to a second line
