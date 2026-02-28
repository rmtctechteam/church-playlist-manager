## ADDED Requirements

### Requirement: Upload one or more song files via the browser
The system SHALL allow users to upload one or more `.txt` song files from the All Songs page. Each valid file SHALL be saved to the server's `songs/` directory and immediately available in the song list without a page reload.

#### Scenario: Upload a single valid .txt file
- **WHEN** the user clicks the "Upload Song" button, selects a valid `.txt` file, and confirms
- **THEN** the file SHALL be saved to the `songs/` directory, the song SHALL be added to the in-memory song list, and the All Songs list SHALL refresh to include the new song

#### Scenario: Upload multiple valid .txt files at once
- **WHEN** the user clicks the "Upload Song" button and selects multiple `.txt` files
- **THEN** all valid files SHALL be saved to the `songs/` directory and all new songs SHALL appear in the refreshed list

#### Scenario: Upload a file that fails validation
- **WHEN** the user uploads a `.txt` file that cannot be parsed as a valid song
- **THEN** the server SHALL return an error for that file, the file SHALL NOT be saved, and the UI SHALL display an error message identifying the failed file

#### Scenario: Upload a file with a duplicate filename
- **WHEN** the user uploads a `.txt` file whose filename already exists in the `songs/` directory
- **THEN** the server SHALL return a 409 Conflict for that file, the existing file SHALL NOT be overwritten, and the UI SHALL display a message indicating the file already exists

#### Scenario: Partial success with multiple files
- **WHEN** the user uploads multiple files and some are valid while others fail validation or have duplicate filenames
- **THEN** valid files SHALL be saved and appear in the list, and the UI SHALL report which files succeeded and which failed

### Requirement: Upload endpoint
The server SHALL expose a `POST /api/songs/upload` endpoint that accepts `multipart/form-data` with a `songs` field containing one or more `.txt` files.

#### Scenario: Successful upload returns parsed song data
- **WHEN** a valid `.txt` file is posted to `POST /api/songs/upload`
- **THEN** the server SHALL respond with HTTP 200 and a JSON array of result objects, each containing the filename and either the parsed song summary or an error message

#### Scenario: Request with no files
- **WHEN** a request is posted to `POST /api/songs/upload` with no files attached
- **THEN** the server SHALL respond with HTTP 400 and an error message
