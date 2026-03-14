## MODIFIED Requirements

### Requirement: Update a playlist
The system SHALL allow updating a playlist's name, sections (including song assignments and per-song music overrides), date, notes, and `googleDoc` URL. The `googleDoc` field SHALL be populated automatically when a Google Doc is created via the doc creation endpoint, in addition to being settable manually. The system SHALL update the `updatedAt` timestamp on each update. Song Suggestions SHALL be presented as a swipe card experience, allowing users to add suggested songs directly from the suggestions overlay without requiring a separate save action.

#### Scenario: Update playlist name
- **WHEN** a PUT request is sent to `/api/playlists/:id` with `{ "name": "New Name" }`
- **THEN** the system returns a 200 response with the updated playlist and an updated `updatedAt` timestamp

#### Scenario: Save sections with overrides
- **WHEN** a PUT request is sent with `sections: [{ name: "Opening", songs: [{ id: "amazing-grace", key: "A", tempo: null, notes: "Capo 2" }] }]`
- **THEN** the playlist is saved with the override values and a subsequent GET returns them merged into the resolved song

#### Scenario: Backward-compatible read of legacy songIds
- **WHEN** an existing playlist stored with `songIds: ["amazing-grace"]` is read
- **THEN** the system normalises it to `songs: [{ id: "amazing-grace", key: null, tempo: null, notes: null }]` transparently, and the response is correct

#### Scenario: googleDoc field set automatically on doc creation
- **WHEN** a user successfully creates a Google Doc from a playlist
- **THEN** the playlist's `googleDoc` field is updated to the new doc URL without requiring a separate save action

#### Scenario: Update a non-existent playlist
- **WHEN** a PUT request is sent to `/api/playlists/:id` with an ID that does not exist
- **THEN** the system returns a 404 response with an error message

#### Scenario: Song suggestions use swipe card UI
- **WHEN** the user requests song suggestions from the playlist editor
- **THEN** suggestions SHALL be presented as swipeable cards (not a static list), each saved immediately to the playlist on swipe right
