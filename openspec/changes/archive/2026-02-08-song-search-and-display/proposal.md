## Why

The application has no way to access the song library programmatically. Song files exist as raw `.txt` files in the `songs/` directory but there is no backend to parse, index, or search them. Without this, no other feature (playlists, usage tracking, export) can function. This is the foundational capability the entire app depends on.

## What Changes

- Add a song file parser that reads `.txt` files from `songs/` and extracts metadata (title, artist, key, tempo) and structured lyrics sections
- Add a REST API endpoint to list and search songs by title or artist (case-insensitive)
- Add a REST API endpoint to retrieve full song details including lyrics
- Add a frontend page to browse, search, and view songs

## Capabilities

### New Capabilities
- `song-parser`: Parsing of song `.txt` files into structured data — metadata extraction (title, artist, key, tempo) and lyrics section parsing
- `song-search-api`: REST API for listing all songs and filtering by title or artist with case-insensitive matching
- `song-display`: Frontend UI for browsing the song library, searching, and viewing full song details with lyrics

### Modified Capabilities
<!-- None — this is the first feature being built -->

## Impact

- **New files:** Node.js server entry point, song parser module, API route handlers, frontend HTML/JS
- **Dependencies:** Node.js built-in `fs` and `path` modules for file reading; an HTTP framework (e.g., Express) for the API
- **Data:** Reads from `songs/` directory at runtime — no writes, no migrations
- **No breaking changes** — greenfield implementation on an empty codebase
