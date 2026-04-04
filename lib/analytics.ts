import type { Meal, MealType, ReminderSetting, SymptomEntry } from "@prisma/client";

export type ChartRow = {
  label: string;
  value: number;
  max: number;
};

type MealWithRelations = Meal & {
  foodItems: Array<{
    name: string;
    tags: Array<{
      tag: string;
    }>;
  }>;
};

type SymptomLogWithEntries = {
  logDate: Date;
  symptomEntries: SymptomEntry[];
};

function tally(items: string[]) {
  const counts = new Map<string, number>();

  for (const item of items) {
    counts.set(item, (counts.get(item) ?? 0) + 1);
  }

  return counts;
}

function countsToChartRows(
  counts: Map<string, number>,
  fallbackLabels: string[] = [],
  limit = 4
): ChartRow[] {
  const sorted = Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit);

  const rows = sorted.length
    ? sorted
    : fallbackLabels.map((label) => [label, 0] as const).slice(0, limit);

  const max = Math.max(1, ...rows.map(([, value]) => value));

  return rows.map(([label, value]) => ({
    label,
    value,
    max
  }));
}

export function buildMealTypeChartRows(meals: Meal[]) {
  const counts = new Map<string, number>([
    ["Breakfast", 0],
    ["Lunch", 0],
    ["Dinner", 0],
    ["Other", 0]
  ]);

  for (const meal of meals) {
    const label = mealTypeLabel(meal.mealType);
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }

  const max = Math.max(1, ...counts.values());
  return Array.from(counts.entries()).map(([label, value]) => ({ label, value, max }));
}

export function buildSymptomFrequencyRows(symptomLogs: SymptomLogWithEntries[]) {
  return countsToChartRows(
    tally(symptomLogs.flatMap((log) => log.symptomEntries.map((entry) => entry.symptomName))),
    ["Headache", "Bloating", "Nausea"]
  );
}

export function buildMedicationFrequencyRows(symptomLogs: SymptomLogWithEntries[]) {
  return countsToChartRows(
    tally(
      symptomLogs.flatMap((log) =>
        log.symptomEntries
          .map((entry) => entry.medicationName)
          .filter((value): value is string => Boolean(value))
      )
    ),
    ["Tylenol", "Tums", "Famotidine"]
  );
}

export function buildTopTags(meals: MealWithRelations[], limit = 6) {
  return Array.from(
    tally(meals.flatMap((meal) => meal.foodItems.flatMap((food) => food.tags.map((tag) => tag.tag)))).entries()
  )
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([tag, count]) => `${tag} ${count}`);
}

export function buildAssociationSummary(meals: MealWithRelations[], symptomLogs: SymptomLogWithEntries[]) {
  const foodsByDate = new Map<string, Set<string>>();
  const tagsByDate = new Map<string, Set<string>>();

  for (const meal of meals) {
    const dateKey = meal.mealDate.toISOString().slice(0, 10);
    const foods = foodsByDate.get(dateKey) ?? new Set<string>();
    const tags = tagsByDate.get(dateKey) ?? new Set<string>();

    for (const food of meal.foodItems) {
      foods.add(food.name);
      for (const tag of food.tags) {
        tags.add(tag.tag);
      }
    }

    foodsByDate.set(dateKey, foods);
    tagsByDate.set(dateKey, tags);
  }

  const allLoggedDates = new Set<string>([
    ...foodsByDate.keys(),
    ...symptomLogs.map((log) => log.logDate.toISOString().slice(0, 10))
  ]);

  const symptomToDates = new Map<string, Set<string>>();
  for (const log of symptomLogs) {
    const dateKey = log.logDate.toISOString().slice(0, 10);
    for (const entry of log.symptomEntries) {
      const set = symptomToDates.get(entry.symptomName) ?? new Set<string>();
      set.add(dateKey);
      symptomToDates.set(entry.symptomName, set);
    }
  }

  return Array.from(symptomToDates.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([symptom, dates]) => {
      const symptomCounts = new Map<string, number>();
      const nonSymptomCounts = new Map<string, number>();

      for (const date of allLoggedDates) {
        const combined = [
          ...(foodsByDate.get(date) ? Array.from(foodsByDate.get(date)!) : []),
          ...(tagsByDate.get(date) ? Array.from(tagsByDate.get(date)!) : [])
        ];

        for (const item of combined) {
          const target = dates.has(date) ? symptomCounts : nonSymptomCounts;
          target.set(item, (target.get(item) ?? 0) + 1);
        }
      }

      const scored = Array.from(symptomCounts.entries())
        .map(([item, count]) => ({
          item,
          score: count - (nonSymptomCounts.get(item) ?? 0),
          count
        }))
        .sort((a, b) => b.score - a.score || b.count - a.count || a.item.localeCompare(b.item))
        .slice(0, 3)
        .map((entry) => entry.item);

      return {
        symptom,
        patterns: scored
      };
    })
    .filter((entry) => entry.patterns.length > 0);
}

export function buildCalendarDays(symptomLogs: SymptomLogWithEntries[], year: number, month: number) {
  const activeDays = new Set(
    symptomLogs.map((log) => Number(log.logDate.toISOString().slice(8, 10)))
  );
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();

  return Array.from({ length: daysInMonth }, (_, index) => ({
    label: `${index + 1}`,
    active: activeDays.has(index + 1)
  }));
}

export function buildDashboardStats(args: {
  mealsToday: MealWithRelations[];
  symptomsToday: SymptomLogWithEntries["symptomEntries"];
  reminderSetting: ReminderSetting | null;
}) {
  return [
    {
      label: "Meals Logged",
      value: String(args.mealsToday.length),
      detail:
        args.mealsToday.length > 0
          ? `${args.mealsToday.length} meal${args.mealsToday.length === 1 ? "" : "s"} captured today.`
          : "No meals logged yet today."
    },
    {
      label: "Symptoms Logged",
      value: String(args.symptomsToday.length),
      detail:
        args.symptomsToday.length > 0
          ? `${args.symptomsToday.length} symptom${args.symptomsToday.length === 1 ? "" : "s"} recorded today.`
          : "No symptoms logged yet today."
    },
    {
      label: "Next Reminder",
      value: args.reminderSetting?.smsEnabled ? "9:00 PM" : "Off",
      detail: args.reminderSetting?.smsEnabled
        ? "One SMS reminder per day."
        : "SMS reminders are currently disabled."
    }
  ];
}

export function mealTypeLabel(mealType: MealType) {
  return `${mealType[0]}${mealType.slice(1).toLowerCase()}`;
}
