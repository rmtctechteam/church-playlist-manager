## 1. Global Design Token Updates

- [x] 1.1 Update CSS custom properties: increase `--radius` to 16px, add larger shadow variables, add new color variables for bento card gradients
- [x] 1.2 Update global typography: increase heading font sizes, add more whitespace to `body`, `main`, and `header` styles
- [x] 1.3 Update header to Apple-inspired style: frosted glass effect with `backdrop-filter`, make app title clickable to return home

## 2. Home Page Structure

- [x] 2.1 Add `#home-view` section to `index.html` with bento grid container and three cards in order: Create Playlist, List Playlists, All Songs
- [x] 2.2 Add bento grid CSS: 2-column CSS Grid layout, large card styling with rounded corners, gradients, icons/emoji, and hover effects
- [x] 2.3 Responsive bento grid: cards stack to single column on screens narrower than 640px

## 3. Home Page Navigation

- [x] 3.1 Update `app.js` to show `#home-view` by default on load (hide Songs and Playlists tabs initially)
- [x] 3.2 Add click handlers on bento cards to navigate to the corresponding section (hide home, show section); Create Playlist card triggers the new playlist flow
- [x] 3.3 Make the header app title a clickable link that returns to the home page from any view
- [x] 3.4 Update existing tab bar to work as secondary navigation within sections (or hide when on home page)

## 4. Playlist Editor Header Enlargement

- [x] 4.1 Increase playlist editor sidebar typography: larger playlist name heading, bigger form labels, more padding inside the sidebar form
- [x] 4.2 Enlarge the `editor-header-summary` section: bigger fonts for Date, Type, Theme, Lessons, more spacing
- [x] 4.3 Apply Apple-inspired card styling to the editor sidebar: increased border-radius, subtle shadow, generous internal spacing

## 5. Polish and Consistency

- [x] 5.1 Update button styles globally: larger border-radius, refined padding to match Apple aesthetic
- [x] 5.2 Update card styles (playlist cards, song items) with new border-radius and shadow tokens
- [x] 5.3 Verify all existing tests still pass
