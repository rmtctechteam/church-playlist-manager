## Why

The All Songs page currently shows a flat alphabetical list with title and artist, and clicking a song navigates to a separate full-page detail view. Users need better tools to find songs — filtering by recent usage (last week, month, 3 months) and alternate sort options — and a faster way to preview song details without losing their place in the list.

## What Changes

- **Add date-range filter**: Filter the song list by usage recency — songs played in the last week, last month, or last 3 months. Requires a new API endpoint that returns song IDs used within a date range.
- **Add sort options**: Allow sorting the list by title (A-Z, Z-A), by last used date, or by usage count, in addition to the default alphabetical sort.
- **Simplify list rows**: Remove the artist subtitle from song list items — display only the song title.
- **Split-panel layout**: Replace the current list → detail page navigation with a side-by-side layout: song list on the left panel, and a detail panel on the right that shows the selected song's lyrics and last playlist usage date. Clicking a song populates the right panel without leaving the list.

## Capabilities

### New Capabilities
- `song-list-filtering`: Date-range filtering of songs by playlist usage (last week, last month, last 3 months) with a new API endpoint to support it
- `song-list-layout`: Split-panel master-detail layout for the songs page with left list panel and right detail panel

### Modified Capabilities
- `song-display`: Remove artist from list rows, add sort options (title A-Z/Z-A, last used, usage count), show lyrics and last-used date in the detail panel
- `song-search-api`: New endpoint to return songs filtered by usage date range

## Impact

- **Frontend**: `public/app.js` — rewrite songs tab rendering (list, detail, layout), add filter/sort controls and handlers. `public/index.html` — update songs tab HTML structure for split-panel. `public/style.css` — new styles for split-panel layout, filter/sort controls, active list item state.
- **Backend**: `src/routes/songs.js` — new endpoint for usage-filtered song lists. `src/usageStore.js` — new query method to get songs used within a date range.
- **Tests**: New tests for the usage-filter API endpoint.
