## 1. Service Type Definitions

- [x] 1.1 Create `src/serviceTypes.js` with hardcoded service type definitions (holy-communion, acts, praise-and-worship) each with id, name, and sections array

## 2. Storage Layer

- [x] 2.1 Create `src/playlistStore.js` with functions to load, save, and query playlists from `data/playlists.json` (atomic writes via temp file + rename, auto-create on first write)
- [x] 2.2 Create `src/usageStore.js` with functions to load, save, and query usage records from `data/usage.json` (atomic writes, auto-create on first write)
- [x] 2.3 Add usage sync logic: when a playlist with a date is created/updated/deleted, recalculate its usage records from all songs across all sections

## 3. Playlist API Routes

- [x] 3.1 Create `src/routes/playlists.js` with GET `/api/service-types` — return all preset service types with their section templates
- [x] 3.2 Add POST `/api/playlists` — validate name and type required, initialize sections from service type template (or from request body for custom type), generate UUID, set timestamps, persist, return 201
- [x] 3.3 Add GET `/api/playlists` — return all playlists sorted by date desc (dateless last), support `?upcoming=true` filter (date ascending, today or future only)
- [x] 3.4 Add GET `/api/playlists/:id` — return playlist with each section's songIds resolved to full song objects (or `{ id, notFound: true }`), return 404 if not found
- [x] 3.5 Add PUT `/api/playlists/:id` — merge updates into existing playlist, update `updatedAt`, trigger usage sync, return 404 if not found
- [x] 3.6 Add DELETE `/api/playlists/:id` — remove playlist and its usage records, return 204, return 404 if not found

## 4. Song Usage API

- [x] 4.1 Add GET `/api/songs/:id/usage` to `src/routes/songs.js` — return `{ songId, count, lastUsed, history }` from usage store

## 5. Server Wiring

- [x] 5.1 Register playlist routes and add JSON body parsing middleware in `src/server.js`

## 6. Frontend — Navigation

- [x] 6.1 Add tab bar ("Songs" / "Playlists") to `index.html` header and implement tab switching in `app.js`
- [x] 6.2 Add playlist view containers to `index.html` (playlist list, playlist editor, playlist display)
- [x] 6.3 Style the tab bar and new views in `style.css`

## 7. Frontend — Playlist List & Editor

- [x] 7.1 Implement playlist list view: fetch and render playlists sorted by date, upcoming vs past visual distinction, "New Playlist" button, "Display" action per playlist
- [x] 7.2 Implement playlist creation: service type selector (Holy Communion, ACTS, Praise and Worship, Custom), name and date fields; initialize sections from selected type
- [x] 7.3 Implement playlist editor view: section-based layout showing each section heading with its songs; song search/add per section; song reorder (up/down) and remove within sections; name, date, and notes editing; save and delete with confirmation dialog

## 8. Frontend — Playlist Display

- [x] 8.1 Implement display view: render playlist name, service type label, date, notes, and songs grouped by section with titles and keys
- [x] 8.2 Add "Show Lyrics" toggle that expands/collapses full lyrics for each song in the display view
- [x] 8.3 Handle missing songs in display view with "not found" indicator
- [x] 8.4 Add `@media print` styles to hide navigation, buttons, and non-essential UI when printing

## 9. Frontend — Song Usage Display

- [x] 9.1 Fetch and display song usage info (count and last used date) on the song detail view

## 10. Testing

- [x] 10.1 Write tests for service types definitions
- [x] 10.2 Write tests for playlist store (CRUD operations, atomic writes, empty file handling)
- [x] 10.3 Write tests for usage store (sync on create/update/delete across sections, query by song)
- [x] 10.4 Write tests for playlist API routes (all endpoints, validation, type initialization, 404s, upcoming filter)
- [x] 10.5 Write tests for song usage API endpoint
