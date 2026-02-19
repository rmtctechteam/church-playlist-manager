## 1. Setup

- [x] 1.1 Install `docx` npm package
- [x] 1.2 Add `docx` imports to `src/routes/playlists.js`

## 2. Server-side Document Generation

- [x] 2.1 Implement `buildDocContent(playlist)` helper that generates document structure with headings, metadata, sections, songs, and lyrics
- [x] 2.2 Preserve lyric verse spacing with blank paragraphs between lyric sections
- [x] 2.3 Add visual separator (gray `___` text) between songs
- [x] 2.4 Add spacing after metadata before first section

## 3. API Endpoint

- [x] 3.1 Add `GET /api/playlists/:id/export` route that resolves playlist, builds doc, and returns `.docx` with correct Content-Type and Content-Disposition headers
- [x] 3.2 Return 404 for non-existent playlist IDs

## 4. Frontend

- [x] 4.1 Add "Export Doc" button in `editor-bottom-actions-right` div in playlist editor
- [x] 4.2 Add click handler using `window.location.href` to trigger native browser download

## 5. Testing

- [x] 5.1 Add test for export returning 200 with correct headers and valid .docx (ZIP magic bytes)
- [x] 5.2 Add test for export returning 404 for missing playlist
- [x] 5.3 Verify all 46 tests pass
