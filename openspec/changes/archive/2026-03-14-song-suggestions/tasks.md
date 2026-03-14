## 1. Dependencies & Configuration

- [x] 1.1 Install `@anthropic-ai/sdk` and add to `package.json`
- [x] 1.2 Add `ANTHROPIC_API_KEY` to `.env.example` with a comment describing its purpose
- [ ] 1.3 Add `ANTHROPIC_API_KEY` to Railway environment variables

## 2. Backend — Suggestions Endpoint

- [x] 2.1 Create `src/routes/suggestions.js` with `POST /api/playlists/:id/suggestions` route
- [x] 2.2 Return 503 if `ANTHROPIC_API_KEY` is not set
- [x] 2.3 Return 404 if playlist not found
- [x] 2.4 Return 400 if playlist has neither theme nor bibleLessons
- [x] 2.5 Build song context array: extract `songId`, `title`, `artist`, and first non-empty lyric line from each song
- [x] 2.6 Build Claude prompt with theme, Bible passages, service sections, and song context
- [x] 2.7 Call Claude API and parse the structured JSON response (`[{ songId, title, reason, section }]`)
- [x] 2.8 Return 502 with error message on Claude API failure
- [x] 2.9 Return 200 with suggestions array on success
- [x] 2.10 Mount suggestions router in `src/server.js`

## 3. Backend — Feature Flag Endpoint

- [x] 3.1 Add `GET /api/config/features` endpoint (or extend an existing config route) that returns `{ songSuggestions: true/false }` based on whether `ANTHROPIC_API_KEY` is set — lets the frontend know whether to show the suggestions step

## 4. Frontend — Post-Creation Choice Overlay

- [x] 4.1 After `createPlaylist()` succeeds and lectionary auto-lookup completes, check the feature flag endpoint
- [x] 4.2 If suggestions not available, skip overlay and open the editor directly (existing behavior)
- [x] 4.3 Build the "Get Song Suggestions / Pick Songs Myself" overlay HTML and CSS
- [x] 4.4 Wire "Pick Songs Myself" button to dismiss the overlay and enter the standard editor
- [x] 4.5 Wire "Get Song Suggestions" button to call the suggestions endpoint with a loading spinner

## 5. Frontend — Suggestion Results Panel

- [x] 5.1 Build suggestion panel HTML showing each suggestion's title, reason, and suggested section
- [x] 5.2 Add "Add to [section]" button per suggestion that calls `PUT /api/playlists/:id` to add the song
- [x] 5.3 Mark suggestion as added (disable button, visual indicator) after song is successfully added
- [x] 5.4 Add "Done" / close button that dismisses the panel and leaves the user in the full editor
- [x] 5.5 Handle error state if the suggestions API call fails (show message, offer "Pick Songs Myself" fallback)

## 6. Testing & Cleanup

- [ ] 6.1 Manually test full flow: create playlist → lectionary lookup → suggestions overlay → add songs → editor
- [ ] 6.2 Manually test fallback: no `ANTHROPIC_API_KEY` set → suggestion step skipped, editor opens normally
- [ ] 6.3 Manually test error path: Claude API unavailable → error message shown with fallback option
- [x] 6.4 Update README to document `ANTHROPIC_API_KEY` env var
