# Church Playlist Manager

A web application for managing worship service playlists, song libraries, and service planning.

## Features

- **Home Dashboard** — Bento box grid with quick actions for creating playlists, browsing playlists, and browsing songs
- **Playlist Management** — Create, edit, and delete playlists for different service types (Holy Communion, ACTS, Praise & Worship)
- **Song Library** — Browse 493+ songs with split-panel layout, search, filter by recent usage, and sort options
- **Lectionary Lookup** — Auto-populate theme and bible lessons from the lectionary calendar
- **Display View** — Clean, print-friendly playlist display with optional lyrics toggle
- **Export to .docx** — Download playlists as Word documents with service details and song lyrics
- **Usage Tracking** — Track when songs were last used and how frequently

## Getting Started

### Prerequisites

- Node.js 18+
- Song files as `.txt` files in a `songs/` directory

### Installation

```bash
npm install
```

### Running

```bash
npm start
```

The app runs at `http://localhost:3000`.

### Testing

```bash
npm test
```

## Song File Format

Songs are stored as `.txt` files in the `songs/` directory with this format:

```
Title: Amazing Grace
Artist: Traditional
Key: G
Tempo: 72

Amazing grace how sweet the sound
That saved a wretch like me
I once was lost but now am found
Was blind but now I see
```

## Deployment

The app is configured for deployment on Railway:

- Reads `PORT` from environment variables
- Uses file-based storage in `data/` (mount a volume for persistence)
- Songs directory should also be mounted as a volume

## Tech Stack

- **Backend:** Node.js, Express
- **Frontend:** Vanilla HTML, CSS, JavaScript
- **Storage:** File-based (JSON for playlists/usage, .txt for songs)
- **Export:** docx package for Word document generation

## TODO

- [x] Database of analytics
- [x] Userback integration
- [x] Add Song Keys as a related record or information to each song
- [x] Music section per song — key chip + freeform notes field (parsed from song files, shown in detail panel)
- [x] Per-song music overrides in playlists — key, tempo, and notes editable per song per service
- [x] Song search results - show the first 2 lines in search results along with the song title
- [x] Mobile responsiveness fixes
- [x] New Filter - Change Filters names and add This Year, Songs not Sung in the last year
- [ ] Google Doc Creation
- [ ] Google Drive Sync
- [ ] Add a new song feature
- [ ] Email the attachment
- [ ] Song suggestions based on Bible lessons and weekly theme
- [ ] Live song scroller - Karaoke slide mode
- [ ] Edit a song feature
- [ ] Google Analytics integration
- [ ] Propresenter Import - Create a Sunday song version that is separate from the master song list
- [ ] Overlay Song Chords via association