## Why

Worship leaders often want to hear a song before deciding to use it or to share a reference version with musicians preparing for a service. Today there's no link between a song in the library and any recording — planners have to search YouTube separately, breaking the planning flow.

## What Changes

- Songs gain a `YouTube:` metadata field in their `.txt` files (one or more comma-separated URLs)
- The song parser extracts YouTube URLs alongside existing metadata (title, artist, key, tempo, notes)
- The song detail view (both desktop panel and mobile modal) displays each YouTube link as a clickable thumbnail/link card
- The song detail view provides an inline edit control to add, change, or remove YouTube URLs — saving them back to the song's `.txt` file via a new API endpoint
- Song detail panel and API response include the `youtubeUrls` array field

## Capabilities

### New Capabilities
- `song-youtube-references`: Store, parse, display, and edit YouTube reference URLs per song

### Modified Capabilities
- `song-parser`: Add parsing of `YouTube:` header field (single or comma-separated URLs) into a `youtubeUrls` array
- `song-display`: Song detail view gains a YouTube references section with link cards and inline edit

## Impact

- `src/songParser.js` — parse `YouTube:` field into `youtubeUrls: string[]`
- `src/routes/songs.js` (or equivalent) — new `PATCH /api/songs/:id/youtube` endpoint to write updated YouTube URLs back to the song's `.txt` file
- `public/app.js` — render YouTube cards in detail view; inline add/edit/remove UI
- `public/style.css` — YouTube card styles
- No playlist or analytics data model changes
