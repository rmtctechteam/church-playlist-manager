## ADDED Requirements

### Requirement: Assign a date to a playlist
The system SHALL allow assigning a service date (ISO 8601 date string, e.g., `2026-02-15`) to a playlist. A playlist's date MAY be null if it is not scheduled for a specific service.

#### Scenario: Create a playlist with a date
- **WHEN** a POST request is sent to `/api/playlists` with `{ "name": "Sunday AM", "date": "2026-02-15" }`
- **THEN** the system returns a 201 response with the playlist containing `"date": "2026-02-15"`

#### Scenario: Update a playlist's date
- **WHEN** a PUT request is sent to `/api/playlists/:id` with `{ "date": "2026-03-01" }`
- **THEN** the system returns a 200 response with the updated date

#### Scenario: Remove a playlist's date
- **WHEN** a PUT request is sent to `/api/playlists/:id` with `{ "date": null }`
- **THEN** the system returns a 200 response with `date` set to null

### Requirement: Filter playlists by upcoming dates
The system SHALL support filtering playlists to show only those with dates in the future (on or after today).

#### Scenario: Filter upcoming playlists
- **WHEN** a GET request is sent to `/api/playlists?upcoming=true`
- **THEN** the system returns only playlists whose `date` is today or in the future, sorted by date ascending (nearest first)

#### Scenario: No upcoming playlists
- **WHEN** a GET request is sent to `/api/playlists?upcoming=true` and no playlists have future dates
- **THEN** the system returns a 200 response with an empty array

### Requirement: Browse playlists by date in the UI
The frontend SHALL display playlists grouped or sorted by date, with upcoming services prominently visible. Past playlists SHALL remain accessible.

#### Scenario: View playlist list in the UI
- **WHEN** the user navigates to the Playlists tab
- **THEN** playlists are displayed sorted by date with upcoming services shown first and past services shown below

#### Scenario: Identify upcoming vs past playlists
- **WHEN** the playlist list is displayed
- **THEN** upcoming playlists are visually distinguished from past playlists (e.g., past playlists are dimmed or grouped separately)
