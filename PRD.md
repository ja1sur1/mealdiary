# Product Requirements Document

## Product Name
Diet and Symptoms Tracker

## Document Purpose
This document defines the requirements for a web app that helps a user quickly log meals, daily symptoms, and medications, receive a daily reminder to log, and analyze patterns over time to understand which foods may be linked to specific health symptoms.

## Assumption
This PRD assumes "email/meail" means "meal."

## Problem Statement
It is difficult to reliably remember what was eaten, what symptoms occurred, and what medication was taken across days and weeks. Without structured daily logging, it is hard to identify possible links between specific foods and symptoms such as headache, nausea, or bloating.

## Product Vision
Build a lightweight web app that makes daily food and symptom logging fast and low-friction, while generating useful monthly insights about:
- which foods or food characteristics may be associated with specific symptoms
- how often certain symptoms occur
- how often certain medications are taken

## Goals
- Make meal and symptom logging easy enough to do every day.
- Capture enough structured detail to support later analysis.
- Help the user identify likely food triggers and symptom trends over a monthly period.
- Provide simple visual summaries and correlations without requiring manual spreadsheet work.

## Non-Goals
- Medical diagnosis or treatment recommendations
- Replacing professional medical advice
- Advanced nutrition tracking such as calories, macros, or micronutrients in the first version
- Multi-user collaboration in the first version

## Target User
- A person who wants to understand whether specific foods, food qualities, or eating habits are related to recurring symptoms
- A user who wants fast daily entry on mobile or desktop
- A user who values simple monthly summaries over complex analytics

## Core User Jobs To Be Done
- "When I eat a meal, I want to log it in under a minute so I can consistently keep records."
- "At the end of the day, I want to log my symptoms and medications so I can track how I felt."
- "At the end of the month, I want to see which foods or food characteristics are most likely related to which symptoms."
- "I want a daily reminder so I do not forget to log my meals and symptoms."

## User Stories
- As a user, I want to log each meal with the food name, source, place, food characteristics, and time eaten.
- As a user, I want to classify each meal as breakfast, lunch, dinner, or other.
- As a user, I want to log multiple symptoms in one day.
- As a user, I want to rate the severity of each symptom from 1 to 5.
- As a user, I want to record what medication I took for a symptom.
- As a user, I want recent foods, locations, symptoms, and medications to be easy to reselect for faster entry.
- As a user, I want to view monthly summaries showing symptom frequency, medication frequency, and possible food-symptom relationships.
- As a user, I want to receive a daily text reminder at 9:00 PM so I remember to log my meals and symptoms.

## Functional Requirements

### 1. Meal Logging
The app must allow the user to create a meal entry with the following fields:
- meal date
- meal time
- meal type: `Breakfast`, `Lunch`, `Dinner`, or `Other`
- food name
- meal source: `Home Cooked` or `Outside`
- outside location or restaurant name if source is `Outside`
- food characteristics:
  - spiciness
  - heaviness
  - oiliness
  - optional additional tags such as dairy, gluten, fried, sugary, caffeine, fermented, acidic, or portion size
- optional notes

Additional requirements:
- The user must be able to log multiple foods in one meal if needed.
- A meal should support multiple food items by default.
- Meal type is required.
- The app should support quick-select suggestions from previous entries.
- The app should minimize typing through dropdowns, chips, recent items, or autocomplete.

### 2. Daily Symptom Logging
The app must allow the user to log one or more symptoms for a given day.

Each symptom entry must include:
- symptom name
- severity score from 1 to 5, where 5 is worst
- medication taken for that symptom, if any
- optional notes

Additional requirements:
- The user must be able to log multiple symptoms in the same day.
- The user should be able to log no symptoms for a day.
- Symptom logging is tied to the day only and does not require a time of day.
- The app should allow quick selection of common symptoms such as headache, nausea, bloating, acidity, stomach pain, fatigue, or diarrhea, while also allowing custom symptoms.
- The app should allow quick selection of previously used medications, while also allowing custom medication names.
- The app should include common medication suggestions such as Advil, Tylenol, Nurtec, Omeprazole, Famotidine, and Tums.
- Medication should only be required when the user indicates they took one.

### 3. Daily Logging Experience
- The app should offer a fast daily workflow with minimal screens and form friction.
- The app should support mobile-first entry since logging may happen throughout the day.
- The app should show a daily timeline or summary of logged meals and symptoms.
- The app should allow editing or deleting entries later.
- The app should support saving incomplete entries temporarily if the user is interrupted.

### 4. Daily Reminder Experience
- The app should allow the user to opt in to SMS reminders.
- The app should collect a phone number for SMS reminders.
- The app should send one daily reminder at 9:00 PM in the user's local timezone.
- The reminder should prompt the user to log meals and symptoms.
- The user should be able to turn reminders on or off.

### 5. Monthly Analytics
The app must provide a monthly analysis view that includes:
- frequency of each meal type
- frequency of each symptom
- average severity of each symptom
- frequency of each medication taken
- most commonly eaten foods
- most common food characteristics
- likely associations between foods or food characteristics and symptoms

