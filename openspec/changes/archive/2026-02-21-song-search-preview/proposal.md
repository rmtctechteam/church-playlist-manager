## Why

Song list items currently show only the title, making it hard to distinguish songs with similar names or remember a song's content. Showing the first two lines of lyrics under each title gives worship leaders enough context to identify songs at a glance without having to click through to the detail panel.

## What Changes

- **NEW**: Song list items in the All Songs view display the first two lines of lyrics as a preview below the title
- **MODIFIED**: `GET /api/songs` and `GET /api/songs?q=` responses include a `lyricsPreview` field (first two non-empty lines of the song's first lyric section, joined by " / ")
- **MODIFIED**: Song list item rendering in `app.js` includes the preview text beneath the title
- **NEW**: CSS styling for the preview text (smaller, muted, truncated with ellipsis)

## Capabilities

### New Capabilities
- `song-list-preview`: Each song list item shows a brief lyrics preview to help worship leaders identify songs quickly

### Modified Capabilities
- `song-search-api`: `GET /api/songs` list response gains a new optional `lyricsPreview` field

## Impact

- **Files modified**: `src/routes/songs.js` (add lyricsPreview to toSummary), `public/app.js` (render preview in list item), `public/style.css` (preview text styles)
- No database changes, no new dependencies
- Existing tests that check song list response shape may need updating if they assert exact fields
