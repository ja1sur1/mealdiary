# Technical Specification

## Product
Diet and Symptoms Tracker

## Purpose
This document translates the PRD into a build-ready technical plan for an MVP web application that supports:
- fast meal logging
- daily symptom and medication logging
- monthly trend analysis
- simple food-to-symptom association reporting
- a daily SMS reminder to log meals and symptoms

## Scope
This technical spec covers:
- system architecture
- frontend application behavior
- backend API design
- analytics logic
- validation rules
- non-functional requirements

## Recommended MVP Stack
This is a recommendation, not a final requirement.

- Frontend: `Next.js` with App Router
- Backend: `Next.js` server actions for mutations and route handlers for reads where helpful
- Database: `PostgreSQL`
- ORM: `Prisma`
- Auth: `Auth.js` or equivalent email/password or magic-link auth
- Notifications: SMS provider such as `Twilio`
- Scheduling: cron job or hosted scheduler
- Charts: `Recharts` or `Chart.js`
- Hosting: `Vercel` for app, managed Postgres for database

## Primary Product Principles
- Logging should be faster than analysis.
- Most actions should be possible in 1 to 2 taps/clicks after opening the relevant screen.
- The UI should optimize for repeat entry through recent items, suggestions, and defaults.
- Analytics should present possible associations, not medical conclusions.

## User Roles

### 1. Single End User
The MVP assumes a single-user experience model, even if the app technically supports multiple accounts later.

Capabilities:
- create and manage their own meal logs
- create and manage daily symptom logs
- view their own monthly analytics

## Core Flows

### 1. Log a Meal
1. User opens quick add meal form.
2. Date defaults to today.
3. Time defaults to current time.
4. User selects `Home Cooked` or `Outside`.
5. User selects meal type: `Breakfast`, `Lunch`, `Dinner`, or `Other`.
6. If `Outside`, user enters or selects location.
7. User adds one or more food items.
8. For each food item, user enters food name and selects tags.
9. User optionally adds notes.
10. User saves meal.
11. App returns user to daily timeline or keeps quick-add open for another entry.

### 2. Log Daily Symptoms
1. User opens daily symptom entry.
2. Date defaults to today.
3. User adds one or more symptoms.
4. For each symptom, user selects symptom name, severity, and optional medication.
5. User optionally adds notes.
6. User saves symptom log.
7. App updates daily timeline and monthly aggregates.

### 3. Edit Past Entry
1. User opens history or daily timeline.
2. User selects a meal or symptom entry.
3. User updates fields.
4. User saves changes.
5. App recalculates any affected analytics.

### 4. View Monthly Insights
1. User opens insights dashboard.
2. User selects a month.
3. App fetches meal, symptom, medication, and aggregate analytics for that month.
4. User reviews charts, rankings, and calendar views.

### 5. Configure SMS Reminders
1. User opens settings.
2. User enters a phone number.
3. User enables SMS reminders.
4. App stores a fixed reminder schedule of 9:00 PM in the user's local timezone.
5. A scheduled job sends one reminder text each day.

## Information Architecture

### Pages
- `/`
  Daily dashboard with today summary and quick actions
- `/meals/new`
  Quick meal entry
- `/symptoms/new`
  Daily symptom entry
- `/history`
  Search, browse, edit, and delete past entries
- `/insights`
  Monthly analytics dashboard
- `/settings`
  Reminder setup, phone number management, and future account settings

## Frontend Requirements

### Shared UX Behavior
- Default date should be today in local timezone.
- Default meal time should be current local time.
- Reuse recent items for food names, locations, symptoms, and medications.
- Use chips or pill selectors for food tags.
- Use inline validation with minimal blocking.
- Use mobile-first layout.

### Meal Entry UI
Fields:
- date
- time
- source
- meal type
- outside location, conditionally visible
- repeating list of food items
- per-food tags
- notes

Behavior:
- meal form starts with one food row visible
- user can add more food rows
- user can remove food rows before save
- meal type is required
- outside location is hidden unless source is `Outside`
- recent foods and locations appear as suggestions

### Symptom Entry UI
Fields:
- date
- repeating list of symptom entries
- symptom name
- severity 1-5
- medication taken toggle or checkbox
- medication name, conditionally visible
- notes

Behavior:
- symptom logging is date-based only
- user can add multiple symptoms for a single day
- medication field only appears when user indicates they took medication
- common medications appear as quick-select chips:
  - Advil
  - Tylenol
  - Nurtec
  - Omeprazole
  - Famotidine
  - Tums

### History UI
Capabilities:
- filter by date range
- filter by meals vs symptoms
- edit entry
- delete entry with confirmation
- view grouped daily timeline

