## 0. Prerequisites (manual setup — do before implementing)

- [x] 0.1 Create a Google Cloud project and enable the Google Docs API and Google Drive API
- [x] 0.2 Create OAuth2 credentials (Web Application type); add the callback URL (e.g., `http://localhost:3000/auth/callback` for dev, Railway URL for prod)
- [x] 0.3 Add `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL`, `SESSION_SECRET`, and `GOOGLE_ALLOWED_DOMAIN` (or `GOOGLE_ALLOWED_EMAILS`) to `.env` (local) and Railway environment variables

## 1. Dependencies

- [x] 1.1 Run `npm install googleapis express-session`

## 2. Auth Module

- [x] 2.1 Create `src/auth.js` — initialise the `google.auth.OAuth2` client from env vars; export `authClient`, `getAuthUrl()`, `getTokensFromCode(code)`, and `refreshAccessToken(session)`
- [x] 2.2 Add `GET /auth/login` route — redirects to Google OAuth2 consent screen (scopes: `openid email profile https://www.googleapis.com/auth/documents https://www.googleapis.com/auth/drive.file`)
- [x] 2.3 Add `GET /auth/callback` route — exchanges code for tokens, fetches user info (`oauth2.userinfo.get`), checks allowlist, stores `{email, name, picture, accessToken, refreshToken, expiresAt}` in session, redirects to `/`
- [x] 2.4 Add `GET /auth/logout` route — destroys session, redirects to `/login.html`
- [x] 2.5 Add `GET /auth/me` route — returns `{email, name, picture}` from session or 401
- [x] 2.6 Create `requireAuth` middleware — checks for valid session; for API requests (Accept: application/json or path starts with /api/) returns 401 JSON; for page requests redirects to `/login.html`

## 3. Server Wiring

- [x] 3.1 In `src/server.js`: add `express-session` middleware (before routes); mount auth routes at `/auth`; apply `requireAuth` to all `/api/*` routes and the static file handler (exempt `/login.html` and `/auth/*`)

## 4. Login Page

- [x] 4.1 Create `public/login.html` — minimal page with church branding, "Sign in with Google" button (links to `/auth/login`), and an error message area (reads `?error=access_denied` from query string)

## 5. App Header — User Info & Sign Out

- [x] 5.1 In `public/app.js` — on load, call `GET /auth/me` and display the user's name/picture in the app header with a "Sign out" link to `/auth/logout`
- [x] 5.2 Add a 401 response interceptor to `fetchSongs` / `fetch` calls — on receiving 401, redirect to `/login.html`
- [x] 5.3 Add user info and sign-out link HTML/CSS to `public/index.html` and `public/style.css`

## 6. Google Doc Creation Endpoint

- [x] 6.1 Create `src/routes/googleDocs.js` — `POST /api/playlists/:id/google-doc`:
  - Fetch the full resolved playlist (reuse store + resolveSongs)
  - Call `refreshAccessToken` if token is expired
  - Create a blank Google Doc via `docs.documents.create`
  - Build and send a `batchUpdate` request with `insertText` + `updateParagraphStyle` requests mirroring `buildDocContent` structure
  - Set sharing to "anyone with link can view" via `drive.permissions.create`
  - Save the doc URL to `playlist.googleDoc` via `playlistStore.update`
  - Return `{docUrl}`
- [x] 6.2 Mount the router in `src/server.js` at `/api`

## 7. Frontend — Create Google Doc Button

- [x] 7.1 Add a "Create Google Doc" button to the playlist editor bottom actions (next to "Export Doc") in `public/app.js`
- [x] 7.2 Wire the button: POST to `/api/playlists/:id/google-doc`, show loading state, on success update the Google Doc link in the UI; on failure show an error message
- [x] 7.3 After successful creation, refresh the playlist data so the new `googleDoc` URL is reflected in the editor and display views

## 8. Verification

- [x] 8.1 Run `npm test` — all existing tests pass (auth routes are unprotected in test env via `NODE_ENV=test` bypass)
- [x] 8.2 Locally: visit the app, confirm redirect to login page; sign in with an allowed Google account; confirm access to the app
- [x] 8.3 Try signing in with a disallowed account; confirm "Access denied" message
- [x] 8.4 Open a playlist, click "Create Google Doc"; confirm doc is created in Google Drive with correct content
- [x] 8.5 Confirm the doc URL is saved to the playlist and shown as a link
- [x] 8.6 Sign out and confirm session is cleared
