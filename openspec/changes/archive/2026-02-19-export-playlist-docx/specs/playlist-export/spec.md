## ADDED Requirements

### Requirement: Export playlist as .docx document
The system SHALL provide an API endpoint `GET /api/playlists/:id/export` that generates and returns a `.docx` Word document containing the playlist content.

#### Scenario: Successful export of a playlist
- **WHEN** a GET request is made to `/api/playlists/:id/export` with a valid playlist ID
- **THEN** the response SHALL have status 200, Content-Type `application/vnd.openxmlformats-officedocument.wordprocessingml.document`, and a Content-Disposition header with the playlist name as filename

#### Scenario: Export of non-existent playlist
- **WHEN** a GET request is made to `/api/playlists/:id/export` with an invalid playlist ID
- **THEN** the response SHALL have status 404

### Requirement: Document contains playlist metadata
The exported document SHALL include the playlist name as a Heading 1, followed by the date, theme, and bible lessons as italic text lines when present.

#### Scenario: Playlist with all metadata fields
- **WHEN** a playlist with date, theme, and bible lessons is exported
- **THEN** the document SHALL contain the playlist name as heading, and date, theme, and bible lessons as italic paragraphs

#### Scenario: Playlist with only a date
- **WHEN** a playlist with only a date (no theme or bible lessons) is exported
- **THEN** the document SHALL contain only the name heading and date line

### Requirement: Document contains section headings and songs
The exported document SHALL include each playlist section as a Heading 2, with each song's title as a Heading 3 underneath, followed by key/tempo metadata and full lyrics.

#### Scenario: Section with songs
- **WHEN** a section contains songs with lyrics
- **THEN** the document SHALL show the section name as Heading 2, song title as Heading 3, key/tempo as italic text, and all lyric lines

#### Scenario: Song not found
- **WHEN** a section contains a song ID that cannot be resolved
- **THEN** the document SHALL skip that song

### Requirement: Lyrics preserve original verse spacing
The exported document SHALL preserve blank-line spacing between lyric sections (verses, choruses) as they appear in the source song files.

#### Scenario: Song with multiple verses separated by blank lines
- **WHEN** a song has multiple lyric sections in the source file
- **THEN** the document SHALL render each section as a separate paragraph with a blank line between them

### Requirement: Visual separation between songs
The exported document SHALL include visual separation between songs using a light gray separator line.

#### Scenario: Multiple songs in the document
- **WHEN** the document contains more than one song
- **THEN** a separator SHALL appear after each song's lyrics before the next heading

### Requirement: Export Doc button in playlist editor
The playlist editor UI SHALL include an "Export Doc" button that triggers a download of the exported document.

#### Scenario: User clicks Export Doc
- **WHEN** the user clicks the "Export Doc" button in the playlist editor
- **THEN** the browser SHALL download the `.docx` file for the current playlist
