## 1. HTML — Filter Labels and New Option

- [x] 1.1 In `public/index.html`, rename filter option text: `value="7"` → "Songs sung Last Week"
- [x] 1.2 In `public/index.html`, rename filter option text: `value="30"` → "Songs sung Last Month"
- [x] 1.3 In `public/index.html`, rename filter option text: `value="90"` → "Songs sung Last 3 Months"
- [x] 1.4 In `public/index.html`, add new `<option value="not-90">Songs Not Sung in Last 3 Months</option>` after the "Songs sung Last 3 Months" option

## 2. JS — Filter Handler

- [x] 2.1 In `public/app.js`, update the `songFilter` change handler to handle `value="not-90"`: fetch `/api/songs/used?since=<90-days-ago>`, then set `filteredSongIds` to all IDs in `allSongs` that are NOT in the returned set
