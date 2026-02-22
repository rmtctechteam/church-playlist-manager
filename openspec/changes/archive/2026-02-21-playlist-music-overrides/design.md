## Context

Playlist sections currently store only an ordered list of song IDs (`songIds: [string]`). When the API resolves a playlist, it looks up each ID in the songs array and attaches the full master song object. The frontend reads `section.songs` (the resolved form) for display, and writes `section.songIds` back on save.

## Goals / Non-Goals

**Goals:**
- Store per-song key, tempo, and notes overrides in the playlist section alongside the song ID
- Editor shows pre-filled, editable fields; display view uses effective values
- Fully backward-compatible with existing playlist JSON (no manual migration)

**Non-Goals:**
- Editing the master song file from the playlist editor
- Per-song overrides on the song library page
- Overriding artist or title

## Decisions

**New section song format: `songs: [{id, key, tempo, notes}]`**
Replacing the flat `songIds` array with a structured array of objects. Each slot holds the song reference (`id`) plus nullable override fields. This is the cleanest representation — the section is self-contained.

*Alternative considered: `songOverrides: {[id]: {key, tempo, notes}}` alongside `songIds`.* Rejected — two parallel structures are harder to keep in sync and add complexity at every layer.

**Transparent normalisation on read (backward compat)**
`playlistStore.findById` and `findAll` check each section: if `songs` is absent but `songIds` is present, derive `songs: songIds.map(id => ({id, key: null, tempo: null, notes: null}))`. After the first save of any playlist, it will be in the new format. No migration script needed.

**Override merge in `resolveSongs`**
`resolveSongs` accepts `section.songs` (the new format). For each entry it looks up the master song by ID and returns `{...masterSong, key: entry.key ?? masterSong.key, tempo: entry.tempo ?? masterSong.tempo, notes: entry.notes ?? masterSong.notes, _override: {key: entry.key, tempo: entry.tempo, notes: entry.notes}}`. The `_override` object lets the frontend distinguish "no override set" from "override matches master" — important for pre-filling inputs.

**Analytics uses effective values**
`syncForPlaylist` iterates `section.songs` (normalised), uses `entry.key ?? masterSong.key` and `entry.tempo ?? masterSong.tempo` as the recorded values.

**Editor UI: compact inline override row**
Each song row in the editor gains a collapsible "Music" row beneath the song title, showing three small inputs: Key, Tempo, Notes. These are always visible (not toggled) to keep the workflow simple. Placeholder text shows the master value so the user knows the default.

## Risks / Trade-offs

- **Existing `section.songIds` references in frontend** — `addSongToSection`, `removeSongFromSection`, `moveSong`, and `refreshEditor` all use `section.songIds`. These must be updated to use `section.songs`. The normalisation on read ensures `currentPlaylist.sections[i].songs` is always populated after a fetch.
- **Notes field name collision** — Both the master song and the playlist-level entry have a `notes` field. The override notes are stored as `entry.notes` in the section; after merge, the resolved song object's `notes` is the effective value. Clear but worth testing.
