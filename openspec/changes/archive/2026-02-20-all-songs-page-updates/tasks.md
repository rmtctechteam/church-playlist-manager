## 1. Backend: Usage query endpoints

- [x] 1.1 Add `getSongsUsedSince(dateStr)` method to `src/usageStore.js` that returns an array of unique song IDs with usage on or after the given date
- [x] 1.2 Add `getUsageSummary()` method to `src/usageStore.js` that returns `{ [songId]: { count, lastUsed } }` for all songs with usage records
- [x] 1.3 Add `GET /api/songs/used?since=YYYY-MM-DD` route in `src/routes/songs.js` that returns filtered song IDs (400 if missing `since`)
- [x] 1.4 Add `GET /api/songs/usage-summary` route in `src/routes/songs.js` that returns the bulk usage summary object
- [x] 1.5 Add tests for both new endpoints in `test/songsApi.test.js`

## 2. Frontend: HTML structure for split-panel layout

- [x] 2.1 Update `public/index.html` songs tab to use a two-panel container with left list panel and right detail panel
- [x] 2.2 Add filter dropdown (All, Last Week, Last Month, Last 3 Months) and sort dropdown (Title A-Z, Title Z-A, Last Used, Most Used) above the song list in the left panel
- [x] 2.3 Add placeholder content in the right detail panel ("Select a song to view details")

## 3. Frontend: CSS for split-panel and controls

- [x] 3.1 Add CSS Grid styles for the split-panel layout (left ~350px, right flex-1) with responsive stacking below 768px
- [x] 3.2 Style filter and sort dropdowns to match the Apple-inspired design (matching existing segmented/select styles)
- [x] 3.3 Add active/selected state style for song list items
- [x] 3.4 Style the detail panel (song title, key, last-used info, lyrics display)

## 4. Frontend: Song list rendering updates

- [x] 4.1 Update `renderSongList()` to display only song title (remove artist)
- [x] 4.2 Add active class toggling when a song is clicked in the list
- [x] 4.3 Replace full-page `showSongDetail()` navigation with inline detail panel population
- [x] 4.4 Implement detail panel rendering: song title, key, last-used date (or "Never used"), and full lyrics

## 5. Frontend: Filter and sort logic

- [x] 5.1 Fetch and cache usage summary from `/api/songs/usage-summary` when a usage-based sort or filter is selected
- [x] 5.2 Implement date-range filter: call `/api/songs/used?since=` and intersect with song list
- [x] 5.3 Implement sort options: title A-Z (default), title Z-A, last used, most used
- [x] 5.4 Wire up filter and sort change handlers to re-render the song list with combined search + filter + sort

## 6. Verification

- [x] 6.1 Run all tests and verify they pass (54/54 pass)
- [x] 6.2 Manual verification: split-panel layout, filter/sort controls, detail panel population, responsive stacking
