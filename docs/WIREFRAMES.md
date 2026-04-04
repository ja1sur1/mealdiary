# Low-Fidelity Wireframes

## Notes
- These are MVP wireframes intended to clarify layout and interaction flow.
- They are mobile-first because daily logging is the highest-priority behavior.
- Labels and sections are intentionally plain so design decisions can come later.

## 1. Home Dashboard

### Mobile
```text
+--------------------------------------------------+
| Diet and Symptoms Tracker                        |
| Fri, Apr 3                                       |
+--------------------------------------------------+
| Today at a glance                                |
| Meals logged: 2                                  |
| Symptoms logged: 1                               |
| Medications taken: 1                             |
| Next reminder: 9:00 PM                           |
+--------------------------------------------------+
| Quick Actions                                    |
| [ + Add Meal ]   [ + Add Symptoms ]              |
+--------------------------------------------------+
| Today's Timeline                                 |
| 8:30 AM  Breakfast                               |
|          - Oatmeal [light]                       |
|          - Coffee [caffeine]                     |
|                                                  |
| 1:10 PM  Lunch                                   |
|          - Chicken bowl [spicy][oily]            |
|          - Iced tea [caffeine]                   |
|                                                  |
| Symptoms                                         |
| - Headache (4/5)  Medication: Tylenol            |
+--------------------------------------------------+
| Bottom Nav                                       |
| [Home] [History] [Insights]                      |
+--------------------------------------------------+
```

### Desktop
```text
+----------------------------------------------------------------------------------+
| Diet and Symptoms Tracker                          Month: April 2026              |
+-------------------------------+--------------------------------------------------+
| Quick Actions                 | Today Timeline                                   |
| [ + Add Meal ]                | 8:30 AM Breakfast                                |
| [ + Add Symptoms ]            | 1:10 PM Lunch                                    |
|                               | Symptoms: Headache (4/5), Bloating (3/5)         |
+-------------------------------+--------------------------------------------------+
| Today Summary                 | Recent Patterns                                  |
| Meals: 2                      | - Bloating on 4 days this month                  |
| Symptoms: 2                   | - Tylenol used 3 times this month                |
| Medications: 1                | - Spicy foods often appear on headache days      |
| Reminders: On                 | - Next SMS reminder at 9:00 PM                   |
+-------------------------------+--------------------------------------------------+
```

## 2. Quick Add Meal

### Mobile
```text
+--------------------------------------------------+
| < Back                    Add Meal               |
+--------------------------------------------------+
| Date: [ Apr 3, 2026      ]                       |
| Time: [ 1:10 PM          ]                       |
| Source: ( ) Home Cooked  (x) Outside             |
| Meal Type: [ Lunch v ]                           |
| Where: [ Sweetgreen________________ ]            |
+--------------------------------------------------+
| Food Items                                        |
| ------------------------------------------------ |
| Food 1                                           |
| Name: [ Spicy chicken bowl____________ ]         |
| Tags: [spicy] [heavy] [oily] [+ Add tag]         |
| ------------------------------------------------ |
| Food 2                                           |
| Name: [ Iced tea______________________ ]         |
| Tags: [caffeine] [+ Add tag]                     |
| ------------------------------------------------ |
| [ + Add Another Food ]                           |
+--------------------------------------------------+
| Notes                                            |
| [____________________________________________]   |
+--------------------------------------------------+
|        [ Cancel ]         [ Save Meal ]          |
+--------------------------------------------------+
```

### Interaction Notes
- `Where` only shows when `Outside` is selected.
- `Meal Type` is required with options Breakfast, Lunch, Dinner, and Other.
- Food tag chips should allow multi-select.
- Recent foods and locations should appear below focused inputs as suggestions.

## 3. Quick Add Symptoms

### Mobile
```text
+--------------------------------------------------+
| < Back                  Add Daily Symptoms       |
+--------------------------------------------------+
| Date: [ Apr 3, 2026      ]                       |
+--------------------------------------------------+
| Symptom 1                                         |
| Symptom:  [ Headache____________________ ]       |
| Severity: [1] [2] [3] [4] [5]                    |
| Took medication?  [x] Yes   [ ] No               |
| Medication: [ Tylenol___________________ ]       |
| Quick picks: [Advil] [Tylenol] [Nurtec]          |
|              [Omeprazole] [Famotidine] [Tums]    |
| Notes: [_____________________________________]   |
| ------------------------------------------------ |
| Symptom 2                                         |
| Symptom:  [ Bloating____________________ ]       |
| Severity: [1] [2] [3] [4] [5]                    |
| Took medication?  [ ] Yes   [x] No               |
| Notes: [_____________________________________]   |
| ------------------------------------------------ |
| [ + Add Another Symptom ]                        |
+--------------------------------------------------+
|       [ Cancel ]          [ Save Symptoms ]      |
+--------------------------------------------------+
```

### Interaction Notes
- Symptom entry is date-only.
- Medication field only appears when `Yes` is selected.
- Common symptoms should appear as autocomplete suggestions.

