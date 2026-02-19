## ADDED Requirements

### Requirement: Lectionary lookup API endpoint
The system SHALL provide an API endpoint `GET /api/lectionary?date=YYYY-MM-DD` that fetches the Mar Thoma lectionary page, finds the entry matching the given date, and returns the theme and bible lessons.

#### Scenario: Successful lookup for a valid date
- **WHEN** a GET request is made to `/api/lectionary?date=2026-02-22`
- **THEN** the response SHALL have status 200 and return JSON with `theme` (string) and `bibleLessons` (string containing 4 comma-separated references)

#### Scenario: Date not found on lectionary
- **WHEN** a GET request is made with a date that has no lectionary entry
- **THEN** the response SHALL have status 404 with an error message

#### Scenario: Missing date parameter
- **WHEN** a GET request is made to `/api/lectionary` without a date query parameter
- **THEN** the response SHALL have status 400 with an error message

### Requirement: Extract English-only theme
The system SHALL extract only the English portion of the bilingual theme, stripping Malayalam text. The lectionary format uses a semicolon separator between Malayalam and English.

#### Scenario: Bilingual theme extraction
- **WHEN** the lectionary entry contains a theme like "Malayalam text; English Theme Text"
- **THEN** the API SHALL return only "English Theme Text" as the theme

### Requirement: Extract bible lessons excluding Evening Readings
The system SHALL extract bible references from the Lessons, Epistle, and Gospel rows only, excluding Evening Reading entries. The result SHALL contain exactly 4 lesson references.

#### Scenario: Standard lectionary entry with all reading types
- **WHEN** the lectionary entry contains Lessons (2 references), Epistle (1 reference), and Gospel (1 reference)
- **THEN** the API SHALL return all 4 references as a comma-separated string, excluding any Evening Reading references

### Requirement: Lookup button in playlist editor
The playlist editor SHALL include a "Lookup" button that fetches lectionary data for the playlist's service date and populates the Theme and Bible Lessons fields.

#### Scenario: User clicks Lookup with a date set
- **WHEN** the user clicks the "Lookup" button and a service date is set in the editor
- **THEN** the system SHALL call the lectionary API with that date and populate the Theme and Bible Lessons fields with the response

#### Scenario: User clicks Lookup without a date
- **WHEN** the user clicks the "Lookup" button and no service date is set
- **THEN** the system SHALL show an alert asking the user to set a date first

#### Scenario: Lookup fails or date not found
- **WHEN** the lectionary API returns an error
- **THEN** the system SHALL show an alert with the error message

### Requirement: Lectionary fetch error handling
The system SHALL handle network errors and unexpected HTML gracefully when fetching the lectionary page.

#### Scenario: Lectionary website is unreachable
- **WHEN** the fetch to the lectionary website fails due to network error
- **THEN** the API SHALL return status 502 with an error message indicating the lectionary site could not be reached
