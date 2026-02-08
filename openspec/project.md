# Church Playlist Manager

## Purpose

A web application for church music team members to create and manage playlists for Sunday services. Streamlines the workflow of selecting songs, reviewing lyrics, assembling service playlists, and exporting them for the team.

## Tech Stack

- **Backend:** Node.js
- **Frontend:** Simple HTML/JS (no framework)
- **Data storage:** File-based (no database)

## Core Features

- **Song library:** Browse and search the full catalog of songs
- **Lyrics display:** View full lyrics and metadata for any song
- **Playlist creation:** Assemble ordered playlists for a given service date
- **Usage tracking:** Track when songs were last used to help with rotation and variety
- **Google Docs export:** Export a playlist to a Google Doc for sharing with the team

## Data Model

### Songs

Songs are stored as individual `.txt` files in the `songs/` directory, one file per song. Filenames use kebab-case (e.g., `amazing-grace.txt`).

**File format:**

```
Title: <song title>
Artist: <artist/author>
Key: <musical key>
Tempo: <BPM value> BPM

<Section Label>:
<lyrics line 1>
<lyrics line 2>
...

<Section Label>:
<lyrics line 1>
...
```

Metadata fields appear at the top of the file, followed by a blank line, then sections (e.g., `Verse 1:`, `Verse 2:`, `Chorus:`, `Bridge:`) each followed by their lyrics.

### Playlists

Playlists are stored in the `data/` directory. Each playlist represents a service date and contains an ordered list of songs.

## Directory Structure

```
songs/           # Song library (one .txt file per song)
data/            # Playlists and usage tracking data
openspec/        # Project specifications
```
