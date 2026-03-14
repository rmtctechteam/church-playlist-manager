## ADDED Requirements

### Requirement: Song suggestions API endpoint
The system SHALL provide a `POST /api/playlists/:id/suggestions` endpoint that calls the Claude API with the service theme, Bible lessons, and the full song library, and returns a ranked list of song suggestions along with the resolved theme used.

#### Scenario: Successful suggestions response
- **WHEN** a POST request is made to `/api/playlists/:id/suggestions` and `ANTHROPIC_API_KEY` is configured and a theme or bibleLessons is available
- **THEN** the system SHALL return 200 with `{ suggestions, theme }` where `suggestions` is a JSON array of objects each containing `songId`, `title`, `reason`, `section`, and `lastUsed` (ISO date string or null)

#### Scenario: Theme and lessons sourced from request body first
- **WHEN** a POST request is made with `theme` and/or `bibleLessons` in the request body
- **THEN** the system SHALL use those values in preference to anything stored on the playlist, allowing freshly looked-up values to be used before the playlist is saved

#### Scenario: Fallback to stored playlist values
- **WHEN** a POST request is made without `theme` or `bibleLessons` in the request body
- **THEN** the system SHALL fall back to the `theme` and `bibleLessons` fields stored on the playlist

#### Scenario: Playlist not found
- **WHEN** a POST request is made to `/api/playlists/:id/suggestions` with an ID that does not exist
- **THEN** the system SHALL return 404 with an error message

#### Scenario: No theme or bible lessons available
- **WHEN** a POST request is made and neither the request body nor the stored playlist provides a theme or bibleLessons
- **THEN** the system SHALL return 400 with an error message indicating there is insufficient context for suggestions

#### Scenario: ANTHROPIC_API_KEY not configured
- **WHEN** a POST request is made and the `ANTHROPIC_API_KEY` environment variable is not set
- **THEN** the system SHALL return 503 with an error message indicating the feature is not available

#### Scenario: Claude API call fails
- **WHEN** the Claude API call fails due to a network error or API error
- **THEN** the system SHALL return 502 with an error message

### Requirement: Song context passed to Claude
The system SHALL pass each song to Claude as a compact object containing the song ID, title, artist, and first lyric line. Full lyrics SHALL NOT be included.

#### Scenario: First line extraction
- **WHEN** the suggestions endpoint is called
- **THEN** the Claude prompt SHALL include each song's title, artist (if present), and the first non-empty line of lyrics from the song file

### Requirement: Structured suggestion response from Claude
The system SHALL instruct Claude to return a JSON array of suggestions. Each suggestion SHALL include the song ID, title, a brief reason for the match, and a suggested service section. The system SHALL enrich each suggestion with the song's last-performed date from the analytics database before returning.

#### Scenario: Claude returns valid JSON suggestions
- **WHEN** the Claude API responds successfully
- **THEN** the system SHALL parse the response, enrich each entry with `lastUsed` (most recent service date from analytics, or null if never performed), and return the enriched array to the client

### Requirement: Suggest vs. pick choice after new playlist creation
The UI SHALL present the user with a choice — "Get Song Suggestions" or "Pick Songs Myself" — immediately after a new playlist is created and the lectionary auto-lookup completes, provided `ANTHROPIC_API_KEY` is configured.

#### Scenario: User chooses Get Song Suggestions
- **WHEN** the user clicks "Get Song Suggestions" after creating a new playlist
- **THEN** the system SHALL call the suggestions endpoint, display a loading state, and show the suggestions panel when results arrive

#### Scenario: User chooses Pick Songs Myself
- **WHEN** the user clicks "Pick Songs Myself" after creating a new playlist
- **THEN** the system SHALL dismiss the choice overlay and present the standard playlist editor

#### Scenario: ANTHROPIC_API_KEY not set — choice not shown
- **WHEN** the server does not have `ANTHROPIC_API_KEY` configured
- **THEN** the UI SHALL skip the suggest-vs-pick step entirely and open the playlist editor directly (matching today's behavior)

### Requirement: Suggest Songs button in playlist editor
The playlist editor SHALL display a "Suggest Songs" button in the bottom toolbar whenever `ANTHROPIC_API_KEY` is configured, allowing the user to request suggestions at any time — not only during new playlist creation.

#### Scenario: User clicks Suggest Songs on an existing playlist
- **WHEN** the user clicks "Suggest Songs" in the playlist editor toolbar
- **THEN** the system SHALL open the suggestions panel directly (no suggest-vs-pick choice) and fetch suggestions using the current theme and Bible lessons fields

### Requirement: Suggestion panel displays results
The UI SHALL display the returned suggestions in a panel. The panel SHALL show the service theme at the top, followed by a list of songs each showing the title, reason for the match, last-performed date, and a section selector with an Add button.

#### Scenario: Theme shown at top of panel
- **WHEN** the suggestions panel renders successfully
- **THEN** the theme SHALL be displayed prominently at the top of the panel

#### Scenario: Last-performed date shown per song
- **WHEN** a suggestion has a non-null `lastUsed` value
- **THEN** the panel SHALL display the formatted date (e.g. "Last performed: March 2, 2025")

#### Scenario: Never-performed indicator
- **WHEN** a suggestion has a null `lastUsed` value
- **THEN** the panel SHALL display "Never performed"

#### Scenario: User adds a suggested song
- **WHEN** the user clicks "Add" on a suggestion
- **THEN** the system SHALL add the song to the selected section in the playlist, save immediately, and visually mark the suggestion as added

#### Scenario: Suggestion panel dismissed
- **WHEN** the user clicks "Done"
- **THEN** the system SHALL close the panel, re-fetch the resolved playlist from the server, and re-render the playlist editor so that all added songs display with correct titles without requiring a manual Save