## 4. History / Edit Screen

### Mobile
```text
+--------------------------------------------------+
| History                                           |
+--------------------------------------------------+
| Filters                                           |
| From [ Apr 1 ] To [ Apr 30 ]                      |
| Type [ All v ]                                    |
+--------------------------------------------------+
| Apr 3                                             |
| 1:10 PM Lunch                                     |
| Sweetgreen                                        |
| - Spicy chicken bowl [spicy][heavy][oily]         |
| - Iced tea [caffeine]                             |
| [Edit] [Delete]                                   |
|                                                  |
| Symptom Log                                       |
| - Headache 4/5  Tylenol                           |
| - Bloating 3/5                                    |
| [Edit] [Delete]                                   |
+--------------------------------------------------+
| Apr 2                                             |
| 8:15 PM Dinner                                    |
| Home Cooked                                       |
| - Pasta [heavy][gluten]                           |
+--------------------------------------------------+
```

### Interaction Notes
- Group entries by date.
- Editing a meal opens meal form with nested food rows prefilled.
- Editing symptom log opens date-based symptom editor with all current entries.

## 5. Monthly Insights Dashboard

### Mobile
```text
+--------------------------------------------------+
| Insights                                          |
+--------------------------------------------------+
| Month: [ April 2026 v ]                           |
+--------------------------------------------------+
| Meal Type Frequency                               |
| Breakfast  ||||    4                              |
| Lunch      ||||||  6                              |
| Dinner     |||||   5                              |
| Other      |       1                              |
+--------------------------------------------------+
| Symptom Frequency                                 |
| Headache   |||||||| 8                             |
| Bloating   ||||||  6                              |
| Nausea     |||     3                              |
+--------------------------------------------------+
| Medication Frequency                              |
| Tylenol    |||||   5                              |
| Tums       ||||    4                              |
| Famotidine ||      2                              |
+--------------------------------------------------+
| Possible Associations: Headache                   |
| 1. Spicy chicken bowl                             |
| 2. spicy                                           |
| 3. caffeine                                        |
+--------------------------------------------------+
| Symptom Calendar                                  |
| Su Mo Tu We Th Fr Sa                              |
|     1  2  3* 4  5* 6  7                           |
| 8  9* 10 11 12 13* 14                             |
+--------------------------------------------------+
```

### Desktop
```text
+------------------------------------------------------------------------------------------------+
| Insights                                                           Month: [ April 2026 v ]     |
+---------------------------+------------------------------+-----------------------------+
| Meal Type Frequency       | Symptom Frequency            | Medication Frequency        |
| Breakfast      4          | Headache        8            | Tylenol          5          |
| Lunch          6          | Bloating        6            | Tums             4          |
| Dinner         5          | Nausea          3            | Famotidine       2          |
+---------------------------+------------------------------+-----------------------------+
| Most Common Tags                                                                        |
| spicy 11, heavy 9, caffeine 8                                                           |
+-----------------------------------------------------------------------------------------+
| Possible Associations by Symptom                                                            |
| Headache -> spicy chicken bowl, spicy, caffeine                                            |
| Bloating -> heavy, oily, dairy                                                             |
| Nausea   -> fried, acidic                                                                  |
+---------------------------------------------------------------------------------------------+
| Symptom Calendar                                | Most Common Foods                          |
| [calendar grid with marked symptom days]        | chicken bowl, pasta, coffee, yogurt       |
+-------------------------------------------------+-------------------------------------------+
```

## 6. Empty States

### No Data Yet
```text
+--------------------------------------------------+
| No logs yet                                      |
| Start by adding your first meal or symptoms.     |
| [ + Add Meal ]   [ + Add Symptoms ]              |
+--------------------------------------------------+
```

### Not Enough Insight Data
```text
+--------------------------------------------------+
| Not enough data for meaningful patterns yet.     |
| Keep logging meals and symptoms for a few days.  |
+--------------------------------------------------+
```

## 7. Reminder Settings

### Mobile
```text
+--------------------------------------------------+
| Settings                                          |
+--------------------------------------------------+
| SMS Reminders                                     |
| Phone Number: [ +1 415 555 0123____________ ]    |
| Timezone:     [ America/Los_Angeles________ ]    |
| Send reminders by text: [x] Enabled              |
|                                                  |
| Reminder schedule                                |
| - 9:00 PM                                        |
|                                                  |
| Message: "Reminder: log your meals and symptoms" |
+--------------------------------------------------+
|             [ Save Settings ]                    |
+--------------------------------------------------+
```

## 8. Suggested Screen Sequence
1. Home dashboard
2. Add meal
3. Add symptoms
4. History/edit
5. Monthly insights
6. Reminder settings

## 9. Key UX Decisions Captured in the Wireframes
- Meal entry supports multiple food items by default.
- Meal entry requires a meal type.
- Symptom logging is organized by date, not time.
- Medication is optional and conditionally shown.
- Tags are the primary method for food characterization.
- Quick actions are always visible from the home screen.
- SMS reminders are configured in settings and sent at fixed times.
