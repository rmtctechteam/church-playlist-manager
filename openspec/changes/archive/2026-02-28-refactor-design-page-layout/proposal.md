## Why

Several UI labels and layout choices in the home page and playlist editor have accumulated small friction points: button labels don't match user mental models, the playlist editor sidebar duplicates editable fields found in the summary panel, and the editor header lacks consistent Apple design language and quick home navigation. This change cleans up these inconsistencies for a tighter, more coherent experience.

## What Changes

- **Home page** — rename "List Playlists" card to "View Playlists"
- **Home page** — rename "Create Playlist" card to "New Playlist"
- **Playlist editor — side panel** — remove Theme and Bible Lesson fields (they will live only in the summary panel)
- **Playlist editor — summary panel (right)** — make Theme and Lessons fields inline-editable directly from the summary view
- **Playlist editor — page header** — restyle to match Apple Design System conventions (typography, spacing, visual weight)
- **Playlist editor — page header** — add a Home icon/button for quick return to the home page

## Capabilities

### New Capabilities
<!-- none -->

### Modified Capabilities
- `bento-home-page`: Card labels updated — "Create Playlist" → "New Playlist", "List Playlists" → "View Playlists"; spec scenarios referencing these labels must be updated
- `playlist-display`: Side panel removes Theme and Bible Lesson input fields; summary panel gains inline-editable Theme and Lessons fields; page header adopts Apple Design System style and adds a Home navigation icon

## Impact

- `public/index.html` or equivalent frontend template — card label text changes
- Playlist editor HTML/JS — side panel field removal, summary panel editability, header style and icon addition
- `bento-home-page` spec scenarios referencing old card labels
- `playlist-display` spec scenarios referencing sidebar metadata fields and header layout
