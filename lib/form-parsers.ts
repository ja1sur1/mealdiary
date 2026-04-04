import { cleanOptionalString, splitCommaSeparated } from "@/lib/normalization";

type ParsedFoodInput = {
  name: string;
  tags: string[];
};

type ParsedSymptomInput = {
  name: string;
  severity: number;
  medicationName: string | undefined;
  notes: string | undefined;
};

function getIndexedFieldNames(formData: FormData, prefix: string) {
  const indexes = new Set<number>();

  for (const key of formData.keys()) {
    const match = key.match(new RegExp(`^${prefix}(\\d+)$`));

    if (match) {
      indexes.add(Number(match[1]));
    }
  }

  return Array.from(indexes).sort((a, b) => a - b);
}

export function parseFoodsFromFormData(formData: FormData): ParsedFoodInput[] {
  const indexes = getIndexedFieldNames(formData, "foodName");

  const parsedFoods = indexes
    .map((index) => {
      const name = cleanOptionalString(formData.get(`foodName${index}`));
      const rawTags = cleanOptionalString(formData.get(`foodTags${index}`));

      if (!name) {
        return null;
      }

      return {
        name,
        tags: splitCommaSeparated(rawTags)
      };
    })
    .filter((food): food is ParsedFoodInput => food !== null);

  return parsedFoods;
}

export function parseSymptomsFromFormData(formData: FormData): ParsedSymptomInput[] {
  const indexes = getIndexedFieldNames(formData, "symptomName");

  const parsedSymptoms = indexes
    .map((index) => {
      const name = cleanOptionalString(formData.get(`symptomName${index}`));
      const severityValue = cleanOptionalString(formData.get(`severity${index}`));
      const medicationName = cleanOptionalString(formData.get(`medicationName${index}`));
      const notes = cleanOptionalString(formData.get(`symptomNotes${index}`));

      if (!name || !severityValue) {
        return null;
      }

      return {
        name,
        severity: Number(severityValue),
        medicationName,
        notes
      };
    })
    .filter((symptom): symptom is ParsedSymptomInput => symptom !== null);

  return parsedSymptoms;
}
