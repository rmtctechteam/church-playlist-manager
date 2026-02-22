## 1. API

- [x] 1.1 Update `toSummary` in `src/routes/songs.js` to extract `lyricsPreview` (first 2 non-empty lines of lyrics joined by " / ", or `null`) and include it in the returned object

## 2. Frontend

- [x] 2.1 Update `renderSongList` in `public/app.js` to render a `<span class="song-preview">` beneath the title when `lyricsPreview` is non-null
- [x] 2.2 Add `.song-preview` CSS styles to `public/style.css` (small, muted, single-line, ellipsis overflow)

## 3. Verification

- [x] 3.1 Run `npm test` — all existing tests pass
- [x] 3.2 Load the All Songs view in the browser and confirm lyrics previews appear beneath song titles
- [x] 3.3 Confirm preview is truncated with ellipsis when too long, and absent for songs with no lyrics
