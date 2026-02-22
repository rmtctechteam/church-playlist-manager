## 1. Parser

- [x] 1.1 Add `notes` to `METADATA_FIELDS` in `src/songParser.js`
- [x] 1.2 Add `notes: null` default to the metadata object in `parseSongContent`
- [x] 1.3 Add a test in `test/songParser.test.js` for parsing the `Notes:` field (present and absent)

## 2. Frontend — Music Section

- [x] 2.1 Add a `renderMusicSection(song)` helper in `public/app.js` that returns HTML for the Music section (key chip + notes block), or empty string if both are absent
- [x] 2.2 Call `renderMusicSection` inside the song detail render function, inserting the Music section between the metadata header and the lyrics
- [x] 2.3 Add `.song-music-section`, `.music-notes` CSS styles to `public/style.css` (section label, notes as `pre-wrap` text block)

## 3. Verification

- [x] 3.1 Run `npm test` — all existing tests pass, new parser test passes
- [x] 3.2 Add `Notes: Capo 2, play in G` to a song file, reload the app, and confirm the Music section appears in the detail panel
- [x] 3.3 Confirm songs without a Notes field show only the key chip (or no Music section if key is also absent)
