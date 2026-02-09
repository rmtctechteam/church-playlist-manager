## Why

The app currently supports browsing and searching songs but has no way to organize them into playlists for worship services. Worship leaders need to plan song sets for specific dates, track song usage to maintain variety, and produce formatted setlists for the team.

## What Changes

- Add CRUD API and UI for creating, editing, and deleting named playlists
- Add three preset worship service types (Holy Communion, ACTS, Praise and Worship) that provide section templates for organizing songs, plus a Custom type for free-form sections
- Add ability to add, remove, and reorder songs within playlist sections
- Add date-based scheduling so playlists can be assigned to specific service dates
- Track song usage history across playlists to surface frequency and recency data
- Add playlist display view suitable for projection or printing
- New `data/playlists.json` file for persistent playlist storage
- New `data/usage.json` file for song usage tracking
- New API routes under `/api/playlists`
- New frontend views for playlist management and display

## Capabilities

### New Capabilities

- `playlist-crud`: Create, read, update, and delete named playlists with section-based song organization and preset service types
- `playlist-scheduling`: Assign playlists to service dates and browse upcoming/past services
- `song-usage-tracking`: Record and query song usage history (frequency, last used date) across playlists
- `playlist-display`: Render a formatted, read-only playlist view for projection or print

### Modified Capabilities

_None — this is entirely new functionality._

## Impact

- **API**: New `/api/playlists` and `/api/service-types` route groups; no changes to existing `/api/songs` routes
- **Frontend**: New playlist management views alongside existing song browser; navigation changes to header
- **Storage**: New JSON files in `data/` directory (`playlists.json`, `usage.json`)
- **Dependencies**: No new npm dependencies required — uses existing Express and file-based storage patterns
