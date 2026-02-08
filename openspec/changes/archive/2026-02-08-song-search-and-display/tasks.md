## 1. Project Setup

- [x] 1.1 Initialize Node.js project with `package.json` and install Express
- [x] 1.2 Create project directory structure (`src/`, `src/routes/`, `public/`)

## 2. Song Parser

- [x] 2.1 Implement `src/songParser.js` — parse a single song `.txt` file into a structured object (id, title, artist, key, tempo, lyrics array)
- [x] 2.2 Implement `loadAllSongs()` function — read all `.txt` files from `songs/` directory and return parsed song array
- [x] 2.3 Add tests for song parser (well-formed file, missing metadata, multiple sections, non-txt files ignored)

## 3. Song Search API

- [x] 3.1 Implement `src/routes/songs.js` — `GET /api/songs` returns all songs (metadata only, no lyrics)
- [x] 3.2 Add query parameter `q` support — case-insensitive filtering by title, artist, or lyrics with ranked results
- [x] 3.3 Implement `GET /api/songs/:id` — return full song details with lyrics, 404 for missing songs

## 4. Server Setup

- [x] 4.1 Implement `src/server.js` — Express app that loads songs on startup, mounts API routes, serves `public/` as static files

## 5. Frontend

- [x] 5.1 Create `public/index.html` with search input and song list/detail layout
- [x] 5.2 Implement `public/app.js` — fetch and display song list, wire up search input to filter via API
- [x] 5.3 Implement song detail view — click a song to display full metadata and lyrics, with back navigation
- [x] 5.4 Add `public/style.css` with basic styling for the song list and detail views
