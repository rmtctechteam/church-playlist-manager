## ADDED Requirements

### Requirement: Song detail panel displays a Music section
The song detail panel SHALL include a "Music" section that groups the song's key and music notes together. The section SHALL only be rendered when at least one of key or notes is present.

#### Scenario: Song with key and notes shows full Music section
- **WHEN** the user selects a song that has both a `key` and a `notes` value
- **THEN** the detail panel displays a "Music" section containing the key value and the notes text

#### Scenario: Song with key only shows key in Music section
- **WHEN** the user selects a song that has a `key` but no `notes` value
- **THEN** the Music section displays the key value and no notes block

#### Scenario: Song with notes only shows notes in Music section
- **WHEN** the user selects a song that has a `notes` value but no `key`
- **THEN** the Music section displays the notes text and no key chip

#### Scenario: Song with neither key nor notes omits Music section
- **WHEN** the user selects a song that has no `key` and no `notes`
- **THEN** no Music section is rendered in the detail panel

#### Scenario: Long notes text wraps without truncation
- **WHEN** the notes value is longer than a single line
- **THEN** the notes text wraps to multiple lines and is fully visible (not truncated with ellipsis)
