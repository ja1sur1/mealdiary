# Database Schema

## Overview
This schema is designed for:
- normalized storage
- fast month-based analytics
- low-friction data entry with reusable suggestions

The model below assumes PostgreSQL and Prisma-friendly naming.

## Design Principles
- Separate meals from food items because one meal contains many foods.
- Separate daily symptom submissions from individual symptom entries so one date can have multiple symptoms.
- Preserve freeform input while supporting normalization for analytics.
- Keep medications optional.
- Store reminder preferences separately from meal and symptom data.
- Store timezone data so reminder scheduling uses the correct local time.

## Entity Relationship Summary
- one `user` has many `meals`
- one `meal` has many `food_items`
- one `user` has many `daily_symptom_logs`
- one `daily_symptom_log` has many `symptom_entries`
- one `food_item` has many `food_item_tags`

## Tables

### `users`
Stores account ownership.

| Column | Type | Null | Notes |
|---|---|---|---|
| `id` | `uuid` | no | primary key |
| `email` | `text` | no | unique |
| `name` | `text` | yes | optional |
| `phone_number` | `text` | yes | normalized phone number |
| `phone_number_verified_at` | `timestamptz` | yes | optional for future verification |
| `timezone` | `text` | no | IANA timezone such as `America/Los_Angeles` |
| `created_at` | `timestamptz` | no | default now |
| `updated_at` | `timestamptz` | no | default now |

Indexes:
- unique index on `email`
- index on `phone_number`

### `meals`
Stores a meal event for a user.

| Column | Type | Null | Notes |
|---|---|---|---|
| `id` | `uuid` | no | primary key |
| `user_id` | `uuid` | no | foreign key to `users.id` |
| `meal_date` | `date` | no | local date of meal |
| `meal_time` | `time` | no | local time of meal |
| `source` | `meal_source` | no | enum |
| `meal_type` | `meal_type` | no | enum |
| `outside_location` | `text` | yes | required when source is outside |
| `outside_location_normalized` | `text` | yes | lowercased normalized value |
| `notes` | `text` | yes | optional |
| `created_at` | `timestamptz` | no | default now |
| `updated_at` | `timestamptz` | no | default now |

Enum:
```text
meal_source = HOME_COOKED | OUTSIDE
meal_type = BREAKFAST | LUNCH | DINNER | OTHER
```

Indexes:
- index on `(user_id, meal_date)`
- index on `(user_id, meal_date, meal_time)`
- index on `(user_id, meal_type, meal_date)`
- index on `(user_id, outside_location_normalized)`

### `food_items`
Stores each food item inside a meal.

| Column | Type | Null | Notes |
|---|---|---|---|
| `id` | `uuid` | no | primary key |
| `meal_id` | `uuid` | no | foreign key to `meals.id` |
| `name` | `text` | no | user-facing name |
| `name_normalized` | `text` | no | normalized for suggestions and analytics |
| `sort_order` | `integer` | no | display order within meal |
| `created_at` | `timestamptz` | no | default now |
| `updated_at` | `timestamptz` | no | default now |

Indexes:
- index on `(meal_id, sort_order)`
- index on `(name_normalized)`

### `food_item_tags`
Stores zero or more tags attached to each food item.

| Column | Type | Null | Notes |
|---|---|---|---|
| `id` | `uuid` | no | primary key |
| `food_item_id` | `uuid` | no | foreign key to `food_items.id` |
| `tag` | `text` | no | display tag |
| `tag_normalized` | `text` | no | normalized tag |
| `created_at` | `timestamptz` | no | default now |

Indexes:
- index on `(food_item_id)`
- index on `(tag_normalized)`
- unique index on `(food_item_id, tag_normalized)`

### `daily_symptom_logs`
Stores one top-level symptom submission per day per user.

| Column | Type | Null | Notes |
|---|---|---|---|
| `id` | `uuid` | no | primary key |
| `user_id` | `uuid` | no | foreign key to `users.id` |
| `log_date` | `date` | no | symptom date |
| `notes` | `text` | yes | optional day-level notes |
| `created_at` | `timestamptz` | no | default now |
| `updated_at` | `timestamptz` | no | default now |

Indexes:
- unique index on `(user_id, log_date)`
- index on `(user_id, log_date)`

### `reminder_settings`
Stores SMS reminder preferences for each user.

