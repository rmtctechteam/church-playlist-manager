## Context

The All Songs page currently renders a flat alphabetical list (title + artist) with a full-page detail view on click. Usage data is tracked per song in `data/usage.json` with records containing `{ songId, playlistId, date }`. The `usageStore` module already supports querying usage for a single song. The frontend is vanilla JS with no framework — all rendering is string-template based in `public/app.js`.

## Goals / Non-Goals

**Goals:**
- Enable filtering the song list by usage recency (last week, month, 3 months)
- Provide sort options beyond default alphabetical (reverse alpha, last used, usage count)
- Simplify song list rows to title-only
- Replace full-page detail navigation with a split-panel master-detail layout
- Keep the existing search functionality working within the new layout

**Non-Goals:**
- Pagination or virtual scrolling (493 songs renders fine as-is)
- Editing song data from the songs page
- Changing the song file format or storage
- Mobile-specific responsive breakpoints (the split panel will stack on small screens)

## Decisions

### 1. Server-side usage filtering via new endpoint
**Decision**: Add `GET /api/songs/used?since=YYYY-MM-DD` that returns song IDs used on or after the given date. The frontend calculates the date threshold (today minus 7/30/90 days) and passes it as a query parameter.

**Rationale**: The usage data lives server-side in `data/usage.json`. Filtering on the server avoids sending all usage records to the client. Returning just song IDs keeps the response small; the client intersects them with the already-loaded song list.

**Alternative considered**: Sending all usage data to the client and filtering in JS — rejected because usage data grows with every playlist and would be wasteful to transfer.

### 2. Client-side sorting
**Decision**: Sorting is done entirely in the client after the song list is fetched. The API continues to return songs in default order; the client applies the selected sort locally.

**Rationale**: All sort criteria (title, last used, usage count) can be derived client-side. Usage summary data per song is fetched once when a usage-based sort or filter is selected. This avoids adding sort parameters to the API.

### 3. Usage summary bulk endpoint
**Decision**: Add `GET /api/songs/usage-summary` that returns `{ [songId]: { count, lastUsed } }` for all songs that have usage records. Called once when the user selects a usage-based sort or filter, then cached in memory for the session.

**Rationale**: Fetching individual `/api/songs/:id/usage` for 493 songs would be too many requests. A single bulk endpoint is efficient and the response is small (just counts and dates).

### 4. Split-panel layout with CSS Grid
**Decision**: Use a two-column CSS Grid layout — left panel (song list, ~350px) and right panel (detail, flex 1). On screens below 768px, stack vertically with detail below list.

**Rationale**: CSS Grid is already used for the bento layout. Two fixed columns with a scrollable list panel provides a familiar master-detail UX. The right panel shows a placeholder message until a song is selected.

### 5. Detail panel shows lyrics and last-used date only
**Decision**: The right detail panel shows the song title, key, lyrics, and the last date the song was added to a playlist. Artist, tempo, and full usage history are omitted from the detail panel.

**Rationale**: The user specifically requested lyrics and last playlist usage date. Keeping it minimal matches the simplified list design.

## Risks / Trade-offs

- **Usage summary freshness**: The bulk usage summary is fetched once and cached in the client. If a user adds a song to a playlist in another tab, the cached data becomes stale. → Acceptable for this use case; refresh on tab switch or page reload.
- **No usage data for unplayed songs**: Songs never added to a dated playlist won't appear when filtering by usage. → The "All" filter (default) still shows every song, so no songs are hidden by default.
- **Split panel on small screens**: Stacking vertically means the detail panel pushes below the fold. → Acceptable; the list remains usable and the user scrolls to see detail.
