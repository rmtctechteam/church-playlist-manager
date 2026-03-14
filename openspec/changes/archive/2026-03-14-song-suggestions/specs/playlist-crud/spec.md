## MODIFIED Requirements

### Requirement: Create a playlist
The system SHALL allow creating a new playlist with a name and a service type. The system SHALL generate a unique ID, initialize the `sections` array from the selected service type's template (each section with an empty `songIds` array), and record `createdAt` and `updatedAt` timestamps. After creation, the UI SHALL perform a lectionary auto-lookup and then present the user with a "Get Song Suggestions" or "Pick Songs Myself" choice before entering the full editor — unless `ANTHROPIC_API_KEY` is not configured, in which case the suggestion step is skipped and the editor opens directly.

#### Scenario: Create a playlist with a service type
- **WHEN** a POST request is sent to `/api/playlists` with `{ "name": "Sunday Worship", "type": "holy-communion" }`
- **THEN** the system returns a 201 response with the created playlist containing a generated `id`, the given `name`, `type` set to `"holy-communion"`, `sections` initialized to `[{ "name": "Gathering", "songIds": [] }, { "name": "Word", "songIds": [] }, { "name": "Communion", "songIds": [] }, { "name": "Sending", "songIds": [] }]`, null `date`, null `notes`, and valid timestamps

#### Scenario: Create a custom playlist
- **WHEN** a POST request is sent to `/api/playlists` with `{ "name": "Special Event", "type": "custom", "sections": [{ "name": "Welcome" }, { "name": "Main Set" }] }`
- **THEN** the system returns a 201 response with `type` set to `"custom"` and `sections` initialized from the provided section names with empty `songIds` arrays

#### Scenario: Create a playlist without a name
- **WHEN** a POST request is sent to `/api/playlists` with no `name` field or an empty `name`
- **THEN** the system returns a 400 response with an error message indicating name is required

#### Scenario: Create a playlist with an invalid type
- **WHEN** a POST request is sent to `/api/playlists` with a `type` that is not a valid service type ID and is not `"custom"`
- **THEN** the system returns a 400 response with an error message indicating the type is invalid

#### Scenario: Post-creation flow with suggestions available
- **WHEN** a new playlist is successfully created and `ANTHROPIC_API_KEY` is configured
- **THEN** the UI SHALL auto-run the lectionary lookup, then display the "Get Song Suggestions / Pick Songs Myself" choice overlay before showing the full editor

#### Scenario: Post-creation flow without suggestions available
- **WHEN** a new playlist is successfully created and `ANTHROPIC_API_KEY` is not configured
- **THEN** the UI SHALL auto-run the lectionary lookup and open the full editor directly, with no suggestion step shown
