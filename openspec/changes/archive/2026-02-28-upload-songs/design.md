## Context

Songs are currently loaded from `.txt` files in the `songs/` directory at server startup into an in-memory array (`songs[]`). Adding a song requires placing a file on the server manually. The frontend All Songs page has search, filter, sort controls, and a split-panel layout but no upload mechanism.

The upload feature spans both frontend (file picker, fetch call, list refresh) and backend (multipart endpoint, file validation, in-memory array update).

## Goals / Non-Goals

**Goals:**
- Add an "Upload Song" button to the All Songs page controls area
- Accept one or more `.txt` files via a browser file picker
- Validate and save each file to the `songs/` directory
- Add newly uploaded songs to the in-memory array so they appear immediately without server restart
- Refresh the song list in the UI after a successful upload

**Non-Goals:**
- No support for non-`.txt` formats
- No drag-and-drop zone (button only)
- No preview/confirmation step before saving
- No duplicate detection beyond filename collision handling

## Decisions

### Multipart parsing: use `multer`
Express does not parse `multipart/form-data` natively. Options:
- **`multer`** — the standard Express middleware for file uploads; simple API, well-maintained, supports `array()` for multi-file
- `busboy` — lower-level, more boilerplate
- Manual `Buffer` parsing — fragile and unnecessary

**Decision**: Add `multer` as a dependency. Use `multer.memoryStorage()` so files land in memory first for validation before being written to disk.

### Validation before write
Parse each uploaded file with the existing `parseSong` function before saving. If parsing fails, return a 400 error for that file and skip saving. This prevents corrupt or wrong-format files from polluting the `songs/` directory.

### In-memory array update
The songs array is passed by reference into the router (`createSongsRouter(songs)`). After saving a valid file, push the parsed song object into that same array so subsequent GET `/api/songs` calls include it immediately — no server restart required.

### Filename collision handling
If a file with the same name already exists in `songs/`, return a 409 Conflict for that file. Do not overwrite.

### Multi-file upload
The endpoint accepts `multipart/form-data` with field name `songs` (multiple files). The frontend file input uses the `multiple` attribute. All valid files are saved; per-file results are returned in the response so the frontend can show partial success if some files fail.

### Frontend refresh
After a successful upload response, re-fetch `/api/songs` and re-render the song list. No page reload needed.

## Risks / Trade-offs

- [In-memory mutation] Pushing to the songs array means the new song is only available until server restart (consistent with current behavior — no persistence layer beyond the file system). → Mitigation: writing to disk is the persistence; the in-memory array is just a cache.
- [No deduplication] Two files with different names but identical content will both be saved. → Acceptable for now; out of scope.
- [New dependency] `multer` adds a dependency. → Low risk; it's the ecosystem standard and has no sub-dependencies.