Example analyses:
- Foods most commonly eaten before headache days
- Foods tagged as oily or spicy most often associated with nausea or bloating
- Number of breakfasts, lunches, dinners, and other meals in the last 30 days
- Number of days with bloating in the last 30 days
- Number of times a given medication was taken in the last 30 days

### 6. Correlation Logic
For the first version, the app should use simple heuristic analysis rather than medical-grade causal modeling.

Suggested logic:
- Analyze possible associations using the previous 1 month of logged meals and symptom entries.
- Rank foods and food tags by how often they appear during months with symptom occurrences compared with periods in that same month without those symptoms.
- Clearly label results as "possible associations" or "patterns" rather than causes.

## Data Model

### Meal
- id
- date
- time
- meal_type
- foods: one or more food items
- source
- outside_location
- notes
- created_at
- updated_at

### Food Item
- id
- meal_id
- name
- tags

### Symptom Log
- id
- date
- symptom_name
- severity
- medication_name (optional)
- notes
- created_at
- updated_at

### Reminder Settings
- id
- phone_number
- timezone
- sms_enabled
- daily_reminder_time
- created_at
- updated_at

## Recommended Field Design

### Food Characteristics
Use tag-based categorization to keep logging fast and flexible.

Recommended tags:
- spicy
- mild
- heavy
- light
- oily
- non-oily
- dairy
- gluten
- fried
- sugary
- caffeine
- fermented
- acidic
- large portion

Users should be able to apply multiple tags to the same food item and add custom tags if needed.

### Symptom Severity
- `1` = very mild
- `2` = mild
- `3` = moderate
- `4` = severe
- `5` = very severe

### Common Medication Suggestions
- Advil
- Tylenol
- Nurtec
- Omeprazole
- Famotidine
- Tums

## UX Requirements
- A meal should be loggable in under 30 to 45 seconds for a repeat user.
- A symptom entry should be loggable in under 20 to 30 seconds.
- Recent entries should be reusable.
- The app should default to the current date and time.
- The reminder setup flow should take under 1 minute.
- Conditional fields should reduce clutter, for example only showing `Where did you eat it?` when `Outside` is selected.
- Forms should work smoothly on mobile and desktop.
- The monthly insights page should be easy to understand for a non-technical user.

## Reporting and Insights
The analytics experience should answer:
- How often am I logging breakfast, lunch, dinner, or other meals?
- Which foods appear most often before each symptom?
- Which food tags or characteristics are most commonly linked with symptoms?
- Which symptoms happen most often?
- On how many days per month does each symptom occur?
- Which medications are used most often?
- Are there clear trends by meal time, such as late-night meals and symptoms?

Suggested visualizations:
- bar chart for meal type frequency
- bar chart for symptom frequency
- bar chart for medication frequency
- ranked list of likely food triggers by symptom
- heatmap of food characteristics versus symptoms
- calendar view of symptom days

## Success Metrics
- Daily logging completion rate
- SMS reminder opt-in rate
- Daily reminder delivery success rate
- Average time to log a meal
- Average time to log symptoms for a day
- Number of days logged per month
- Percentage of entries using quick-select or autocomplete
- User-reported usefulness of monthly insights

## MVP Scope
Include in MVP:
- user can log meals
- user can log daily symptoms and medications
- user can classify meals by breakfast, lunch, dinner, or other
- user can edit past entries
- user can opt in to a daily 9:00 PM SMS reminder
- user can view monthly summaries
- user can see simple food-to-symptom pattern analysis
- mobile-friendly responsive UI

Exclude from MVP:
- wearable integrations
- barcode scanning
- calorie tracking
- photo-based meal recognition
- AI-generated health advice
- multi-user accounts with sharing

## Risks and Considerations
- Correlation does not equal causation; insights must be framed carefully.
- Users may skip logging if forms are too detailed.
- Users may describe the same food or symptom in inconsistent ways unless suggestions and normalization are built in.
- Delayed symptoms may weaken simple same-day analysis.

## Future Enhancements
- more customizable reminders for meal and symptom logging
- recurring meal templates
- voice input
- photo attachments
- export to CSV or PDF
- doctor-friendly summary reports
- stronger analysis across multiple months
- personalized trigger detection based on lag windows

## Product Decisions
- Symptom logging is tied to a date only, not a time of day.
- A meal supports multiple food items by default.
- Meal type is required and uses breakfast, lunch, dinner, or other.
- Medication is only required when the user indicates they took one.
- Food characteristics use tag-based categorization.
- Food-symptom association analysis should use the previous 1 month of logged data.
- The app includes one daily SMS reminder at 9:00 PM in the user's local timezone.

## Suggested MVP Screens
- Home dashboard
- Quick add meal
- Quick add daily symptoms
- Daily timeline view
- Monthly insights dashboard
- History/edit entry screen
- Reminder settings screen

## Suggested Product Principle
Fast logging first, analysis second. If data entry is not easy, the user will not build the dataset needed for meaningful insights.
