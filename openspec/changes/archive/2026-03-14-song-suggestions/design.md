## Context

The app already auto-populates theme and Bible lessons when a new playlist is created (via the lectionary lookup). The worship leader then has everything needed for song selection, but must manually browse the song library to find relevant songs. This design adds an optional AI-assisted step between playlist creation and the full editor, using the Claude API to suggest songs from the library that match the service theme and passages.

The song library contains 400+ songs stored as `.txt` files. Songs are loaded into memory at server startup and include title, artist, key, tempo, and lyrics.

## Goals / Non-Goals

**Goals:**
- Present a "Get Suggestions" vs "Pick Myself" choice immediately after new playlist creation and lectionary auto-lookup
- Call the Claude API server-side with the theme, Bible passages, and song list to get ranked suggestions with reasoning
- Allow the user to add suggested songs to specific sections directly from the suggestion panel
- Require no changes to the song file format or playlist data model

**Non-Goals:**
- Suggestions for existing (already-saved) playlists
- Automatically adding songs without user review
- Re-ranking or re-fetching suggestions after the initial call
- Offline/fallback suggestion logic if `ANTHROPIC_API_KEY` is not set (feature simply won't appear)

## Decisions

### 1. Server-side Claude API call (not client-side)

The Claude API call is made server-side at `POST /api/playlists/:id/suggestions`. Reasons:
- Keeps `ANTHROPIC_API_KEY` out of the browser
- Allows response shaping and error handling in one place
- Client stays simple — one fetch call, renders results

**Alternative considered:** Client-side fetch to Claude API directly. Rejected — exposes the API key.

### 2. Pass song titles + first lyric line (not full lyrics)

Claude receives each song as `{ title, artist, firstLine }`. Full lyrics would exceed context limits for 400+ songs and slow the response.

**Alternative considered:** Send only titles. Rejected — first lines give Claude meaningful semantic signal (e.g. "Amazing grace how sweet the sound" vs just "Amazing Grace").

### 3. Prompt design: single structured call

One API call with a structured prompt asking Claude to return a JSON array of suggestions: `[{ songId, title, reason, section }]`. The `section` hint lets Claude suggest which part of the service a song fits (e.g. "Gathering", "Communion").

**Alternative considered:** Multiple smaller calls per section. Rejected — slower, more expensive, harder to rank holistically.

### 4. UI: inline panel, not a separate page

The suggestion step appears as a modal/overlay on the playlist editor page immediately after creation. The editor is rendered behind it. If the user dismisses or chooses "Pick Myself", the overlay closes and the editor is ready.

**Alternative considered:** Separate route/page. Rejected — adds navigation complexity for a one-time step.

### 5. Feature gated on ANTHROPIC_API_KEY

If the env var is not set, the suggestions step is skipped entirely and the user lands in the editor as normal. No error shown — the feature simply isn't offered.

## Risks / Trade-offs

- **Claude API latency** → Show a loading state; the call may take 3–8 seconds for a large song list. Mitigate with a spinner and cancel option.
- **Token cost** → Sending 400+ song summaries per request. Each call is roughly 6–10K tokens. Acceptable for infrequent use (once per new playlist). Could be reduced later by filtering songs to a shorter list.
- **Suggestions quality** → Claude may not know all song titles. First lines help but lesser-known songs may get lower-quality matches. Mitigate by including the reason field so users can assess relevance.
- **API key not configured** → Feature silently absent. Documented in README and `.env.example`.

## Open Questions

- Should suggestions include a confidence score or just free-text reasoning?
- Should the user be able to re-run suggestions with a different prompt / more context?
- Should songs already in the playlist be excluded from suggestions?
