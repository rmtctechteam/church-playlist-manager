## Context

The song filter `<select>` in `public/index.html` has four options keyed by day counts (`all`, `7`, `30`, `90`). The filter handler in `app.js` fetches `GET /api/songs/used?since=<date>` and stores the result in `filteredSongIds`. `applySortAndFilter` then restricts the rendered list to that set.

## Goals / Non-Goals

**Goals:**
- Rename the three existing "sung" filter labels for clarity
- Add a "not sung" filter that shows songs absent from the last-90-days usage set
- No backend changes required

**Non-Goals:**
- No new API endpoints
- No changes to other filter/sort logic

## Decisions

### "Not sung" filter value
Use `value="not-90"` for the new option. The handler checks for this value and inverts the logic: fetch the 90-day used set, then set `filteredSongIds` to all song IDs **not** in that set. This reuses the existing `/api/songs/used?since=` endpoint.

### Source of all song IDs for inversion
Use the already-loaded `allSongs` array (client-side) to build the complement set. No extra API call needed.
