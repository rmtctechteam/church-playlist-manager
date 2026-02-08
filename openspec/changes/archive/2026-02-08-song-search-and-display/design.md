## Context

The application currently has no server or frontend — just raw `.txt` song files in `songs/`. This is the first feature being built, so there is no existing architecture to integrate with. The song file format uses a metadata header (Title, Artist, Key, Tempo) followed by labeled lyric sections (Verse, Chorus, Bridge, etc.).

## Goals / Non-Goals

**Goals:**
- Stand up the Node.js server and project structure
- Parse all song `.txt` files into structured in-memory data on startup
- Expose REST API endpoints for searching and retrieving songs
- Serve a frontend page for browsing, searching, and viewing song lyrics

**Non-Goals:**
- Song editing or creation through the UI (read-only for now)
- Database or persistent indexing (in-memory is sufficient for a small library)
- Authentication or user accounts
- Playlist management (separate future change)

## Decisions

### 1. Express for HTTP framework
**Choice:** Use Express.js for the API server.
**Rationale:** Lightweight, well-known, minimal boilerplate. The app needs simple REST routes and static file serving — Express handles both. Alternatives like Fastify or Koa add complexity without meaningful benefit at this scale.

### 2. In-memory song index loaded at startup
**Choice:** Read and parse all song files into memory when the server starts. No database.
**Rationale:** A church song library is small (typically tens to low hundreds of songs). Reading all files on startup keeps the architecture simple and search fast. A database would be over-engineering at this stage. If the library grows significantly, we can add file-watching or caching later.

### 3. Song parser as a standalone module
**Choice:** Implement song file parsing as a separate `src/songParser.js` module.
**Rationale:** Isolates the `.txt` format parsing logic so it can be tested independently and reused by future features (playlists, export). The parser returns a structured object with metadata fields and a lyrics array of `{ section, lines }` objects.

### 4. Simple search with string matching
**Choice:** Case-insensitive substring matching on title and artist fields.
**Rationale:** With a small library, full-text search engines (Elasticsearch, Lunr) are unnecessary. Simple `includes()` matching on lowercased strings is fast, easy to understand, and meets the requirements. Can be upgraded later if needed.

### 5. Project structure
**Choice:**
```
src/
  server.js        # Express app setup and startup
  songParser.js    # Song file parser module
  routes/
    songs.js       # Song API route handlers
public/
  index.html       # Main frontend page
  app.js           # Frontend JavaScript
  style.css        # Styles
```
**Rationale:** Keeps backend and frontend cleanly separated. The `src/` directory holds server code, `public/` holds static frontend assets served by Express.

### 6. API design
**Choice:**
- `GET /api/songs` — list all songs (returns array of metadata, no lyrics)
- `GET /api/songs?q=<query>` — search by title or artist
- `GET /api/songs/:id` — get full song details including lyrics

Song IDs are derived from filenames (e.g., `amazing-grace.txt` → ID `amazing-grace`).

**Rationale:** RESTful, predictable. Separating list (metadata only) from detail (full lyrics) keeps list responses lightweight. Using filename-derived IDs avoids needing a separate ID system.

## Risks / Trade-offs

- **Startup time with large libraries** → Acceptable for expected library size (<500 songs). If needed, add lazy loading later.
- **No file-watching for changes** → Songs added while server is running won't appear until restart. Acceptable for initial version; can add `fs.watch` later.
- **No pagination on song list** → Fine for small libraries. Add pagination if the list endpoint becomes slow.
