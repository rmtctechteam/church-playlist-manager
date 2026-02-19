## Context

The playlist editor has Theme and Bible Lessons text fields that users currently fill in manually by visiting https://marthoma.in/lectionary/ and finding the entry for their service date. The lectionary page uses an accordion-style layout with entries by date (format "DD Mon"), each containing a bilingual theme (Malayalam; English) and reading categories: Lessons, Epistle, Gospel, and Evening Reading.

## Goals / Non-Goals

**Goals:**
- Auto-populate Theme and Bible Lessons fields from the lectionary website based on the playlist's service date
- Extract only the English portion of the theme (strip Malayalam text)
- Extract readings from Lessons, Epistle, and Gospel rows only (4 references total), excluding Evening Readings
- Provide a "Lookup" button in the playlist editor to trigger the fetch

**Non-Goals:**
- Caching lectionary data locally
- Supporting date ranges or bulk lookups
- Displaying the full lectionary table in the app
- Handling dates not found on the lectionary page (just return an appropriate error)

## Decisions

**1. Use `cheerio` for HTML parsing**
- Rationale: Lightweight, jQuery-style HTML parser for Node.js, no browser dependency. Well-maintained and widely used for scraping.
- Alternative considered: `jsdom` — heavier, full DOM implementation, unnecessary for simple HTML extraction
- Alternative considered: Regex parsing — fragile and hard to maintain

**2. New route file `src/routes/lectionary.js`**
- Rationale: Keeps lectionary scraping logic separate from playlist CRUD. The endpoint is `GET /api/lectionary?date=YYYY-MM-DD` and is independent of playlists.
- Alternative considered: Adding to `playlists.js` — would bloat an already full file with unrelated scraping logic

**3. Server-side fetch (not client-side)**
- Rationale: Avoids CORS issues (the lectionary site likely doesn't set CORS headers). Server acts as a proxy, fetching and parsing the HTML.

**4. Parse the bilingual theme by splitting on semicolon**
- Rationale: The lectionary format is consistently `Malayalam text; English text`. Split on `;` and take the last part, trimmed.

**5. Lookup button in the editor sidebar, next to Theme/Bible Lessons fields**
- Rationale: The button should be contextually close to the fields it populates. It uses the date already entered in the editor form. The button calls the API and fills both fields in one action.

## Risks / Trade-offs

- [Lectionary website structure may change] → Parsing logic is isolated in one module, easy to update. If the site is down or returns unexpected HTML, the API returns a clear error.
- [Date may not exist on the lectionary page] → Return 404 with a message like "No lectionary entry found for this date"
- [Network latency for scraping] → Acceptable for a user-triggered action (not automatic). Show loading state on the button.
