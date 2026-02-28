## 1. Home Page Label Updates

- [x] 1.1 In `public/index.html`, change the bento card label from "Create Playlist" to "New Playlist"
- [x] 1.2 In `public/index.html`, change the bento card label from "List Playlists" to "View Playlists"

## 2. Playlist Editor Sidebar Cleanup

- [x] 2.1 In `renderPlaylistEditor()` in `public/app.js`, remove the Theme (`#edit-theme`) form group from the sidebar HTML
- [x] 2.2 In `renderPlaylistEditor()` in `public/app.js`, remove the Bible Lessons (`#edit-bible-lessons`) form group from the sidebar HTML

## 3. Inline-Editable Theme and Lessons in Summary Panel

- [x] 3.1 In `renderPlaylistEditor()`, replace the read-only Theme row in `.editor-header-summary` with an editable `<textarea id="edit-theme">` pre-populated with the current theme value
- [x] 3.2 In `renderPlaylistEditor()`, replace the read-only Lessons row in `.editor-header-summary` with an editable `<textarea id="edit-bible-lessons">` pre-populated with the current bible lessons value (newline-separated)
- [x] 3.3 Verify `savePlaylist()` still reads from `#edit-theme` and `#edit-bible-lessons` correctly (IDs unchanged, no additional wiring needed)
- [x] 3.4 Add CSS in `public/style.css` to style the summary panel textareas to blend with the summary row layout (minimal border, appropriate font/size)

## 4. Apple Design System Header

- [x] 4.1 In `renderPlaylistEditor()`, replace the `<h2>Edit Playlist</h2>` with a `.editor-page-header` div containing a home icon button and the playlist name
- [x] 4.2 Add `.editor-page-header` CSS: system font stack, playlist name at 1.75rem+, light background, subtle bottom border (`#e5e5ea`), 16px+ vertical padding
- [x] 4.3 Style the playlist name within the header as a bold, prominent title

## 5. Home Icon Navigation

- [x] 5.1 Add a `<button class="btn-icon home-nav-btn">⌂</button>` (or house emoji) at the leading edge of the `.editor-page-header`
- [x] 5.2 Wire the `home-nav-btn` click event in `app.js` to call `showHome()`
- [x] 5.3 Add CSS for `.home-nav-btn` sizing, hover state, and alignment within the header
