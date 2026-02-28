## MODIFIED Requirements

### Requirement: Export playlist to document
The system SHALL provide two export options: download as a Word (.docx) file (existing behaviour) and create a Google Doc in the signed-in user's Drive (new). Both options SHALL produce equivalent content.

#### Scenario: Export as Word document
- **WHEN** the user clicks "Export Doc"
- **THEN** a .docx file is downloaded (unchanged from current behaviour)

#### Scenario: Export as Google Doc
- **WHEN** the user clicks "Create Google Doc"
- **THEN** a Google Doc is created in the user's Drive and the URL is shown as a link in the UI
