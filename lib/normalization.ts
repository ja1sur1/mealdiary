export function normalizeValue(value: string) {
  return value.trim().toLowerCase();
}

export function cleanOptionalString(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function parseDateOnly(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

export function parseDateTime(value: string, time: string) {
  return new Date(`${value}T${time}:00.000Z`);
}

export function parseClockTime(value: string) {
  return new Date(`1970-01-01T${value}:00.000Z`);
}

export function splitCommaSeparated(value: string | undefined) {
  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}
