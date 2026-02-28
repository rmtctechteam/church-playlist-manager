## 1. Install Dependency

- [x] 1.1 Run `npm install multer` and verify it appears in `package.json` dependencies

## 2. Backend — Upload Endpoint

- [x] 2.1 In `src/routes/songs.js`, require `multer` and configure it with `memoryStorage()`
- [x] 2.2 Add `POST /upload` route using `multer.array('songs')` to accept multiple files
- [x] 2.3 In the route handler, validate that at least one file was provided; return 400 if none
- [x] 2.4 For each uploaded file, call the existing `parseSong` function on the file buffer content; on parse failure return an error result for that file
- [x] 2.5 Check if a file with the same filename already exists in `SONGS_DIR`; return 409 result for duplicates
- [x] 2.6 Write valid parsed files to disk at `SONGS_DIR/<filename>`
- [x] 2.7 Push each successfully saved song object into the in-memory `songs` array so it is immediately available
- [x] 2.8 Return a JSON array of per-file results (`{ filename, success, song?, error? }`) with HTTP 200

## 3. Frontend — Upload Button

- [x] 3.1 In `public/index.html`, add a hidden `<input type="file" id="song-upload-input" accept=".txt" multiple>` to the songs tab
- [x] 3.2 In `public/index.html`, add an "Upload Song" button in the `.songs-controls` area that triggers the file input
- [x] 3.3 In `public/app.js`, wire the upload button click to trigger `song-upload-input.click()`
- [x] 3.4 In `public/app.js`, add a `change` listener on `song-upload-input` that POSTs the selected files to `POST /api/songs/upload` as `multipart/form-data`
- [x] 3.5 On successful response, re-fetch `/api/songs`, update `allSongs`, and re-render the song list
- [x] 3.6 Display a brief success/failure message (e.g., alert or inline notice) showing which files were saved and which failed

## 4. Styling

- [x] 4.1 In `public/style.css`, style the Upload Song button to match the existing controls area (consistent with filter/sort controls)
