## Why

Worship leaders need a structured place to capture musical context for each song — the key it's played in and any performance notes (e.g., chord overrides, modulation cues, tempo instructions, capo position). Currently key is surfaced only as a metadata badge, and there is no notes field at all.

## What Changes

- Add a `Notes:` metadata field to the song `.txt` file format, parsed alongside Title/Artist/Key/Tempo
- Add a dedicated **Music** section in the song detail panel displaying Key and Notes
- Notes renders as a readable multi-line block (not an editable field — songs are file-managed)

## Capabilities

### New Capabilities
- `song-music-section`: A "Music" section in the song detail view that surfaces the song key and a freeform music notes field for chord charts, performance instructions, or other musical context

### Modified Capabilities
- `song-parser`: Add `Notes` as a supported metadata field parsed from song `.txt` files (multi-word value, ends at the first blank line)
- `song-display`: Song detail panel gains a Music section beneath the metadata header, showing Key and Notes

## Impact

- `src/songParser.js` — add `notes` to `METADATA_FIELDS`
- `src/routes/songs.js` — `notes` is already included in `toSummary` via spread (no change needed)
- `public/app.js` — render Music section in song detail panel
- `public/style.css` — styles for Music section
- `test/songParser.test.js` — add test for `notes` field parsing