| Column | Type | Null | Notes |
|---|---|---|---|
| `id` | `uuid` | no | primary key |
| `user_id` | `uuid` | no | foreign key to `users.id` |
| `sms_enabled` | `boolean` | no | default false |
| `phone_number` | `text` | yes | reminder destination number |
| `timezone` | `text` | no | IANA timezone used for scheduling |
| `daily_reminder_time` | `time` | no | default `21:00` |
| `created_at` | `timestamptz` | no | default now |
| `updated_at` | `timestamptz` | no | default now |

Indexes:
- unique index on `(user_id)`
- index on `(sms_enabled, timezone)`

### `reminder_delivery_logs`
Stores reminder send attempts for audit and debugging.

| Column | Type | Null | Notes |
|---|---|---|---|
| `id` | `uuid` | no | primary key |
| `user_id` | `uuid` | no | foreign key to `users.id` |
| `reminder_settings_id` | `uuid` | no | foreign key to `reminder_settings.id` |
| `scheduled_for` | `timestamptz` | no | intended send timestamp |
| `delivery_type` | `reminder_delivery_type` | no | enum |
| `status` | `reminder_delivery_status` | no | enum |
| `provider_message_id` | `text` | yes | provider response id |
| `provider_error` | `text` | yes | provider error detail |
| `created_at` | `timestamptz` | no | default now |

Enums:
```text
reminder_delivery_type = DAILY
reminder_delivery_status = QUEUED | SENT | FAILED
```

Indexes:
- index on `(user_id, scheduled_for)`
- index on `(status, scheduled_for)`

### `symptom_entries`
Stores one or more symptom records inside a daily symptom log.

| Column | Type | Null | Notes |
|---|---|---|---|
| `id` | `uuid` | no | primary key |
| `daily_symptom_log_id` | `uuid` | no | foreign key to `daily_symptom_logs.id` |
| `symptom_name` | `text` | no | display value |
| `symptom_name_normalized` | `text` | no | normalized for analytics |
| `severity` | `smallint` | no | 1 to 5 |
| `medication_taken` | `boolean` | no | default false |
| `medication_name` | `text` | yes | optional |
| `medication_name_normalized` | `text` | yes | normalized for analytics |
| `notes` | `text` | yes | optional |
| `sort_order` | `integer` | no | display order within day |
| `created_at` | `timestamptz` | no | default now |
| `updated_at` | `timestamptz` | no | default now |

Indexes:
- index on `(daily_symptom_log_id, sort_order)`
- index on `(symptom_name_normalized)`
- index on `(medication_name_normalized)`
- check constraint for `severity between 1 and 5`

## Preset Tables
These tables are part of the MVP so reusable values can be managed in the database instead of hardcoded in application config.

### `preset_symptoms`
| Column | Type | Null | Notes |
|---|---|---|---|
| `id` | `uuid` | no | primary key |
| `name` | `text` | no | unique display name |
| `name_normalized` | `text` | no | unique normalized value |
| `is_active` | `boolean` | no | default true |

### `preset_medications`
| Column | Type | Null | Notes |
|---|---|---|---|
| `id` | `uuid` | no | primary key |
| `name` | `text` | no | unique display name |
| `name_normalized` | `text` | no | unique normalized value |
| `is_active` | `boolean` | no | default true |

### `preset_food_tags`
| Column | Type | Null | Notes |
|---|---|---|---|
| `id` | `uuid` | no | primary key |
| `tag` | `text` | no | unique display tag |
| `tag_normalized` | `text` | no | unique normalized value |
| `is_active` | `boolean` | no | default true |

Recommended seed values:
- symptoms: Headache, Nausea, Bloating, Acidity, Stomach Pain, Fatigue, Diarrhea
- medications: Advil, Tylenol, Nurtec, Omeprazole, Famotidine, Tums
- food tags: spicy, mild, heavy, light, oily, non-oily, dairy, gluten, fried, sugary, caffeine, fermented, acidic, large portion

## Suggested Prisma Model Sketch
This is a schema sketch, not a finalized file.

