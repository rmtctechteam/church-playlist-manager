## ADDED Requirements

### Requirement: Swipe card UI for Song Suggestions
The Song Suggestions feature SHALL present AI-suggested songs as a full-screen swipe card deck instead of a static list. Each card SHALL display the song title, the AI explanation for why the song fits the service, the last-performed date (or "Never performed" badge), and a section dropdown to target where the song should be added.

#### Scenario: Suggestions presented as swipe cards
- **WHEN** the user requests AI song suggestions and suggestions are returned
- **THEN** a full-screen swipe overlay opens showing the suggestions as swipeable cards, one at a time, with a progress counter

#### Scenario: Card displays suggestion details
- **WHEN** a suggestion card is displayed
- **THEN** it SHALL show the song title, the AI reason/explanation, the last-performed date (or "Never performed" badge), and a section dropdown

#### Scenario: Section dropdown on card
- **WHEN** a suggestion card is displayed
- **THEN** the card SHALL include a dropdown pre-selected to the AI-recommended section, allowing the user to change it before adding

### Requirement: Swipe gesture interaction
The system SHALL support left and right swipe gestures on the suggestion card to skip or add the current song.

#### Scenario: Swipe right adds song
- **WHEN** the user drags the top card more than 80px to the right and releases
- **THEN** the song is added to the section selected in the card's dropdown, saved immediately via PUT, and the next card is shown

#### Scenario: Swipe left skips song
- **WHEN** the user drags the top card more than 80px to the left and releases
- **THEN** the song is skipped and the next card is shown

#### Scenario: Drag below threshold snaps back
- **WHEN** the user drags the top card less than 80px in either direction and releases
- **THEN** the card returns to its original position with a snap-back animation

#### Scenario: Visual feedback during drag
- **WHEN** the user drags past the 80px threshold to the right
- **THEN** the card shows a green "Add ✓" indicator overlay

#### Scenario: Visual feedback for skip during drag
- **WHEN** the user drags past the 80px threshold to the left
- **THEN** the card shows a red "✗ Skip" indicator overlay

### Requirement: Button and keyboard controls for suggestion cards
The system SHALL provide non-gesture controls for adding and skipping suggestion cards.

#### Scenario: Add button
- **WHEN** the user clicks the ✓ Add button
- **THEN** the current suggestion is added to the selected section, equivalent to swiping right

#### Scenario: Skip button
- **WHEN** the user clicks the ✗ Skip button
- **THEN** the current suggestion is skipped, equivalent to swiping left

#### Scenario: Keyboard right arrow or "L" key adds song
- **WHEN** the swipe overlay is open and the user presses the right arrow key or the "L" key
- **THEN** the current suggestion is added

#### Scenario: Keyboard left arrow or "J" key skips song
- **WHEN** the swipe overlay is open and the user presses the left arrow key or the "J" key
- **THEN** the current suggestion is skipped

### Requirement: Persist added suggestions to playlist
Each song added via swipe SHALL be immediately saved to the playlist.

#### Scenario: Song saved on swipe right
- **WHEN** the user swipes right or clicks Add on a suggestion card
- **THEN** the song is appended to the target section and a PUT request is sent to `/api/playlists/:id`

#### Scenario: Failed save is surfaced
- **WHEN** the PUT request fails
- **THEN** the system SHALL display an inline error message on the card without closing the overlay

### Requirement: Session summary for suggestion swipe
When the suggestion deck is exhausted or the user taps Done, a summary SHALL be shown.

#### Scenario: Summary after reviewing all suggestions
- **WHEN** the user has swiped through all suggestion cards or clicks Done
- **THEN** the overlay shows how many songs were added and to which sections

#### Scenario: Return to editor with updates
- **WHEN** the user dismisses the overlay
- **THEN** the playlist editor SHALL re-render to reflect all added songs
