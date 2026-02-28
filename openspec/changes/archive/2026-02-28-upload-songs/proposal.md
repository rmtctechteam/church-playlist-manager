## Why

Adding songs to the library currently requires direct file system access — someone must manually place a `.txt` file in the `songs/` directory on the server. A browser-based upload button on the All Songs page lets any team member add new songs without needing server access.

## What Changes

- **All Songs page** — add an "Upload Song" button near the search/filter controls
- **Upload flow** — clicking the button opens a file picker accepting `.txt` files with multi-select enabled; after selection all files are uploaded and songs immediately appear in the list
- **Backend** — new `POST /api/songs/upload` endpoint that accepts a `.txt` file, validates it, saves it to the `songs/` directory, and returns the parsed song

## Capabilities

### New Capabilities
- `song-upload`: Browser-based `.txt` file upload on the All Songs page; supports selecting multiple files at once; each file is validated and saved server-side, and all uploaded songs auto-appear in the list without a page reload

### Modified Capabilities
- `song-list-layout`: All Songs page gains an Upload Song button alongside existing controls

## Impact

- `public/index.html` — upload button markup on the All Songs page
- `public/app.js` — file picker trigger, fetch to upload endpoint, refresh song list on success
- `src/server.js` (or a new route file) — `POST /api/songs/upload` endpoint using multipart form data; saves file to `songs/` directory
- No schema changes; no new dependencies (Node.js `fs` and built-in `http` are sufficient; consider `multer` if multipart parsing is needed)
