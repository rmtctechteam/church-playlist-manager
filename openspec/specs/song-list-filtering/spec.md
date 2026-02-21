## ADDED Requirements

### Requirement: Filter songs by usage date range
The frontend SHALL provide a filter control that allows the user to filter the song list to only songs that have been added to a dated playlist within a selected time range. The available filter options SHALL be: All (default), Last Week, Last Month, and Last 3 Months.

#### Scenario: Default filter shows all songs
- **WHEN** the user navigates to the All Songs page
- **THEN** the filter is set to "All" and every song in the library is listed

#### Scenario: Filter by last week
- **WHEN** the user selects the "Last Week" filter
- **THEN** only songs that were added to a dated playlist within the last 7 days are displayed

#### Scenario: Filter by last month
- **WHEN** the user selects the "Last Month" filter
- **THEN** only songs that were added to a dated playlist within the last 30 days are displayed

#### Scenario: Filter by last 3 months
- **WHEN** the user selects the "Last 3 Months" filter
- **THEN** only songs that were added to a dated playlist within the last 90 days are displayed

#### Scenario: No songs match filter
- **WHEN** the user selects a date-range filter and no songs have usage within that range
- **THEN** the list shows an empty state message indicating no songs were used in that period

#### Scenario: Filter combined with search
- **WHEN** the user has both a search query and a date-range filter active
- **THEN** the list shows only songs matching both the search query and the date-range filter
