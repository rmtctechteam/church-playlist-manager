## ADDED Requirements

### Requirement: Store YouTube reference URLs in song metadata
Each song MAY have one or more YouTube reference URLs stored as a `YouTube:` field in the song's `.txt` metadata header. Multiple URLs are stored comma-space separated on a single line.

#### Scenario: Single YouTube URL in file
- **WHEN** a song file contains `YouTube: https://youtu.be/abc123`
- **THEN** the song API response includes `youtubeUrls: ["https://youtu.be/abc123"]`

#### Scenario: Multiple YouTube URLs in file
- **WHEN** a song file contains `YouTube: https://youtu.be/abc123, https://youtu.be/xyz789`
- **THEN** the song API response includes `youtubeUrls: ["https://youtu.be/abc123", "https://youtu.be/xyz789"]`

#### Scenario: No YouTube field in file
- **WHEN** a song file has no `YouTube:` line
- **THEN** the song API response includes `youtubeUrls: []`

### Requirement: Save YouTube URLs via API
The system SHALL provide a `PATCH /api/songs/:id/youtube` endpoint that accepts an array of YouTube URLs and writes them back to the song's `.txt` file, replacing any existing `YouTube:` line.

#### Scenario: Add a YouTube URL
- **WHEN** a PATCH request is sent to `/api/songs/:id/youtube` with `{ "youtubeUrls": ["https://youtu.be/abc123"] }`
- **THEN** the system returns a 200 response with the updated song object and the `YouTube:` line in the file is updated

#### Scenario: Remove all YouTube URLs
- **WHEN** a PATCH request is sent with `{ "youtubeUrls": [] }`
- **THEN** the `YouTube:` line is removed from the file and `youtubeUrls: []` is returned

#### Scenario: Invalid URL rejected
- **WHEN** a PATCH request contains a URL that does not start with `https://` or does not contain `youtube.com` or `youtu.be`
- **THEN** the system returns a 400 response with an error message

#### Scenario: Too many URLs rejected
- **WHEN** a PATCH request contains more than 5 YouTube URLs
- **THEN** the system returns a 400 response indicating the maximum is 5

#### Scenario: Song not found
- **WHEN** a PATCH request is sent for a song ID that does not exist
- **THEN** the system returns a 404 response

#### Scenario: File write is atomic
- **WHEN** the YouTube URLs are saved
- **THEN** the system SHALL write to a temporary file first and rename it to the final path to minimise corruption risk
