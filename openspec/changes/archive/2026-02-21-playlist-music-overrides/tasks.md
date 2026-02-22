## 1. Backend — Data Model & Store

- [x] 1.1 Add a `normaliseSections(sections)` helper in `src/playlistStore.js` that converts `{name, songIds}` → `{name, songs: [{id, key, tempo, notes}]}` when `songs` is absent, and passes through sections already in the new format
- [x] 1.2 Call `normaliseSections` in `findAll` and `findById` before returning playlists

## 2. Backend — API Routes

- [x] 2.1 Update `resolveSongs` in `src/routes/playlists.js` to accept `section.songs` (array of `{id, key, tempo, notes}`) and merge overrides onto the master song: effective `key = entry.key ?? masterSong.key`, same for `tempo` and `notes`; store raw overrides in `_override` on each resolved song
- [x] 2.2 Update `GET /api/playlists/:id` and the export route to pass `section.songs` (not `section.songIds`) to `resolveSongs`
- [x] 2.3 Update `syncForPlaylist` in `src/analyticsDb.js` to iterate `section.songs` (with fallback to `section.songIds` for safety), and use the effective key/tempo (override ?? master)
- [x] 2.4 Update `buildDocContent` in `src/routes/playlists.js` to include the `notes` field in the key/tempo meta line for each song

## 3. Frontend — Editor

- [x] 3.1 Update `addSongToSection` in `public/app.js` to push `{id: songId, key: null, tempo: null, notes: null}` onto `section.songs` instead of `section.songIds`
- [x] 3.2 Update `removeSongFromSection` to splice from `section.songs`
- [x] 3.3 Update `moveSong` to operate on `section.songs`
- [x] 3.4 Update `refreshEditor` and `savePlaylist` to serialise sections as `{name, songs: [{id, key, tempo, notes}]}` (drop `songIds` from the PUT body)
- [x] 3.5 Update the song row HTML in `renderPlaylistEditor` to include a music override row beneath the song title with three inputs: Key (text, short), Tempo (text, short), Notes (text, wider)
- [x] 3.6 Wire `input` event listeners on the override fields to update `section.songs[songIdx].key / .tempo / .notes` in `currentPlaylist` (store `null` for empty)

## 4. Frontend — Display View

- [x] 4.1 Update the display view song rendering in `public/app.js` to show a music info line (key, tempo, notes) using the effective values already present on the resolved song object

## 5. Styles

- [x] 5.1 Add `.song-override-row` CSS to `public/style.css`: a compact flex row of small inputs beneath each song row in the editor
- [x] 5.2 Add `.override-input` styles: small, understated inputs that don't dominate the UI

## 6. Verification

- [x] 6.1 Run `npm test` — all tests pass
- [x] 6.2 Open the playlist editor, confirm Key/Tempo/Notes fields appear per song, pre-filled with master values as placeholders
- [x] 6.3 Set a key override on one song, save the playlist, and confirm the override persists on reload
- [x] 6.4 Open the Display view and confirm the override key is shown for that song
- [x] 6.5 Confirm existing playlists (stored with `songIds`) load and display correctly without any data migration
