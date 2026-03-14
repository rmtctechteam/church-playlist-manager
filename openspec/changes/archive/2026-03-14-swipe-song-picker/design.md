## Context

The playlist editor currently uses a two-panel song browser (search + list) to find and add songs. On mobile, this panel layout is cramped. Users must scroll a list, read song previews, and click add — a multi-step flow that interrupts the creative rhythm of playlist building.

A swipe-style card deck is a well-understood mobile-first interaction model. Cards show one song at a time; swipe right (or press ✓) to add, swipe left (or press ✗) to skip. This is purely a frontend feature — no new backend endpoints are needed.

## Goals / Non-Goals

**Goals:**
- Touch-friendly swipe gesture (touchstart/touchmove/touchend) with visual drag feedback
- Mouse drag support for desktop users
- Keyboard shortcut fallback (→ / ← arrow keys, or A/S keys)
- Button controls (✓ Add / ✗ Skip) for non-touch users
- Deck built from the full song library, respecting active filters from the song list
- User selects a target section before entering swipe mode; added songs go to that section
- Session summary: count of songs added, option to continue swiping or close
- Empty-deck state when all songs have been seen

**Non-Goals:**
- Undo / "go back to previous card" — out of scope for v1
- Saving swipe history across sessions
- New backend routes — all data comes from existing `/api/songs` and playlist PUT endpoints

## Decisions

### D1: Overlay modal vs. full-page view
**Decision**: Full-screen overlay modal (like the suggestions panel).
**Rationale**: Keeps the playlist editor in the background for context. Easy to dismiss and return. Consistent with existing modal patterns in the app.
**Alternative**: Navigate to a new page — rejected because it loses editor state.

### D2: Card stack rendering
**Decision**: Render the top 3 cards in a stacked CSS layer (z-index offset + slight translate/rotate). Only the top card is interactive.
**Rationale**: Gives visual depth and "deck" feel with minimal DOM overhead. Avoids rendering all 400+ songs.
**Alternative**: Single flat card — rejected because it loses the card-stack metaphor.

### D3: Gesture detection
**Decision**: Native `touchstart`/`touchmove`/`touchend` + `mousedown`/`mousemove`/`mouseup` on the card element.
**Rationale**: No external library needed; keeps the vanilla JS constraint. Threshold: >80px horizontal drag triggers a swipe action.
**Alternative**: Hammer.js — rejected to avoid adding a dependency.

### D4: Filter integration
**Decision**: Swipe deck is built from `allSongs` (the already-loaded song array), filtered by whatever filters are currently active in the session. A "Filters" button inside the swipe overlay lets users adjust before starting.
**Rationale**: Reuses existing filter state; no need to re-fetch or re-implement filter logic.

### D5: Section targeting
**Decision**: Before opening the swipe picker, the user picks a target section from a dropdown. Added songs are appended to that section's song list via a PUT to `/api/playlists/:id`.
**Rationale**: Sections are meaningful in this domain (Gathering, Word, etc.). Adding to a specific section requires the user to be intentional.

## Risks / Trade-offs

- **Large deck size** → Mitigation: Lazy-render; only top 3 cards in DOM at once.
- **Accidental adds from small swipe** → Mitigation: 80px threshold + visual "accept/reject" color overlay only appears once threshold is crossed.
- **Songs already in playlist shown again** → Mitigation: Filter out songs already in any section of the current playlist when building the deck.

## Open Questions

- Should the deck default to a "not recently used" filter, or start unfiltered? (Suggest: start with "not used in last 3 months" pre-applied, user can clear it.)
