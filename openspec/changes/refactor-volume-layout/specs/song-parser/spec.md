## MODIFIED Requirements

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