### Insights UI
Modules:
- meal type frequency chart
- symptom frequency chart
- average severity by symptom
- medication frequency chart
- most common foods
- most common tags
- likely food associations by symptom
- calendar of symptom days

### Settings UI
Fields:
- phone number
- timezone
- SMS reminder toggle
- fixed reminder schedule preview

Behavior:
- user can enable or disable reminders
- reminder schedule is fixed to 9:00 PM local time for MVP
- phone number is required when reminders are enabled

## Backend Architecture

### Application Layers
- UI layer for forms, lists, charts, navigation
- server layer for validation, persistence, and aggregation
- database layer for normalized relational storage
- analytics layer for monthly rollups and association queries
- reminder layer for scheduled SMS delivery

### Server Responsibilities
- validate all input payloads
- persist meals, food items, symptoms, and medications
- normalize user-entered names for reuse suggestions
- fetch daily timeline data
- generate monthly analytics responses
- manage reminder settings and phone numbers
- schedule and record SMS reminder delivery

## API Design
Mutations should use `Next.js` server actions. Read endpoints can use route handlers where useful for charts, filtering, or client-side refreshes. The resource model below is the important part.

### Meals

#### `POST /api/meals`
Creates a meal with one or more food items.

Request shape:
```json
{
  "date": "2026-04-03",
  "time": "13:10",
  "source": "OUTSIDE",
  "mealType": "LUNCH",
  "outsideLocation": "Sweetgreen",
  "notes": "Felt very full after lunch",
  "foods": [
    {
      "name": "Spicy chicken bowl",
      "tags": ["spicy", "heavy", "oily"]
    },
    {
      "name": "Iced tea",
      "tags": ["caffeine"]
    }
  ]
}
```

#### `GET /api/meals`
Returns meals for a date or range.

Suggested query params:
- `date`
- `from`
- `to`

#### `PATCH /api/meals/:id`
Updates a meal and its nested food items.

#### `DELETE /api/meals/:id`
Deletes a meal and its nested food items.

### Symptoms

#### `POST /api/symptoms`
Creates one daily symptom submission containing one or more symptom entries.

Request shape:
```json
{
  "date": "2026-04-03",
  "symptoms": [
    {
      "name": "Headache",
      "severity": 4,
      "medicationTaken": true,
      "medicationName": "Tylenol",
      "notes": "Started in the evening"
    },
    {
      "name": "Bloating",
      "severity": 3,
      "medicationTaken": false,
      "medicationName": null,
      "notes": ""
    }
  ]
}
```

#### `GET /api/symptoms`
Returns symptom entries for a date or range.

#### `PATCH /api/symptoms/:id`
Updates a symptom entry.

#### `DELETE /api/symptoms/:id`
Deletes a symptom entry.

### Insights

#### `GET /api/insights/monthly?month=2026-04`
Returns aggregated analytics for one month.

Response modules:
- symptom counts
- symptom average severity
- medication counts
- food counts
- tag counts
- symptom calendar
- association rankings by symptom

### Suggestions

#### `GET /api/suggestions`
Returns recent and frequent values for:
- foods
- locations
- symptoms
- medications
- food tags

### Reminders

#### `GET /api/reminders/settings`
Returns the user's reminder settings.

#### `PUT /api/reminders/settings`
Creates or updates reminder preferences.

Request shape:
```json
{
  "phoneNumber": "+14155550123",
  "timezone": "America/Los_Angeles",
  "smsEnabled": true
}
```

Behavior:
- when `smsEnabled` is true, a reminder is sent at 9:00 PM local time
- when `smsEnabled` is false, reminder messages are not sent

## Validation Rules

### Meal Validation
- `date` is required
- `time` is required
- `source` must be `HOME_COOKED` or `OUTSIDE`
- `mealType` must be `BREAKFAST`, `LUNCH`, `DINNER`, or `OTHER`
- `outsideLocation` is required when source is `OUTSIDE`
- at least one food item is required
- each food item must have a non-empty `name`
- food tags are optional, but if present must be strings from allowed defaults or custom values

### Symptom Validation
- `date` is required
- at least one symptom entry is required when saving a symptom log
- symptom `name` is required
- `severity` must be an integer from 1 to 5
- `medicationName` is optional
- if `medicationTaken = true`, `medicationName` should be required

### Reminder Validation
- `phoneNumber` is required when SMS reminders are enabled
- `timezone` is required when SMS reminders are enabled
- phone numbers should be stored in normalized E.164 format when possible
- reminder send times are fixed for MVP and are not user-editable

## Suggested Normalization Rules
- Trim leading and trailing whitespace on all names.
- Store a display value and a normalized value for reusable suggestions.
- Normalize case for analytics and suggestion matching.

