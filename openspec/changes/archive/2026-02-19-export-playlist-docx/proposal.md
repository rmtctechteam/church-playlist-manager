## Why

Users need a way to generate a printable document containing service details and song lyrics when a playlist is complete. Rather than integrating with Google Docs API (which requires credentials), generating a `.docx` file lets users download it and open directly in Google Drive, which auto-converts to a Google Doc.

## What Changes

- Add `docx` npm dependency for server-side Word document generation
- Add `GET /api/playlists/:id/export` endpoint that builds and returns a `.docx` file
- Add "Export Doc" button in the playlist editor UI that triggers a browser file download
- Document includes: playlist name, date, theme, bible lessons, section headings, song titles with key/tempo, and full lyrics with preserved verse spacing

## Capabilities

### New Capabilities
- `playlist-export`: Server-side generation and download of playlist content as a .docx Word document

### Modified Capabilities
<!-- No existing spec requirements are changing -->

## Impact

- New dependency: `docx` npm package
- New API endpoint: `GET /api/playlists/:id/export`
- Modified files: `src/routes/playlists.js`, `public/app.js`, `test/playlists.test.js`
