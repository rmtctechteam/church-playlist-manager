## Why

The music director needs to specify the actual key, tempo, and performance notes for each song as it will be played in a specific service — which may differ from the master song defaults. Currently the playlist editor shows songs with their library key/tempo but there is no way to override or annotate them per service.

## What Changes

- Extend the playlist section data model: each song slot stores its own `key`, `tempo`, and `notes` overrides alongside the song ID
- Playlist editor shows compact inline fields (key, tempo, notes) per song, pre-filled from the master song but editable
- Playlist display view shows override values, falling back to master values
- `analyticsDb` records the effective (override or master) key/tempo when syncing usage
- Backward-compatible read: existing playlists using `songIds: [string]` are transparently normalised on load

## Capabilities

### New Capabilities
- `playlist-song-overrides`: Per-song key, tempo, and notes overrides stored in playlist sections and surfaced in editor and display views

### Modified Capabilities
- `playlist-crud`: Section data model changes from `{name, songIds}` to `{name, songs: [{id, key, tempo, notes}]}`; API accepts both formats on write; read normalises to new format
- `playlist-display`: Song display in the Display Playlist view uses override key/tempo/notes if set, otherwise falls back to master song values

## Impact

- `src/playlistStore.js` — normalise `songIds` → `songs` on read in `findAll`/`findById`
- `src/routes/playlists.js` — update `resolveSongs` to merge overrides; update `syncForPlaylist` call path; update `buildDocContent` to use effective key/tempo/notes
- `src/analyticsDb.js` — update `syncForPlaylist` to read song IDs from `section.songs[].id` (with fallback to `section.songIds`)
- `public/app.js` — add override fields to editor song rows; update save/refresh serialisation; update display view
- `public/style.css` — styles for override field row in editor
