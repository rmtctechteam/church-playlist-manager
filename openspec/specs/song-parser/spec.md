## ADDED Requirements

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

### Requirement: Parse song lyrics into sections
The song parser SHALL extract lyrics as an ordered array of sections. Sections are delimited by blank lines. Section labels (a line ending in `:`, e.g., `Verse 1:`, `Chorus:`) are optional. When a label is present, it names the section. When no label is present, the section is auto-numbered as `Section N`.

#### Scenario: Parse labeled sections
- **WHEN** a song file contains `Verse 1:` followed by two lines, then `Verse 2:` followed by two lines
- **THEN** the parser returns a lyrics array with two objects: `{ section: "Verse 1", lines: ["line1", "line2"] }` and `{ section: "Verse 2", lines: ["line1", "line2"] }`

#### Scenario: Parse unlabeled sections
- **WHEN** a song file contains lyric lines separated by blank lines without any section labels
- **THEN** the parser returns sections auto-numbered as `Section 1`, `Section 2`, etc., each containing the lyric lines between blank lines

#### Scenario: Mix of labeled and unlabeled sections
- **WHEN** a song file contains a labeled section (`Verse 1:`) followed by an unlabeled group of lines, then another labeled section (`Chorus:`)
- **THEN** the labeled sections use their labels and the unlabeled section is auto-numbered (e.g., `Section 2`)

#### Scenario: Blank lines between sections
- **WHEN** lyric sections are separated by one or more blank lines
- **THEN** the parser treats blank lines as section delimiters and does not include them in any section's lines

### Requirement: Derive song ID from filename
The song parser SHALL derive a unique song ID from the filename by stripping the `.txt` extension. The ID uses the kebab-case filename (e.g., `amazing-grace.txt` → `amazing-grace`).

#### Scenario: Generate ID from filename
- **WHEN** parsing a file named `how-great-thou-art.txt`
- **THEN** the resulting song object has `id: "how-great-thou-art"`

### Requirement: Load all songs from directory
The song parser module SHALL provide a function to read all `.txt` files from the songs directory and return an array of parsed song objects. The songs directory SHALL be resolved from `VOLUME_PATH` (i.e., `<VOLUME_PATH>/songs/`) rather than a hardcoded relative path.

#### Scenario: Load a directory with multiple song files
- **WHEN** the songs directory contains `amazing-grace.txt` and `how-great-thou-art.txt`
- **THEN** the loader returns an array of two parsed song objects

#### Scenario: Ignore non-txt files
- **WHEN** the songs directory contains files with extensions other than `.txt`
- **THEN** those files are skipped and not included in the result

#### Scenario: VOLUME_PATH controls songs directory location
- **WHEN** `VOLUME_PATH` is set to `/app/volume`
- **THEN** songs are loaded from `/app/volume/songs/`
