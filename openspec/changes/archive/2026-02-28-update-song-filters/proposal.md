## Why

The current song filter labels ("Last Week", "Last Month", "Last 3 Months") don't make it clear what they filter by. Renaming them to include "Songs sung" gives immediate context. The addition of a "Songs Not Sung in Last 3 Months" option addresses a real worship planning need: identifying songs that have gone unused and may be worth revisiting.

## What Changes

- Rename filter option labels: "Last Week" → "Songs sung Last Week", "Last Month" → "Songs sung Last Month", "Last 3 Months" → "Songs sung Last 3 Months"
- Add new filter option: "Songs Not Sung in Last 3 Months" — shows songs with no playlist usage in the past 90 days

## Capabilities

### New Capabilities

### Modified Capabilities
- `song-list-filtering`: Updated filter labels and new "not sung" filter option added

## Impact

- `public/index.html` — filter `<select>` option text and new option value
- `public/app.js` — filter change handler to support the new "not sung" logic (invert the 90-day used set against all songs)
