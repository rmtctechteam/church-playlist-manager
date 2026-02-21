## ADDED Requirements

### Requirement: Get songs used since a date
The API SHALL expose `GET /api/songs/used?since=YYYY-MM-DD` which returns a JSON array of song IDs that have been added to a dated playlist on or after the given date.

#### Scenario: Retrieve songs used in the last week
- **WHEN** a client sends `GET /api/songs/used?since=2026-02-13`
- **THEN** the API responds with HTTP 200 and a JSON array of song ID strings for songs used on or after that date

#### Scenario: No songs used since date
- **WHEN** a client sends `GET /api/songs/used?since=2099-01-01`
- **THEN** the API responds with HTTP 200 and an empty JSON array

#### Scenario: Missing since parameter
- **WHEN** a client sends `GET /api/songs/used` without a since parameter
- **THEN** the API responds with HTTP 400 and a JSON error message

### Requirement: Get bulk usage summary for all songs
The API SHALL expose `GET /api/songs/usage-summary` which returns a JSON object mapping song IDs to their usage count and last-used date for all songs that have at least one usage record.

#### Scenario: Retrieve usage summary
- **WHEN** a client sends `GET /api/songs/usage-summary`
- **THEN** the API responds with HTTP 200 and a JSON object where each key is a song ID and each value contains `count` (number) and `lastUsed` (date string)

#### Scenario: No usage data exists
- **WHEN** a client sends `GET /api/songs/usage-summary` and no songs have usage records
- **THEN** the API responds with HTTP 200 and an empty JSON object
