## Why

Worship leaders currently add songs to playlists by searching a list, reading through results, and manually clicking to add — a process that requires deliberate navigation. A swipe-style card interface lets users move through the song library quickly, flicking left to skip and right to add, reducing the friction of playlist building especially on mobile and touch devices.

## What Changes

- New "Swipe to Pick Songs" mode accessible from the playlist editor — additive, not a replacement
- The existing song browser (search + list panel) remains fully intact as the primary/fallback experience
- Song cards displayed one at a time with left/right swipe (and keyboard/button fallback) to skip or add
- Filtered card deck based on active song filters (e.g., not used recently, key, search)
- Added songs immediately appear in the target section of the playlist
- Session summary shown when the deck runs out or user exits

## Capabilities

### New Capabilities
- `swipe-song-picker`: Card-deck UI for swiping through songs to add to a playlist section — supports touch swipe, mouse drag, and keyboard/button controls; respects existing song filters; adds chosen songs to the selected playlist section

### Modified Capabilities
- `playlist-crud`: Playlist editor gains an entry point to open the swipe picker for a given section

## Impact

- `public/app.js` — new swipe picker modal/overlay, gesture handling, section targeting
- `public/style.css` — card stack UI, swipe animation, drag feedback
- No backend changes required (uses existing songs and playlist APIs)
