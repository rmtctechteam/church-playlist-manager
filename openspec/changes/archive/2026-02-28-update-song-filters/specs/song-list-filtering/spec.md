## MODIFIED Requirements

### Requirement: Filter songs by usage date range
The frontend SHALL provide a filter control that allows the user to filter the song list to only songs that have been added to a dated playlist within a selected time range, or to songs that have NOT been used within a time range. The available filter options SHALL be: All (default), Songs sung Last Week, Songs sung Last Month, Songs sung Last 3 Months, and Songs Not Sung in Last 3 Months.

#### Scenario: Default filter shows all songs
- **WHEN** the user navigates to the All Songs page
- **THEN** the filter is set to "All" and every song in the library is listed

#### Scenario: Filter by last week
- **WHEN** the user selects the "Songs sung Last Week" filter
- **THEN** only songs that were added to a dated playlist within the last 7 days are displayed

#### Scenario: Filter by last month
- **WHEN** the user selects the "Songs sung Last Month" filter
- **THEN** only songs that were added to a dated playlist within the last 30 days are displayed

#### Scenario: Filter by last 3 months
- **WHEN** the user selects the "Songs sung Last 3 Months" filter
- **THEN** only songs that were added to a dated playlist within the last 90 days are displayed

#### Scenario: Filter by not sung in last 3 months
- **WHEN** the user selects the "Songs Not Sung in Last 3 Months" filter
- **THEN** only songs that have NOT been added to a dated playlist in the last 90 days are displayed

#### Scenario: No songs match filter
- **WHEN** the user selects a filter and no songs match the criteria
- **THEN** the list shows an empty state message indicating no songs matched

#### Scenario: Filter combined with search
- **WHEN** the user has both a search query and a filter active
- **THEN** the list shows only songs matching both the search query and the filter
