## 1. Swipe Picker Overlay — HTML Structure

- [x] 1.1 Add a "Swipe to Pick" button to each playlist section in `renderPlaylistEditor()` (per-section, opens picker with that section pre-selected) — do NOT remove or modify the existing song browser panel
- [x] 1.2 Write `openSwipePicker(playlistId, sectionName)` function that builds the full-screen overlay HTML: header (section name + close button), card stack container, Add/Skip action buttons, and progress counter
- [x] 1.3 Build `buildSwipeDeck(allSongs, playlist, activeSongs)` that returns a filtered array: exclude songs already in the playlist, apply active session filters

## 2. Song Card Rendering

- [x] 2.1 Write `renderSwipeCard(song, usageSummary)` that returns a card element with title, artist, key, first two lyrics lines, and last-used date (or "Never used" badge)
- [x] 2.2 Render the top 3 cards as a stacked layer in the card container (top card z-index highest, slight translate/rotate offset on cards 2 and 3)
- [x] 2.3 Fetch usage summary once when the picker opens and pass it to card rendering

## 3. Gesture and Drag Handling

- [x] 3.1 Attach `touchstart`/`touchmove`/`touchend` listeners to the top card for swipe detection (threshold: 80px)
- [x] 3.2 Attach `mousedown`/`mousemove`/`mouseup` listeners on the top card for mouse-drag support
- [x] 3.3 Show green "Add" overlay on card when drag crosses +80px threshold; show red "Skip" overlay when drag crosses -80px threshold
- [x] 3.4 On release below threshold, animate card back to center (snap-back)
- [x] 3.5 On release above threshold, trigger `handleSwipeAction(direction)` which animates card off-screen and advances to next card

## 4. Button and Keyboard Controls

- [x] 4.1 Wire ✓ Add button click to call `handleSwipeAction('right')`
- [x] 4.2 Wire ✗ Skip button click to call `handleSwipeAction('left')`
- [x] 4.3 Add `keydown` listener on the document while overlay is open: right arrow / L key → add, left arrow / J key → skip; remove listener on overlay close

## 5. Saving Added Songs

- [x] 5.1 In `handleSwipeAction('right')`, append the song id to the target section's song list in a local copy of the playlist and PUT to `/api/playlists/:id`
- [x] 5.2 On PUT failure, display an inline error message on the current card without closing the overlay
- [x] 5.3 Track added songs in a session array for the summary

## 6. Empty Deck and Session Summary

- [x] 6.1 When `handleSwipeAction` is called and no more cards remain, show empty-deck state ("No more songs to show")
- [x] 6.2 Write `showSwipeSummary(addedSongs, sectionName)` that replaces the card area with a summary: "Added N songs to [Section]" with a list of song titles and a Done button
- [x] 6.3 Done button: close the overlay, re-fetch the playlist via GET, and call `renderPlaylistEditor()` to refresh the editor with the newly added songs

## 7. CSS — Card Stack and Animations

- [x] 7.1 Add `.swipe-overlay` styles: full-screen fixed overlay, flex column, dark background
- [x] 7.2 Add `.swipe-card-stack` container and `.swipe-card` styles: white card, rounded corners, shadow, absolute positioning for stacking
- [x] 7.3 Add card 2 and card 3 offset styles (`.swipe-card:nth-child(2)`, `.swipe-card:nth-child(3)`) with subtle translate/rotate
- [x] 7.4 Add `.swipe-indicator-add` and `.swipe-indicator-skip` overlay styles (semi-transparent green/red with label)
- [x] 7.5 Add `.swipe-actions` button row styles and transition/animation for card fly-off (`.swipe-card.fly-right`, `.swipe-card.fly-left`)
