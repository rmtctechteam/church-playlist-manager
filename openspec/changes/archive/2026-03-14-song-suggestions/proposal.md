## Why

Worship leaders spend time manually hunting for songs that fit the week's theme and scripture. With the lectionary theme and Bible passages already auto-populated on playlist creation, the app has everything it needs to suggest relevant songs automatically — reducing prep time and surfacing songs that might otherwise be overlooked.

## What Changes

- After a new playlist is created and the lectionary lookup completes, the editor presents a choice: **"Get Song Suggestions"** or **"Pick Songs Myself"**
- If the user chooses suggestions, the app sends the service theme, Bible passage references, and the full song library to the Claude API, which returns a ranked list of song recommendations with brief reasoning for each match
- The user can review suggestions and add songs to sections directly from the suggestion panel
- "Pick Songs Myself" bypasses the suggestion step and opens the editor as normal today

## Capabilities

### New Capabilities
- `song-suggestions`: AI-powered song recommendation using the service theme and Bible passages, presented as an optional step in the new playlist workflow

### Modified Capabilities
- `playlist-crud`: The new playlist creation flow gains a post-creation step (suggest vs. pick) before the user lands in the full editor

## Impact

- **Playlist editor** (`public/app.js`) — new modal or panel step after playlist creation and lectionary auto-lookup
- **New API endpoint** — `POST /api/playlists/:id/suggestions` accepts theme + bible lessons, passes them along with the song list to Claude, returns ranked suggestions
- **Claude API** — new dependency (`@anthropic-ai/sdk`); requires `ANTHROPIC_API_KEY` env var
- **Song library** — song titles (and optionally first lines) passed to Claude as context; no structural changes to song files
- **No changes** to lectionary, storage, or export features
