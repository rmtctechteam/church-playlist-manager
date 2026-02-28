## MODIFIED Requirements

### Requirement: Home page with Bento Box grid layout
The application SHALL display a home page as the default landing view, featuring a Bento Box grid with large call-to-action cards for each major section of the app.

#### Scenario: Home page displayed on initial load
- **WHEN** the user navigates to the application root
- **THEN** the home page SHALL be displayed with a Bento Box grid containing cards in this order: "New Playlist", "View Playlists", and "All Songs"

#### Scenario: Bento card triggers New Playlist
- **WHEN** the user clicks the "New Playlist" bento card
- **THEN** the application SHALL open the new playlist creation flow (same as clicking the "+ New Playlist" button)

#### Scenario: Bento card navigates to View Playlists
- **WHEN** the user clicks the "View Playlists" bento card
- **THEN** the application SHALL navigate to the Service Playlists list view and hide the home page

#### Scenario: Bento card navigates to All Songs
- **WHEN** the user clicks the "All Songs" bento card
- **THEN** the application SHALL navigate to the Songs list view and hide the home page
