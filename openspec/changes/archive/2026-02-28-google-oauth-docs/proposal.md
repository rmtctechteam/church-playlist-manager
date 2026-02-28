## Why

The app is currently unprotected — anyone with the URL can create, edit, and delete playlists. The team also wants to generate Google Docs directly from playlists rather than downloading Word files. Google OAuth2 solves both problems at once: sign-in with a church Google account gates access to the app, and the same user credentials are used to create docs in that user's Google Drive.

## What Changes

- Add Google OAuth2 sign-in flow: unauthenticated users are redirected to Google, authenticated users get a session cookie
- Protect all API routes and the frontend with a session check middleware
- Add a "Create Google Doc" button to the playlist editor/display that calls a new API endpoint
- The endpoint uses the signed-in user's OAuth2 access token to create a Google Doc via the Google Docs API, populated with the same content as the existing Word export
- The created doc URL is saved back to the playlist's `googleDoc` field and returned to the frontend
- Allowlist of permitted Google email addresses (or a Workspace domain) configured via environment variable

## Capabilities

### New Capabilities
- `google-auth`: Google OAuth2 sign-in flow, session management, and route protection middleware
- `google-doc-creation`: Create a Google Doc from a playlist using the signed-in user's credentials; save the doc URL to the playlist

### Modified Capabilities
- `playlist-crud`: `googleDoc` field is now populated automatically on doc creation (previously manual entry only); `GET /api/playlists/:id` response includes the doc URL when set
- `playlist-export`: Existing Word export remains; Google Doc creation is an additional action, not a replacement

## Impact

- `package.json` — add `googleapis`, `express-session`, `cookie-parser`
- `src/auth.js` — **NEW** — OAuth2 client setup, login/callback/logout routes, session middleware, auth guard middleware
- `src/server.js` — mount auth routes before API routes; apply auth guard to all `/api/*` and static routes (except `/auth/*`)
- `src/routes/googleDocs.js` — **NEW** — `POST /api/playlists/:id/google-doc` endpoint
- `public/index.html` — add login page / redirect handling; show logged-in user info and logout button
- `public/app.js` — add "Create Google Doc" button; handle 401 responses by redirecting to login
- Environment variables: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL`, `GOOGLE_ALLOWED_DOMAIN` (or `GOOGLE_ALLOWED_EMAILS`), `SESSION_SECRET`