Examples:
- `tylenol` and `Tylenol` should count as the same medication
- `sweetgreen` and `Sweetgreen` should count as the same outside location

## Analytics Specification

### Time Window
- Default analytics window is one selected calendar month.
- All rankings and frequencies are computed from data within that month.

### Monthly Metrics

#### Symptom Frequency
Definition:
- Number of symptom entries for each symptom name in the selected month

#### Symptom Day Count
Definition:
- Number of distinct dates on which a symptom occurred in the selected month

#### Average Symptom Severity
Definition:
- Average of all severity values per symptom for the selected month

#### Medication Frequency
Definition:
- Number of times each medication was recorded in the selected month

#### Food Frequency
Definition:
- Number of times each food item was logged in the selected month

#### Meal Type Frequency
Definition:
- Number of meals logged as breakfast, lunch, dinner, or other in the selected month

#### Tag Frequency
Definition:
- Number of times each food tag was attached to a logged food item in the selected month

### Association Heuristic
The MVP should avoid overcomplicated modeling. Use a simple ranking heuristic.

For each symptom in the selected month:
1. Collect all dates where the symptom occurred.
2. Collect all foods and tags logged on those dates.
3. Count how often each food and tag appears on symptom dates.
4. Compare that with how often the same food or tag appears on dates in the same month where the symptom did not occur.
5. Produce a ranked list of foods and tags with:
   - symptom-date count
   - non-symptom-date count
   - simple association score

Suggested simple score:
```text
association_score = (symptom_date_rate - non_symptom_date_rate)
```

Where:
- `symptom_date_rate = food_or_tag_count_on_symptom_dates / number_of_symptom_dates`
- `non_symptom_date_rate = food_or_tag_count_on_non_symptom_dates / number_of_non_symptom_dates`

This is intentionally heuristic and should be labeled as:
- possible associations
- observed patterns

Not:
- causes
- triggers with certainty

### Missing Data Considerations
- If a day has symptom logs but no meals, do not infer food absence as protective.
- If a day has meals but no symptom logs, treat it as a non-symptom day only if the user explicitly logged that day or the product later adds a “no symptoms today” marker.
- The MVP may show a note when there is insufficient data density for strong insights.

## Derived Views and Aggregates
The system should compute analytics live for MVP. If performance becomes an issue later, add materialized monthly summary tables.

Possible future aggregate tables:
- monthly_symptom_summary
- monthly_medication_summary
- monthly_food_summary
- monthly_tag_summary
- monthly_meal_type_summary

## Reminder Delivery Specification

### Reminder Purpose
Reminder texts prompt the user to log meals and symptoms consistently throughout the day.

### Fixed Daily Schedule
- 9:00 PM local time

### Suggested Reminder Message
- "Reminder: log your meals and symptoms in Diet and Symptoms Tracker."

### Scheduling Logic
- reminders are sent based on the user's saved timezone
- only users with SMS reminders enabled should receive messages
- delivery attempts should be logged for debugging and audit purposes

### Delivery Failure Handling
- failed sends should be recorded with provider response details when available
- provider failures should not block the rest of the application
- retry behavior can be added later, but is not required for MVP

## Security and Privacy
- All data must be scoped to the signed-in user.
- The app should not expose one user’s health logs to another user.
- Use HTTPS in production.
- Treat symptom and medication logs as sensitive personal data.
- Treat phone numbers as sensitive personal data.

## Non-Functional Requirements

### Performance
- dashboard loads in under 2 seconds for normal monthly datasets
- save actions should feel near-instant, ideally under 500 ms server time

### Reliability
- no partial meal save without food items
- nested writes must be transactional

### Accessibility
- keyboard-navigable forms
- clear labels for all inputs
- sufficient color contrast in charts and status states

### Responsiveness
- optimized for mobile widths first
- desktop should support side-by-side analytics panels

## Error Handling
- Show inline errors for invalid fields.
- Preserve entered data on validation failure.
- Show non-blocking toast or banner on successful save.
- Confirm destructive actions like delete.

## Implementation Milestones

### Milestone 1
- app scaffold
- auth
- database schema
- seed presets for symptoms, medications, and tags
- reminder settings model and SMS provider setup

### Milestone 2
- meal logging
- symptom logging
- daily dashboard
- history and editing
- settings page for reminder opt-in

### Milestone 3
- monthly analytics queries
- charts and rankings
- data-quality messaging
- daily SMS reminder job and delivery logging

### Milestone 4
- polish
- mobile QA
- accessibility checks
- seed/demo data

## Open Technical Choices
## Technical Decisions
- Use `Next.js` server actions for mutations.
- Compute analytics live for MVP.
- Phone verification is not required before enabling reminders.
- Store preset tags, symptom names, and similar reusable presets in database tables.
