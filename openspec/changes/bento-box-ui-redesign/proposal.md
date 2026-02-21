## Why

The current UI uses a basic tab-based layout with small headers and compact forms. Users navigate between Service Playlists and Songs via header tabs, but there is no landing/home experience and the playlist details feel cramped. A modern Apple-inspired Bento Box grid design will make the app more visually appealing, provide a clear home page with prominent navigation, and give playlist details more breathing room.

## What Changes

- Add a new **home page** with large Bento Box grid cards as call-to-action tiles: "Create Playlist", "List Playlists", and "All Songs"
- Replace the current header tab navigation with a home page-first flow (clicking a tile navigates to that section, with a back-to-home link)
- Redesign the overall visual style to use Apple-inspired aesthetics: generous whitespace, large rounded corners, subtle shadows, clean typography
- Update the **playlist editor** header and details section to be larger and more prominent — bigger fonts, more spacing, card-based metadata layout
- Keep all existing functionality intact — this is a pure visual/layout redesign

## Capabilities

### New Capabilities
- `bento-home-page`: Home page with Bento Box grid layout providing large call-to-action cards for navigating to Service Playlists and Songs sections, plus a Create Playlist quick action

### Modified Capabilities
- `playlist-display`: Update playlist editor/detail header to use larger typography and more spacious layout for metadata fields

## Impact

- `public/index.html` — Add home page section with bento grid markup
- `public/style.css` — Major overhaul: new CSS variables, bento grid styles, updated typography scale, larger playlist header styles, Apple-inspired design tokens
- `public/app.js` — Add home page navigation logic (show/hide home vs sections), update tab switching to support home page flow
- No backend changes required
- No new dependencies
