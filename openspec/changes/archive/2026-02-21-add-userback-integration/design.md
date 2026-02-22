## Context

The app is a single-page application served from `public/index.html`. There are no other HTML pages — all views are rendered client-side via `app.js`. Adding the Userback snippet once to `index.html` covers the entire app.

## Goals / Non-Goals

**Goals:**
- Load the Userback feedback widget on every page of the app
- Use the exact snippet provided by Userback

**Non-Goals:**
- Server-side Userback API integration
- Environment-specific token management (token is public/client-side safe)
- Conditional loading per page or user role

## Decisions

### Place snippet just before `</body>`
The Userback snippet uses `async` script loading, so placement before `</body>` is equivalent to `<head>` for load performance. Placing it last keeps the head clean and follows the existing pattern (app.js is also loaded before `</body>`).

### Commit the access token directly
Userback access tokens are public client-side identifiers — they appear in every user's browser and are not secret. Committing directly avoids unnecessary environment variable complexity for a frontend-only integration.

## Risks / Trade-offs

- **None significant** — this is a one-line HTML change with an async external script load. If Userback's CDN is unavailable, the widget simply doesn't load; the app is unaffected.

## Open Questions

- None.
