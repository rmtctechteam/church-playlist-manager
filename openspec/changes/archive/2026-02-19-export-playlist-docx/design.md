## Context

The app manages church service playlists with songs stored as `.txt` files. Users create playlists with sections (Opening, Communion, etc.) and assign songs. There is currently no way to generate a printable/shareable document from a playlist.

## Goals / Non-Goals

**Goals:**
- Generate a `.docx` file from any saved playlist
- Include all playlist metadata (name, date, theme, bible lessons) and full song lyrics
- Preserve lyric verse spacing from source files
- Trigger download via a single button click in the editor

**Non-Goals:**
- Google Docs API integration (users open the .docx in Drive manually)
- PDF generation
- Customizable document templates or formatting options

## Decisions

**1. Use `docx` npm package for document generation**
- Rationale: Pure JS, no native dependencies, generates valid OOXML `.docx` files
- Alternative considered: `officegen` — less maintained, fewer features
- Alternative considered: Google Docs API — requires OAuth credentials and service account setup

**2. Server-side generation via API endpoint**
- Rationale: Songs are resolved server-side; keeps document logic co-located with playlist resolution
- Alternative considered: Client-side generation — would require shipping song data to browser and adding a large client dependency

**3. Browser-native download via `window.location.href`**
- Rationale: Simplest approach; no fetch/blob handling needed. The browser handles the Content-Disposition attachment header natively.

**4. Visual separator between songs using styled text**
- Rationale: Empty paragraphs and CSS spacing properties are inconsistently rendered across Word and Google Docs. Light gray `___` text separators render reliably everywhere.

## Risks / Trade-offs

- [Large playlists with many songs may produce large documents] → Acceptable for church service sizes (typically 4-8 songs)
- [Document formatting may render slightly differently in Word vs Google Docs] → Using basic formatting (headings, italics, line breaks) for maximum compatibility
