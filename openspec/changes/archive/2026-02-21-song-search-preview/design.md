## Context

The songs API route (`src/routes/songs.js`) has a `toSummary` function that strips lyrics from each song before returning it in list responses. The frontend `renderSongList` function in `app.js` builds each `<li>` with only the title. All 493 songs are already in memory on the server, so computing a preview at response time is free — no disk I/O, no new queries.

## Goals / Non-Goals

**Goals:**
- Add `lyricsPreview` to song list API responses (first 2 non-empty lines of lyrics)
- Render the preview below the title in the song list
- Keep it visually subtle — title remains primary, preview is secondary

**Non-Goals:**
- Showing preview in the playlist editor's song search dropdown (separate concern)
- Highlighting matched query text in the preview
- Configurable number of preview lines

## Decisions

### Compute `lyricsPreview` in `toSummary` (server-side)
The `toSummary` function already has access to `lyrics`. Extract the first 2 non-empty lines from the first lyric section and join with `" / "`. This keeps the frontend simple (no text processing logic) and keeps the API response self-contained.

```js
function toSummary(song) {
  const { lyrics, ...meta } = song;
  const lines = (lyrics?.[0]?.lines || []).filter(l => l.trim());
  const lyricsPreview = lines.slice(0, 2).join(' / ') || null;
  return { ...meta, lyricsPreview };
}
```

### Render as a second line in the list item (frontend)
Add a `<span class="song-preview">` below `.song-title`. Only render if `lyricsPreview` is non-null. CSS truncates with `text-overflow: ellipsis` to keep items compact.

### CSS: `song-preview` class
- `font-size: 0.78rem`
- `color: var(--gray-400)`
- `white-space: nowrap; overflow: hidden; text-overflow: ellipsis`
- `display: block; margin-top: 0.15rem`

## Risks / Trade-offs

- **Response size**: Adding ~50–100 chars per song to list responses increases payload slightly (~25–50KB across 493 songs). Acceptable for this use case.
- **First section only**: Songs with an intro/label section that has no lines will show no preview. Acceptable edge case.

## Open Questions

- None.
