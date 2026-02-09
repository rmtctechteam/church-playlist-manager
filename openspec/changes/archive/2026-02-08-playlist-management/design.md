## Context

The app is a Node.js/Express server with a vanilla HTML/JS frontend. Songs are loaded from `.txt` files into memory at startup. There is no database — the existing pattern is file-based storage. The `data/` directory exists but is currently empty. The frontend is a single-page app with two views (song list and song detail) toggled via CSS classes.

Adding playlist management introduces the app's first mutable data: playlists can be created, modified, and deleted, and usage history accumulates over time. This is a meaningful shift from the current read-only song browsing.

## Goals / Non-Goals

**Goals:**
- Enable worship leaders to create and manage playlists of songs for services
- Assign playlists to specific service dates for planning
- Track song usage to help leaders maintain variety
- Provide a clean display view for sharing setlists with the team
- Follow existing patterns (file-based JSON storage, Express routing, vanilla JS frontend)

**Non-Goals:**
- Multi-user authentication or access control
- Real-time collaboration or conflict resolution
- Database migration (staying with file-based storage)
- Song editing or upload (songs remain as static `.txt` files)
- Drag-and-drop reordering in the UI (use up/down buttons instead)

## Decisions

### 1. Storage: JSON files in `data/`

**Choice:** Store playlists in `data/playlists.json` and usage records in `data/usage.json`.

**Why:** Matches the existing file-based approach. No new dependencies. Simple to back up and version. The scale (a single church) means concurrent write contention is negligible.

**Alternatives considered:**
- SQLite: Better for querying usage data, but adds a dependency and diverges from the project's simplicity.
- One file per playlist: Avoids large single-file writes but complicates listing and atomic updates.

### 2. Preset worship service types

**Choice:** Three built-in service types, each providing a label and a section template that organizes songs into named slots:

| Type | Sections |
|------|----------|
| **Holy Communion** | Gathering, Word, Communion, Sending |
| **ACTS** | Adoration, Confession, Thanksgiving, Supplication |
| **Praise and Worship** | Opening, Worship Set, Response, Closing |

When creating a playlist, the user selects a service type. The playlist is initialized with the type's sections as empty slots. Songs are added to individual sections rather than a flat list. The type can also be set to "Custom" to allow free-form sections that the user defines.

**Why:** Worship leaders plan services around liturgical structure. Preset templates reduce setup time and encourage consistent service flow. The section-based model maps naturally to how worship teams think about a setlist.

**Alternatives considered:**
- Flat song list only: Simpler, but doesn't capture the structural intent of different service styles.
- User-defined templates: More flexible, but adds complexity. The three presets cover the church's needs; "Custom" type handles edge cases.

### 3. Data model

**Service type definitions (hardcoded in server):**
```json
{
  "holy-communion": {
    "name": "Holy Communion",
    "sections": ["Gathering", "Word", "Communion", "Sending"]
  },
  "acts": {
    "name": "ACTS",
    "sections": ["Adoration", "Confession", "Thanksgiving", "Supplication"]
  },
  "praise-and-worship": {
    "name": "Praise and Worship",
    "sections": ["Opening", "Worship Set", "Response", "Closing"]
  }
}
```

**Playlist structure:**
```json
{
  "id": "uuid-string",
  "name": "Sunday Morning Worship",
  "type": "holy-communion",
  "date": "2026-02-15",
  "sections": [
    { "name": "Gathering", "songIds": ["Amazing Grace - Traditional"] },
    { "name": "Word", "songIds": [] },
    { "name": "Communion", "songIds": ["10000 Reasons"] },
    { "name": "Sending", "songIds": ["All Creatures of Our God and King"] }
  ],
  "notes": "Optional notes for the team",
  "createdAt": "2026-02-08T12:00:00Z",
  "updatedAt": "2026-02-08T12:00:00Z"
}
```

**Usage record structure:**
```json
{
  "songId": "Amazing Grace - Traditional",
  "playlistId": "uuid-string",
  "date": "2026-02-15"
}
```

**Why:** Song IDs are already the filename (without `.txt`), so `songIds` references work directly. The `sections` array replaces the flat `songIds` list to organize songs by service section. The `type` field links to a preset definition. Usage records are derived from all songs across all sections when the playlist has a date. For "custom" type playlists, the user defines their own section names.

### 4. API design: RESTful under `/api/playlists`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/service-types` | List available service types with their section templates |
| GET | `/api/playlists` | List all playlists (sorted by date desc) |
| GET | `/api/playlists?upcoming=true` | Filter to future dates |
| POST | `/api/playlists` | Create a playlist (requires `type`) |
| GET | `/api/playlists/:id` | Get a single playlist (with full song details per section) |
| PUT | `/api/playlists/:id` | Update a playlist |
| DELETE | `/api/playlists/:id` | Delete a playlist |
| GET | `/api/songs/:id/usage` | Get usage history for a song |

**Why:** Follows REST conventions. The `/api/service-types` endpoint lets the frontend fetch available types and their section templates for the creation form. Playlist GET by ID resolves `songIds` within each section to full song objects for the detail/display view.

### 5. Usage tracking: Derived from playlists

**Choice:** Usage records are computed from playlists that have a `date` field. When a playlist is saved with a date, usage entries are written for each song. When a playlist is updated or deleted, usage records are recalculated.

**Why:** Avoids separate "confirm usage" workflows. A playlist with a date is an implicit record of use. This keeps the model simple — usage is always consistent with playlist data.

### 6. Frontend: Tab-based navigation

**Choice:** Add a tab bar to the header with "Songs" and "Playlists" tabs. Each tab shows its respective view. Playlist management gets three sub-views: playlist list, playlist editor, and playlist display.

**Why:** Minimal change to existing structure. The song browser continues to work as-is. Tab switching uses the same CSS class toggle pattern already in place.

### 7. Playlist display: Print-friendly CSS

**Choice:** The display view renders a clean, read-only view of the playlist with song titles, keys, and optional lyrics. A print stylesheet hides navigation and optimizes layout.

**Why:** Worship teams commonly print setlists or project them. CSS `@media print` handles this without any extra dependencies.

### 8. ID generation: `crypto.randomUUID()`

**Choice:** Use Node.js built-in `crypto.randomUUID()` for playlist IDs.

**Why:** Available in Node.js 19+ (the project uses Express 5 which requires modern Node). No external dependency needed. UUIDs avoid collisions without a counter.

## Risks / Trade-offs

- **File write concurrency** → For a single-church app with few users, write conflicts are extremely unlikely. If needed later, a simple file lock can be added.
- **Data loss on crash during write** → Write to a temp file then rename (atomic on most filesystems) to minimize corruption risk.
- **Song deletion breaks playlists** → Songs are static `.txt` files not managed by the app, so this is unlikely. Display will gracefully handle missing songs by showing the ID with a "not found" note.
- **Large playlists.json** → A church might create ~50 playlists/year. Even after years, the file stays well under 1MB. Not a concern.
- **No undo for delete** → Playlist deletion is permanent. The UI will use a confirmation dialog to prevent accidents.
