## 1. Parser — add YouTube field

- [x] 1.1 In `src/songParser.js`, add `'youtube'` to `METADATA_FIELDS` and after the metadata loop, split the raw `youtube` value on `', '` to produce `youtubeUrls: string[]` (empty array if absent); include `youtubeUrls` in the returned song object

## 2. Backend — PATCH endpoint

- [x] 2.1 In `src/routes/songs.js`, add `PATCH /:id/youtube` route inside `createSongsRouter`: validate that each URL starts with `https://` and contains `youtube.com` or `youtu.be`; reject with 400 if invalid or more than 5 URLs
- [x] 2.2 In the same route handler, read the song's `.txt` file, replace the `YouTube:` line in the header if present (or insert it after the last metadata line if not), then write atomically (write to `<file>.tmp` then `fs.renameSync`)
- [x] 2.3 After writing, re-parse the updated file and mutate the in-memory `songs` array entry so subsequent GET requests reflect the change; return the updated song object with 200

## 3. Frontend — render YouTube references in song detail

- [x] 3.1 In `renderMusicSection` (or adjacent), write a `renderYoutubeSection(song)` helper that returns HTML for the YouTube References section: if `youtubeUrls` is empty show an "Add a YouTube reference" prompt area; if non-empty show a card for each URL plus an add-new input row
- [x] 3.2 Extract a YouTube video ID from a URL for display (handle both `youtube.com/watch?v=ID` and `youtu.be/ID` formats); show `YouTube · <ID>` as the card label
- [x] 3.3 Include `renderYoutubeSection(song)` in both the desktop `songDetailPanel` HTML and the mobile modal HTML inside `selectSong`

## 4. Frontend — add/remove YouTube URLs

- [x] 4.1 Wire the "Add" button in the YouTube section: on click, read the input value, validate it contains `youtube.com` or `youtu.be`, PATCH to `/api/songs/:id/youtube` with the new full `youtubeUrls` array (existing + new), then re-render the detail view
- [x] 4.2 Wire the ✕ button on each YouTube card: on click, PATCH with the filtered `youtubeUrls` array (without the removed URL), then re-render the detail view
- [x] 4.3 Show an inline error message (not an alert) if the URL is invalid or the PATCH fails; clear it on success

## 5. CSS — YouTube reference card styles

- [x] 5.1 Add `.youtube-section` heading styles and `.youtube-card` link card: white background, border, rounded, flex row with icon area and label; hover state
- [x] 5.2 Add `.youtube-add-row` styles: small input + Add button inline, matching the existing form input aesthetic
- [x] 5.3 Add `.youtube-remove-btn` styles: small ✕ button aligned to the right of each card
