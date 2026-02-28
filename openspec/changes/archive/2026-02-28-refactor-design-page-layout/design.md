## Context

This is a pure frontend UI change. The backend API and data model are unchanged. All work is in `public/index.html`, `public/app.js`, and `public/style.css`.

Current state:
- Home page bento cards use labels "Create Playlist" and "List Playlists"
- Playlist editor sidebar (`editor-sidebar`) contains Theme and Bible Lessons textareas
- Playlist editor summary panel (`editor-header-summary`) displays Theme and Lessons as read-only text
- Playlist editor page header is an `<h2>Edit Playlist</h2>` with no navigation or Apple design styling

## Goals / Non-Goals

**Goals:**
- Update home page bento card labels to match user mental model ("New Playlist", "View Playlists")
- Remove Theme and Bible Lessons from the editor sidebar to reduce duplication
- Make Theme and Lessons inline-editable in the summary panel so users edit them in context
- Restyle the playlist editor page header to match the Apple Design System (clean typography, system font, minimal chrome)
- Add a Home icon button to the editor header for quick navigation back to the home page

**Non-Goals:**
- No backend or API changes
- No changes to how Theme/Lessons data is stored or saved (same fields, same save flow)
- No changes to the playlist display view, song list, or any other section
- No mobile-specific layout overhaul (existing responsive behavior is preserved)

## Decisions

### Inline editing of Theme/Lessons in summary panel
Replace the two read-only `<div>` rows in `.editor-header-summary` with input/textarea fields. These integrate into the existing `savePlaylist()` flow — they read from `#edit-theme` and `#edit-bible-lessons`. To avoid duplicate IDs, the sidebar fields are removed; the summary panel inputs become the canonical inputs.

**Alternative considered**: Keep sidebar inputs and mirror values. Rejected — creates sync complexity and the sidebar already has enough fields.

### Apple Design System header
Replace the plain `<h2>Edit Playlist</h2>` with a styled `.editor-page-header` block using:
- System font stack: `-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif`
- Large bold playlist name (1.75rem+)
- Light background with a subtle bottom border (`#e5e5ea`)
- Adequate vertical padding (16px+)

The header contains: Home icon button (left) | playlist name (center/left) | optional action area (right).

### Home icon
Use a simple `⌂` character or `🏠` emoji wrapped in a `<button class="btn-icon home-nav-btn">`. On click, call the existing `showHome()` function already defined in `app.js`.

## Risks / Trade-offs

- Removing sidebar Theme/Lessons inputs means users who relied on the sidebar scroll position for those fields must now use the summary panel. Low risk — the summary panel is immediately visible at the top of the editor.
- `savePlaylist()` currently reads `#edit-theme` and `#edit-bible-lessons`. After migration, these IDs must remain on the summary panel inputs (or the save function must be updated to reference the new IDs). Keep the same IDs to minimize changes.
