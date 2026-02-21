## Context

The app currently uses a header with tab buttons ("Service Playlists" / "Songs") to switch between views. All content renders inside a single `<main>` element with max-width 720px (1100px for editor). The playlist editor has a two-panel layout with a 300px sidebar for metadata and a flexible main area for song sections. Styling uses CSS custom properties with a teal color palette.

The user wants an Apple-inspired Bento Box grid home page with large call-to-action cards, and a more spacious playlist details header.

## Goals / Non-Goals

**Goals:**
- Create a home page with a Bento Box grid layout featuring large, visually distinct cards for "Service Playlists" and "Songs"
- Apply Apple-inspired design language: generous whitespace, large rounded corners, subtle gradients, clean SF-style typography
- Enlarge the playlist editor header section (name, date, theme, lessons) with bigger fonts and more breathing room
- Maintain all existing functionality — no backend changes, no feature additions

**Non-Goals:**
- No new pages or routes (this is a single-page app with JS-driven navigation)
- No responsive breakpoint overhaul beyond what exists
- No changes to the song detail, playlist display, or modal views
- No dark mode or theme switching

## Decisions

### 1. Home page as a new view state (not a separate HTML page)
Add a `#home-view` section in index.html. The existing tab-based navigation becomes secondary — the home page is shown by default, and clicking a bento card navigates to the appropriate section. A back/home link in the header allows returning to the home page.

**Rationale:** Keeps the single-page architecture intact. Adding a separate page would require routing changes and would break the current JS state management.

### 2. Bento grid using CSS Grid
Use a 2-column CSS Grid for the home page cards. Each card is a large rounded rectangle with an icon/emoji, title, and subtitle. Cards use `aspect-ratio` or min-height to maintain visual weight.

**Rationale:** CSS Grid is the natural fit for bento-style layouts. No JS layout library needed.

### 3. Apple-inspired design tokens
Update CSS custom properties to reflect Apple aesthetics:
- Larger border-radius (16-20px for cards, 12px for inputs)
- Subtle background gradients on bento cards
- Increased font sizes for headings (2rem+ for page titles)
- More whitespace in padding/margins
- Frosted glass-style header with `backdrop-filter: blur()`

**Rationale:** Achieves the requested Apple look via CSS-only changes to existing custom properties plus a few new ones.

### 4. Playlist editor header enlargement
Scale up the editor sidebar metadata section: larger heading font, more padding, bigger label text, and a card-based summary section with more visual prominence.

**Rationale:** Directly addresses the user request for "larger header and details." Keeps the existing two-panel layout structure.

## Risks / Trade-offs

- **Visual consistency**: Changing the design language significantly may create inconsistency with untouched views (song detail, display view). → Mitigation: Apply base-level design token updates (fonts, colors, radii) globally so all views inherit the refreshed look.
- **Mobile layout**: Bento grid cards need to stack on narrow screens. → Mitigation: Use `grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))` for responsive behavior.
- **Content shift**: Larger headers and spacing means more scrolling on the editor page. → Acceptable trade-off for improved readability.
