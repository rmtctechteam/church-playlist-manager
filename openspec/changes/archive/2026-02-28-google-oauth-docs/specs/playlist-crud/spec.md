## MODIFIED Requirements

### Requirement: Update a playlist
The system SHALL allow updating a playlist's name, sections, date, notes, and `googleDoc` URL. The `googleDoc` field SHALL be populated automatically when a Google Doc is created via the doc creation endpoint, in addition to being settable manually.

#### Scenario: googleDoc field set automatically on doc creation
- **WHEN** a user successfully creates a Google Doc from a playlist
- **THEN** the playlist's `googleDoc` field is updated to the new doc URL without requiring a separate save action
