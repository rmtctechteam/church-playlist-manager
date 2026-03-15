## Context

Songs are stored as `.txt` files with a `Field: Value` metadata header. The parser (`src/songParser.js`) already handles `title`, `artist`, `key`, `tempo`, and `notes`. There is no existing write-back path for song files — the API is currently read-only for songs. This change adds one narrow write endpoint scoped to YouTube URL management.

## Goals / Non-Goals

**Goals:**
- Parse `YouTube:` header field into a `youtubeUrls` array on every song
- Display YouTube references as tappable link cards in the song detail view
- Allow adding/editing/removing YouTube URLs inline from the song detail view, persisted back to the `.txt` file
- Support comma-separated URLs on a single `YouTube:` line (e.g. `YouTube: url1, url2`)

**Non-Goals:**
- Embedding an inline YouTube player (links open in a new tab — avoids iframe complexity and CSP issues)
- Bulk-editing YouTube URLs across multiple songs at once
- Storing YouTube metadata (title, thumbnail) — just the URL

## Decisions

### D1: Store URLs in the song `.txt` file header
**Decision**: `YouTube: https://youtu.be/abc123` as a standard metadata header line. Multiple URLs as comma-separated on one line.
**Rationale**: Consistent with existing metadata approach; no new data store; URLs travel with the song file.
**Alternative**: Separate `songs-meta.json` sidecar — rejected because it splits a song's data across two files with no clear benefit.

### D2: New `PATCH /api/songs/:id/youtube` endpoint writes back to `.txt`
**Decision**: Dedicated endpoint that reads the current file, replaces (or adds) the `YouTube:` line in the header, and writes back atomically (write to temp then rename).
**Rationale**: Narrow scope — only touches the YouTube line, leaves all other content intact. Atomic write matches the pattern used by the playlist store.
**Alternative**: General `PUT /api/songs/:id` to rewrite entire file — over-engineered for this scope; risks corrupting lyrics on save.

### D3: Display as link cards, not embedded player
**Decision**: Render each URL as a card with the YouTube favicon, a shortened URL label, and an external-link icon. Tap opens in a new tab.
**Rationale**: Simpler, no CSP issues, works in any browser context. An embedded player would require `allow="autoplay"` attributes and break in some mobile webviews.

### D4: Extract YouTube video ID for display label
**Decision**: Parse the video ID from the URL to show a short label (e.g. `youtu.be/abc123` → display as "YouTube · abc123"). Full URL is the href.
**Rationale**: Long YouTube URLs are ugly; a short ID makes the card readable without fetching oEmbed metadata.

## Risks / Trade-offs

- **File write corrupts song** → Mitigation: atomic write (temp file + rename); only the `YouTube:` line is replaced, rest of file untouched.
- **Invalid URL stored** → Mitigation: validate that value starts with `https://` and contains `youtube.com` or `youtu.be` before saving; return 400 otherwise.
- **Comma in URL** → Mitigation: split on `, ` (comma-space) not plain comma to avoid splitting query params.

## Open Questions

- Should a song support unlimited YouTube references or cap at (e.g.) 3? → Suggest cap at 5 for now, enforced in the API.
