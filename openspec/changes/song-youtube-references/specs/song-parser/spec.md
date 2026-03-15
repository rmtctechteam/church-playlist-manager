## MODIFIED Requirements

### Requirement: Parse song metadata from text files
The song parser SHALL read a `.txt` file from the `songs/` directory and extract metadata fields from the header: Title, Artist, Key, Tempo, Notes, and YouTube. Each field appears on its own line in `Field: Value` format. The metadata section ends at the first blank line. The `YouTube` field SHALL be parsed into a `youtubeUrls` array by splitting the value on `, ` (comma-space).

#### Scenario: Parse a well-formed song file
- **WHEN** the parser reads a file containing `Title: Amazing Grace`, `Artist: John Newton`, `Key: G`, `Tempo: 80 BPM`
- **THEN** it returns an object with `title: "Amazing Grace"`, `artist: "John Newton"`, `key: "G"`, `tempo: "80 BPM"`

#### Scenario: Missing optional metadata fields
- **WHEN** a song file omits the Key or Tempo fields
- **THEN** the parser returns `null` for the missing fields and still parses the remaining metadata and lyrics

#### Scenario: Parse Notes metadata field
- **WHEN** a song file contains `Notes: Capo 2, play in G`
- **THEN** the parser returns `notes: "Capo 2, play in G"` in the song object

#### Scenario: Notes field absent
- **WHEN** a song file has no `Notes:` line in its header
- **THEN** the parser returns `notes: null` in the song object

#### Scenario: Parse single YouTube URL
- **WHEN** a song file contains `YouTube: https://youtu.be/abc123`
- **THEN** the parser returns `youtubeUrls: ["https://youtu.be/abc123"]`

#### Scenario: Parse multiple YouTube URLs
- **WHEN** a song file contains `YouTube: https://youtu.be/abc123, https://youtu.be/xyz789`
- **THEN** the parser returns `youtubeUrls: ["https://youtu.be/abc123", "https://youtu.be/xyz789"]`

#### Scenario: YouTube field absent
- **WHEN** a song file has no `YouTube:` line
- **THEN** the parser returns `youtubeUrls: []`
