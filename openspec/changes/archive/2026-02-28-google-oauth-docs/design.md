## Context

The app is a single Express server serving both the API and static frontend files. There is no current auth layer. The frontend is vanilla HTML/JS with no build step. The existing Word export (`buildDocContent` in `src/routes/playlists.js`) already structures playlist content correctly — the Google Doc endpoint will reuse this logic.

## Goals / Non-Goals

**Goals:**
- Protect the app so only authorised Google accounts can access it
- Create Google Docs from playlists using the signed-in user's Drive
- Save the resulting doc URL to the playlist for easy access
- Keep the existing Word export working alongside the new Google Doc option

**Non-Goals:**
- Fine-grained per-user permissions (all authenticated users have full access)
- Shared church Drive folder (docs go to the individual user's Drive; team can share manually)
- Offline/token refresh for long-running sessions (session expires, user re-signs in)
- Mobile OAuth flow differences

## Decisions

**`express-session` + in-memory session store**
Simple and sufficient for a small team. No database required for sessions. Sessions are lost on server restart (Railway deployments), requiring re-login — acceptable for this use case. If persistence becomes important, swap to a SQLite-backed session store later.

**Allowlist by Google Workspace domain**
`GOOGLE_ALLOWED_DOMAIN=yourdomain.org` restricts sign-in to accounts on the church's Google Workspace. Alternatively, `GOOGLE_ALLOWED_EMAILS` accepts a comma-separated list for non-Workspace setups. Both env vars checked at callback time.

**Auth routes at `/auth/*`, unprotected**
`GET /auth/login` → redirects to Google
`GET /auth/callback` → Google redirects back here; validates, creates session
`GET /auth/logout` → clears session
`GET /auth/me` → returns `{email, name, picture}` or 401

All other routes (API + static) require a valid session. A 401 from any API call triggers a frontend redirect to `/auth/login`.

**Frontend login page**
When unauthenticated, the server serves a minimal `/login.html` page with a "Sign in with Google" button. All other static files return 401 (redirected by JS). This avoids SPA complexity.

**Google Doc creation flow**
1. Frontend POSTs to `POST /api/playlists/:id/google-doc`
2. Server uses the session's stored access token to call Google Docs API (`documents.create` then `documents.batchUpdate` to insert content)
3. Shares the doc with `anyone with link can view` so other team members can open it
4. Saves the doc URL to `playlist.googleDoc` via `playlistStore.update`
5. Returns `{docUrl}` to the frontend

**Content mapping**
Reuse `buildDocContent` structure: playlist name (H1), date/theme/lessons, sections (H2), song title (H3), key/tempo/notes (italic), lyrics. Google Docs API uses `batchUpdate` with `insertText` and `updateParagraphStyle` requests — verbose but straightforward.

## Risks / Trade-offs

- **Access token expiry** — Google access tokens expire in 1 hour. If a user tries to create a doc after token expiry, the request will fail with a 401 from Google. Mitigation: use the refresh token stored in the session to obtain a new access token before calling the API. If no refresh token, prompt re-login.
- **Doc creation is slow** — Google Docs API `batchUpdate` with many text insertions can take 2–5 seconds for long playlists. The button should show a loading state.
- **Shared doc visibility** — Docs are created in the user's Drive. Other team members need the link. Setting `anyone with link can view` at creation time means the link works for anyone, not just church members — acceptable for a read-only doc link.
