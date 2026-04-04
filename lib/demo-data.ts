export const demoDashboard = [
  { label: "Meals Logged", value: "2", detail: "Breakfast and lunch captured today." },
  { label: "Symptoms Logged", value: "2", detail: "Headache and bloating recorded." },
  { label: "Next Reminder", value: "9:00 PM", detail: "One SMS reminder per day." }
];

export const demoTimeline = [
  {
    time: "8:30 AM",
    title: "Breakfast · Home Cooked",
    items: ["Oatmeal [light]", "Coffee [caffeine]"]
  },
  {
    time: "1:10 PM",
    title: "Lunch · Outside · Sweetgreen",
    items: ["Spicy chicken bowl [spicy] [heavy] [oily]", "Iced tea [caffeine]"]
  },
  {
    time: "Day summary",
    title: "Symptoms",
    items: ["Headache 4/5 · Tylenol", "Bloating 3/5"]
  }
];

export const commonSymptoms = [
  "Headache",
  "Nausea",
  "Bloating",
  "Acidity",
  "Stomach Pain",
  "Fatigue",
  "Diarrhea"
];

export const commonMedications = [
  "Advil",
  "Tylenol",
  "Nurtec",
  "Omeprazole",
  "Famotidine",
  "Tums"
];

export const historyEntries = [
  {
    date: "Apr 3, 2026",
    entries: [
      {
        time: "1:10 PM",
        title: "Lunch · Outside · Sweetgreen",
        items: ["Spicy chicken bowl [spicy] [heavy] [oily]", "Iced tea [caffeine]"]
      },
      {
        time: "Day log",
        title: "Symptoms",
        items: ["Headache 4/5 · Tylenol", "Bloating 3/5"]
      }
    ]
  },
  {
    date: "Apr 2, 2026",
    entries: [
      {
        time: "8:15 PM",
        title: "Dinner · Home Cooked",
        items: ["Pasta [heavy] [gluten]"]
      }
    ]
  }
];

export const insightMostCommonTags = ["spicy 11", "heavy 9", "caffeine 8"];

export const insightAssociations = [
  {
    symptom: "Headache",
    patterns: ["Spicy chicken bowl", "spicy", "caffeine"]
  },
  {
    symptom: "Bloating",
    patterns: ["heavy", "oily", "dairy"]
  },
  {
    symptom: "Nausea",
    patterns: ["fried", "acidic"]
  }
];

export const calendarDays = Array.from({ length: 14 }, (_, index) => ({
  label: `${index + 1}`,
  active: [3, 5, 9, 13].includes(index + 1)
}));
