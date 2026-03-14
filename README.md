# Church Playlist Manager

A web application for managing worship service playlists, song libraries, and service planning.

## Features

- **Home Dashboard** — Bento box grid with quick actions for creating playlists, browsing playlists, and browsing songs
- **Playlist Management** — Create, edit, and delete playlists for different service types (Holy Communion, ACTS, Praise & Worship)
- **Song Library** — Browse 493+ songs with split-panel layout, search, filter by recent usage, and sort options
- **Lectionary Lookup** — Auto-populate theme and bible lessons from the lectionary calendar
- **Display View** — Clean, print-friendly playlist display with optional lyrics toggle
- **Export to .docx** — Download playlists as Word documents with service details and song lyrics
- **Export to Google Docs** — Export playlists directly to Google Docs
- **Song Upload** — Upload multiple `.txt` song files at once via the All Songs page
- **Google OAuth Login** — Restricted to `redeemermtc.org` domain accounts
- **Usage Tracking** — Track when songs were last used and how frequently

## Getting Started

### Prerequisites

- Node.js 18+
- Song files as `.txt` files in `volume/songs/`
- A Google Cloud project with OAuth 2.0 credentials

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/callback
SESSION_SECRET=your-session-secret
GOOGLE_ALLOWED_DOMAIN=yourdomain.org
# VOLUME_PATH=./volume              # optional — defaults to ./volume
# GOOGLE_SERVICE_ACCOUNT_JSON=...   # optional — enables Create Google Doc feature
# ANTHROPIC_API_KEY=sk-ant-...      # optional — enables AI song suggestions on new playlists
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

Songs are stored as `.txt` files in `volume/songs/` with this format:

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
- All persistent storage lives under a single volume mounted at `/app/volume`
- Set `VOLUME_PATH=/app/volume` in Railway's **Variables** tab
- Mount one Railway volume at `/app/volume` — this covers songs, playlists, and analytics
- Set `GOOGLE_CALLBACK_URL` to your Railway app's public URL (e.g. `https://your-app.railway.app/auth/callback`)
- Add the Railway callback URL to your Google OAuth app's **Authorized redirect URIs**

**First-time Railway volume setup:**
```bash
# In Railway shell, copy data into the new volume layout
mkdir -p /app/volume/songs /app/volume/config /app/volume/analytics
# Then upload your song files and data files into these directories
```

## Tech Stack

- **Backend:** Node.js, Express
- **Frontend:** Vanilla HTML, CSS, JavaScript
- **Storage:** File-based (JSON for playlists/usage, .txt for songs)
- **Auth:** Google OAuth 2.0 (Passport.js), domain-restricted
- **Export:** docx package for Word documents, Google Docs API for cloud export

## TODO

- [x] Database of analytics
- [x] Userback integration
- [x] Add Song Keys as a related record or information to each song
- [x] Music section per song — key chip + freeform notes field (parsed from song files, shown in detail panel)
- [x] Per-song music overrides in playlists — key, tempo, and notes editable per song per service
- [x] Song search results - show the first 2 lines in search results along with the song title
- [x] Mobile responsiveness fixes
- [x] New Filter - Change Filters names and add This Year, Songs not Sung in the last year
- [x] Instructions per page and overall
- [x] Google OAuth login (domain-restricted)
- [x] Export to Google Docs
- [x] Add a new song feature (multi-file .txt upload)
- [x] confirm deployment and database playlist storage
- [ ] Song suggestions based on Bible lessons and weekly theme
- [ ] swipe UI style to pick songs
- [ ] Google Drive Sync
- [ ] Edit a song feature
- [ ] Add Youtube references
- [ ] Propresenter Import - Create a Sunday song version that is separate from the master song list
- [ ] Overlay Song Chords via association
- [ ] Track Master Song Edits
- [ ] Compare the current song lyrics with a master lyric from a website - lyrics diff
- [ ] Live song scroller - Karaoke slide mode
- [ ] Google Analytics integration
- [ ] Support import of Propresenter Files
