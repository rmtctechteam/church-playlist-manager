## Why

When creating a playlist, users must manually look up the theme and bible lessons for a given service date from the Mar Thoma Church lectionary website (https://marthoma.in/lectionary/). This is tedious and error-prone. Automating the lookup based on the playlist's service date saves time and ensures accuracy.

## What Changes

- Add a server-side API endpoint that scrapes the lectionary website for a given date, extracting the theme (English only, stripping Malayalam) and 4 bible lessons (from the Lessons, Epistle, and Gospel rows — excluding Evening Readings)
- Add a "Lookup" button next to the Theme and Bible Lessons fields in the playlist editor that calls the API using the playlist's service date and populates both fields automatically

## Capabilities

### New Capabilities
- `lectionary-lookup`: Server-side scraping of the Mar Thoma lectionary website to extract theme and bible lessons by date, exposed via API endpoint and triggered from the playlist editor UI

### Modified Capabilities
<!-- No existing spec requirements are changing -->

## Impact

- New dependency: HTML parsing library (e.g., `cheerio`) for scraping the lectionary page
- New API endpoint: `GET /api/lectionary?date=YYYY-MM-DD`
- Modified files: `src/routes/playlists.js` (or new route file), `public/app.js` (lookup button and handler)
