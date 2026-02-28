## ADDED Requirements

### Requirement: Create a Google Doc from a playlist
The app SHALL allow a signed-in user to create a Google Doc in their own Google Drive containing the full playlist content. The created doc URL SHALL be saved to the playlist and displayed as a clickable link.

#### Scenario: Create doc from playlist editor
- **WHEN** a signed-in user clicks "Create Google Doc" on a playlist
- **THEN** the server creates a Google Doc using the user's OAuth2 credentials, populates it with the playlist name, date, theme, bible lessons, and all sections with songs (including key, tempo, notes, and lyrics), and returns the doc URL

#### Scenario: Doc URL saved to playlist
- **WHEN** a Google Doc is successfully created
- **THEN** the doc URL is saved to the playlist's `googleDoc` field and shown as a clickable link in both the editor and display views

#### Scenario: Doc is link-shareable
- **WHEN** the Google Doc is created
- **THEN** it is set to "anyone with the link can view" so other team members can open it without needing individual sharing

#### Scenario: Doc creation fails due to expired token
- **WHEN** the user's OAuth2 access token has expired
- **THEN** the server attempts to refresh it automatically; if refresh fails, the API responds with a message prompting the user to sign in again

#### Scenario: Button shows loading state
- **WHEN** the user clicks "Create Google Doc" and the request is in progress
- **THEN** the button is disabled and shows a loading indicator until the request completes or fails

### Requirement: Google Doc content mirrors Word export
The Google Doc content SHALL match the structure of the existing Word export: playlist name as title, date/theme/lessons as metadata, sections as headings, song title/key/tempo/notes, and full lyrics.

#### Scenario: Doc content matches playlist
- **WHEN** a Google Doc is created for a playlist
- **THEN** the document contains all sections, all songs in order, with effective key/tempo/notes (playlist overrides if set, master values otherwise), and full song lyrics
