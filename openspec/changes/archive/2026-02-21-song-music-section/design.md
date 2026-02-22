## Context

Songs are stored as `.txt` files with a simple `Field: Value` metadata header followed by lyrics. The parser currently recognises `title`, `artist`, `key`, and `tempo`. The song detail panel in the UI shows all four fields plus full lyrics.

Adding a `Notes` field follows the same pattern as existing metadata: one line in the header, parsed by `songParser.js`, passed through the API, and rendered in the frontend. Because `toSummary` uses object spread (`...meta`), the new field is automatically included in list responses with no API route changes.

## Goals / Non-Goals

**Goals:**
- Support a `Notes:` field in song `.txt` files (single-line or multi-line is not in scope — header fields end at blank line, so notes is a single logical line)
- Display a "Music" section in the song detail panel showing Key and Notes
- Notes renders as a pre-formatted or wrapped text block so longer values remain readable

**Non-Goals:**
- In-app editing of song files (songs are managed as files outside the app)
- Multi-line `Notes` spanning multiple header lines (out of scope — keep parser simple)
- Surfacing Notes in the song list, search, or playlist editor

## Decisions

**Single-line Notes field** — The existing parser reads metadata one line at a time, stopping at the first blank line. Supporting multi-line notes would require a new delimiter convention and significant parser complexity. A single (potentially long) line is sufficient for chord notations, capo position, tempo guidance, and similar short annotations.

**"Music" section placement** — The Music section appears between the metadata header (title/artist/key/tempo chips) and the lyrics block. This groups musical context together and keeps lyrics visually separate.

**Notes only shown when non-null** — If a song has no `Notes:` field, the Music section shows only the key chip. If both key and notes are absent, the Music section is omitted entirely, preserving clean layout for minimal song files.

## Risks / Trade-offs

- **Existing song files have no `Notes:` field** → Graceful: `notes` defaults to `null`, UI omits the notes block. No migration needed.
- **Long notes values** → Notes renders with `white-space: pre-wrap` so the value wraps naturally without truncation.
