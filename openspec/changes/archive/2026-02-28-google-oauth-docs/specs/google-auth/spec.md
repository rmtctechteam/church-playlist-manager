## ADDED Requirements

### Requirement: Google OAuth2 sign-in
The app SHALL require users to sign in with a Google account before accessing any functionality. Unauthenticated requests to protected routes SHALL redirect to a login page. Only accounts matching the configured allowlist (Google Workspace domain or explicit email list) SHALL be permitted.

#### Scenario: Unauthenticated user visits the app
- **WHEN** a user visits the app without a valid session
- **THEN** they are shown a login page with a "Sign in with Google" button

#### Scenario: Successful sign-in
- **WHEN** a user clicks "Sign in with Google" and completes the Google OAuth2 flow with an allowed account
- **THEN** a session is created, the user is redirected to the main app, and their name and email are visible in the UI

#### Scenario: Sign-in with disallowed account
- **WHEN** a user completes the Google OAuth2 flow with an account not on the allowlist
- **THEN** the session is not created and the user sees an "Access denied" message on the login page

#### Scenario: Unauthenticated API request
- **WHEN** the frontend makes an API request without a valid session
- **THEN** the API responds with HTTP 401

#### Scenario: Sign out
- **WHEN** a signed-in user clicks "Sign out"
- **THEN** their session is cleared and they are returned to the login page

### Requirement: Auth configuration via environment variables
The auth system SHALL be configured entirely through environment variables, with no credentials stored in code or committed to the repository.

#### Scenario: Required environment variables
- **WHEN** the server starts
- **THEN** it reads `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL`, and `SESSION_SECRET` from environment variables; if any are missing the server logs a warning

#### Scenario: Domain-based allowlist
- **WHEN** `GOOGLE_ALLOWED_DOMAIN` is set (e.g., `church.org`)
- **THEN** only Google accounts with that email domain are permitted to sign in

#### Scenario: Email-based allowlist
- **WHEN** `GOOGLE_ALLOWED_EMAILS` is set (e.g., `alice@gmail.com,bob@gmail.com`)
- **THEN** only those specific email addresses are permitted to sign in
