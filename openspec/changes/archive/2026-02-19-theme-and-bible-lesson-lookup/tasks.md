## 1. Setup

- [x] 1.1 Install `cheerio` npm package
- [x] 1.2 Create `src/routes/lectionary.js` route file
- [x] 1.3 Register the lectionary router in `src/server.js`

## 2. Lectionary Parsing

- [x] 2.1 Implement function to fetch HTML from https://marthoma.in/lectionary/
- [x] 2.2 Implement function to parse the HTML and find the entry matching a given date (convert YYYY-MM-DD to "DD Mon" format for matching)
- [x] 2.3 Extract the theme, splitting on semicolon to return only the English portion
- [x] 2.4 Extract bible lessons from Lessons, Epistle, and Gospel rows only (exclude Evening Reading), returning 4 comma-separated references

## 3. API Endpoint

- [x] 3.1 Add `GET /api/lectionary?date=YYYY-MM-DD` route that validates the date parameter, calls the parser, and returns `{ theme, bibleLessons }`
- [x] 3.2 Return 400 for missing date parameter
- [x] 3.3 Return 404 when no lectionary entry found for the given date
- [x] 3.4 Return 502 when the lectionary website is unreachable

## 4. Frontend

- [x] 4.1 Add "Lookup" button next to the Theme and Bible Lessons fields in the playlist editor
- [x] 4.2 Implement click handler that reads the service date, calls the API, and populates Theme and Bible Lessons fields
- [x] 4.3 Show alert if no date is set when Lookup is clicked
- [x] 4.4 Show alert with error message on API failure

## 5. Testing

- [x] 5.1 Add tests for the lectionary API endpoint (successful lookup, missing date, date not found)
- [x] 5.2 Verify all existing tests still pass