```prisma
model User {
  id               String            @id @default(uuid())
  email            String            @unique
  name             String?
  phoneNumber      String?
  phoneVerifiedAt  DateTime?
  timezone         String
  meals            Meal[]
  dailySymptomLogs DailySymptomLog[]
  reminderSettings ReminderSetting?
  reminderLogs     ReminderDeliveryLog[]
  createdAt        DateTime          @default(now())
  updatedAt        DateTime          @updatedAt
}

model Meal {
  id                        String      @id @default(uuid())
  userId                    String
  mealDate                  DateTime    @db.Date
  mealTime                  DateTime    @db.Time(0)
  source                    MealSource
  mealType                  MealType
  outsideLocation           String?
  outsideLocationNormalized String?
  notes                     String?
  user                      User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  foodItems                 FoodItem[]
  createdAt                 DateTime    @default(now())
  updatedAt                 DateTime    @updatedAt

  @@index([userId, mealDate])
  @@index([userId, mealDate, mealTime])
  @@index([userId, mealType, mealDate])
}

model FoodItem {
  id             String        @id @default(uuid())
  mealId         String
  name           String
  nameNormalized String
  sortOrder      Int
  meal           Meal          @relation(fields: [mealId], references: [id], onDelete: Cascade)
  tags           FoodItemTag[]
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt

  @@index([mealId, sortOrder])
  @@index([nameNormalized])
}

model FoodItemTag {
  id            String   @id @default(uuid())
  foodItemId    String
  tag           String
  tagNormalized String
  foodItem      FoodItem @relation(fields: [foodItemId], references: [id], onDelete: Cascade)
  createdAt     DateTime @default(now())

  @@unique([foodItemId, tagNormalized])
  @@index([tagNormalized])
}

model DailySymptomLog {
  id             String         @id @default(uuid())
  userId         String
  logDate        DateTime       @db.Date
  notes          String?
  user           User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  symptomEntries SymptomEntry[]
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt

  @@unique([userId, logDate])
  @@index([userId, logDate])
}

model ReminderSetting {
  id                    String                @id @default(uuid())
  userId                String                @unique
  smsEnabled            Boolean               @default(false)
  phoneNumber           String?
  timezone              String
  dailyReminderTime     DateTime              @db.Time(0)
  user                  User                  @relation(fields: [userId], references: [id], onDelete: Cascade)
  deliveryLogs          ReminderDeliveryLog[]
  createdAt             DateTime              @default(now())
  updatedAt             DateTime              @updatedAt

  @@index([smsEnabled, timezone])
}

model SymptomEntry {
  id                       String          @id @default(uuid())
  dailySymptomLogId        String
  symptomName              String
  symptomNameNormalized    String
  severity                 Int
  medicationTaken          Boolean         @default(false)
  medicationName           String?
  medicationNameNormalized String?
  notes                    String?
  sortOrder                Int
  dailySymptomLog          DailySymptomLog @relation(fields: [dailySymptomLogId], references: [id], onDelete: Cascade)
  createdAt                DateTime        @default(now())
  updatedAt                DateTime        @updatedAt

  @@index([dailySymptomLogId, sortOrder])
  @@index([symptomNameNormalized])
  @@index([medicationNameNormalized])
}

enum MealSource {
  HOME_COOKED
  OUTSIDE
}

enum MealType {
  BREAKFAST
  LUNCH
  DINNER
  OTHER
}

model ReminderDeliveryLog {
  id                 String                 @id @default(uuid())
  userId             String
  reminderSettingsId String
  scheduledFor       DateTime
  deliveryType       ReminderDeliveryType
  status             ReminderDeliveryStatus
  providerMessageId  String?
  providerError      String?
  user               User                   @relation(fields: [userId], references: [id], onDelete: Cascade)
  reminderSettings   ReminderSetting        @relation(fields: [reminderSettingsId], references: [id], onDelete: Cascade)
  createdAt          DateTime               @default(now())

  @@index([userId, scheduledFor])
  @@index([status, scheduledFor])
}

enum ReminderDeliveryType {
  DAILY
}

enum ReminderDeliveryStatus {
  QUEUED
  SENT
  FAILED
}
```

## Referential Behavior
- Deleting a `meal` should delete its `food_items` and `food_item_tags`.
- Deleting a `daily_symptom_log` should delete its `symptom_entries`.
- Deleting a `user` should delete all owned data.

## Analytics-Oriented Query Patterns

### Meals by month
Filter:
- `user_id`
- `meal_date between month_start and month_end`

### Meals by meal type
Filter:
- `user_id`
- `meal_type`
- `meal_date between month_start and month_end`

### Symptoms by month
Filter:
- `user_id`
- `log_date between month_start and month_end`

### Food frequency
Join:
- `meals -> food_items`

### Tag frequency
Join:
- `meals -> food_items -> food_item_tags`

### Medication frequency
Join:
- `daily_symptom_logs -> symptom_entries`

### Symptom-date association
Join date-level food presence with date-level symptom presence for the selected month.

### Reminder delivery monitoring
Filter:
- `status`
- `scheduled_for`
- `user_id`

## Suggested Future Extensions
- `entry_source` field for web, mobile, or voice input
- `attachments` table for meal photos
- `exports` table for generated reports
