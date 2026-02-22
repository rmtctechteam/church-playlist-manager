## ADDED Requirements

### Requirement: Userback widget loaded on all pages
The app SHALL load the Userback feedback widget on every page by including the Userback JavaScript snippet in `public/index.html`.

#### Scenario: Widget script is present in HTML
- **WHEN** a user loads any page of the app
- **THEN** the Userback widget script (`https://static.userback.io/widget/v1.js`) is loaded asynchronously and the feedback widget is available

#### Scenario: App functions normally if Userback is unavailable
- **WHEN** the Userback CDN is unreachable
- **THEN** the app continues to function normally with no errors affecting core functionality
