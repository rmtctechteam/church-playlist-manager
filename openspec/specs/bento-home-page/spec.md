## ADDED Requirements

### Requirement: Home page with Bento Box grid layout
The application SHALL display a home page as the default landing view, featuring a Bento Box grid with large call-to-action cards for each major section of the app.

#### Scenario: Home page displayed on initial load
- **WHEN** the user navigates to the application root
- **THEN** the home page SHALL be displayed with a Bento Box grid containing cards in this order: "Create Playlist", "List Playlists", and "All Songs"

#### Scenario: Bento card triggers Create Playlist
- **WHEN** the user clicks the "Create Playlist" bento card
- **THEN** the application SHALL open the new playlist creation flow (same as clicking the "+ New Playlist" button)

#### Scenario: Bento card navigates to List Playlists
- **WHEN** the user clicks the "List Playlists" bento card
- **THEN** the application SHALL navigate to the Service Playlists list view and hide the home page

#### Scenario: Bento card navigates to All Songs
- **WHEN** the user clicks the "All Songs" bento card
- **THEN** the application SHALL navigate to the Songs list view and hide the home page

### Requirement: Navigation back to home page
The application SHALL provide a way to return to the home page from any section view.

#### Scenario: User returns to home from a section
- **WHEN** the user clicks the application title or home link in the header
- **THEN** the application SHALL return to the home page view and hide the current section

### Requirement: Apple-inspired visual design
The application SHALL use an Apple-inspired design language with generous whitespace, large rounded corners, and clean typography across all views.

#### Scenario: Bento cards have visual presence
- **WHEN** the home page is displayed
- **THEN** each bento card SHALL have large rounded corners (16px+), generous padding, and a subtle gradient or distinct background color

#### Scenario: Global design tokens applied
- **WHEN** any view is displayed
- **THEN** the application SHALL use updated design tokens including larger border-radius values, increased heading font sizes, and ample whitespace
