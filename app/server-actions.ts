"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/current-user";
import { parseFoodsFromFormData, parseSymptomsFromFormData } from "@/lib/form-parsers";
import { mealFormSchema, reminderSettingsSchema, symptomLogSchema } from "@/lib/validations";
import {
  cleanOptionalString,
  normalizeValue,
  parseClockTime,
  parseDateOnly,
  parseDateTime
} from "@/lib/normalization";
import { type FormState, issuesToFieldErrors } from "@/lib/form-state";

async function validateMealForm(formData: FormData) {
  const foods = parseFoodsFromFormData(formData);
  const payload = {
    mealDate: formData.get("mealDate"),
    mealTime: formData.get("mealTime"),
    source: formData.get("source"),
    mealType: formData.get("mealType"),
    outsideLocation: formData.get("outsideLocation"),
    notes: formData.get("notes"),
    foods
  };

  return mealFormSchema.safeParse(payload);
}

async function validateSymptomForm(formData: FormData) {
  const symptoms = parseSymptomsFromFormData(formData);
  const payload = {
    logDate: formData.get("logDate"),
    symptoms
  };

  return symptomLogSchema.safeParse(payload);
}

export async function createMealAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const result = await validateMealForm(formData);

  if (!result.success) {
    return {
      status: "error",
      message: "Please fix the meal details and try again.",
      fieldErrors: issuesToFieldErrors(result.error.issues)
    };
  }

  const user = await getCurrentUser();
  const outsideLocation = cleanOptionalString(formData.get("outsideLocation"));
  const notes = cleanOptionalString(formData.get("notes"));

  await db.meal.create({
    data: {
      userId: user.id,
      mealDate: parseDateOnly(result.data.mealDate),
      mealTime: parseDateTime(result.data.mealDate, result.data.mealTime),
      source: result.data.source,
      mealType: result.data.mealType,
      outsideLocation,
      outsideLocationNormalized: outsideLocation ? normalizeValue(outsideLocation) : undefined,
      notes,
      foodItems: {
        create: result.data.foods.map((food, index) => ({
          name: food.name,
          nameNormalized: normalizeValue(food.name),
          sortOrder: index,
          tags: {
            create: food.tags.map((tag) => ({
              tag,
              tagNormalized: normalizeValue(tag)
            }))
          }
        }))
      }
    }
  });

  revalidatePath("/");
  revalidatePath("/history");
  redirect("/history");
}

export async function updateMealAction(
  mealId: string,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const result = await validateMealForm(formData);

  if (!result.success) {
    return {
      status: "error",
      message: "Please fix the meal details and try again.",
      fieldErrors: issuesToFieldErrors(result.error.issues)
    };
  }

  const user = await getCurrentUser();
  const meal = await db.meal.findFirst({
    where: {
      id: mealId,
      userId: user.id
    }
  });

  if (!meal) {
    return {
      status: "error",
      message: "Meal not found."
    };
  }

  const outsideLocation = cleanOptionalString(formData.get("outsideLocation"));
  const notes = cleanOptionalString(formData.get("notes"));

  await db.meal.update({
    where: { id: mealId },
    data: {
      mealDate: parseDateOnly(result.data.mealDate),
      mealTime: parseDateTime(result.data.mealDate, result.data.mealTime),
      source: result.data.source,
      mealType: result.data.mealType,
      outsideLocation,
      outsideLocationNormalized: outsideLocation ? normalizeValue(outsideLocation) : undefined,
      notes,
      foodItems: {
        deleteMany: {},
        create: result.data.foods.map((food, index) => ({
          name: food.name,
          nameNormalized: normalizeValue(food.name),
          sortOrder: index,
          tags: {
            create: food.tags.map((tag) => ({
              tag,
              tagNormalized: normalizeValue(tag)
            }))
          }
        }))
      }
    }
  });

  revalidatePath("/");
  revalidatePath("/history");
  revalidatePath(`/meals/${mealId}/edit`);
  redirect("/history");
}

export async function createSymptomLogAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const result = await validateSymptomForm(formData);

  if (!result.success) {
    return {
      status: "error",
      message: "Please fix the symptom details and try again.",
      fieldErrors: issuesToFieldErrors(result.error.issues)
    };
  }

  const user = await getCurrentUser();

  await db.dailySymptomLog.upsert({
    where: {
      userId_logDate: {
        userId: user.id,
        logDate: parseDateOnly(result.data.logDate)
      }
    },
    update: {
      symptomEntries: {
        deleteMany: {}
      }
    },
    create: {
      userId: user.id,
      logDate: parseDateOnly(result.data.logDate)
    }
  });

  const symptomLog = await db.dailySymptomLog.findUniqueOrThrow({
    where: {
      userId_logDate: {
        userId: user.id,
        logDate: parseDateOnly(result.data.logDate)
      }
    }
  });

  await db.symptomEntry.createMany({
    data: result.data.symptoms.map((symptom, index) => ({
      dailySymptomLogId: symptomLog.id,
      symptomName: symptom.name,
      symptomNameNormalized: normalizeValue(symptom.name),
      severity: symptom.severity,
      medicationTaken: Boolean(symptom.medicationName),
      medicationName: symptom.medicationName,
      medicationNameNormalized: symptom.medicationName
        ? normalizeValue(symptom.medicationName)
        : null,
      notes: symptom.notes,
      sortOrder: index
    }))
  });

  revalidatePath("/");
  revalidatePath("/history");
  redirect("/history");
}

export async function updateSymptomLogAction(
  symptomLogId: string,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const result = await validateSymptomForm(formData);

  if (!result.success) {
    return {
      status: "error",
      message: "Please fix the symptom details and try again.",
      fieldErrors: issuesToFieldErrors(result.error.issues)
    };
  }

  const user = await getCurrentUser();
  const symptomLog = await db.dailySymptomLog.findFirst({
    where: {
      id: symptomLogId,
      userId: user.id
    }
  });

  if (!symptomLog) {
    return {
      status: "error",
      message: "Symptom log not found."
    };
  }

  const nextLogDate = parseDateOnly(result.data.logDate);
  const conflictingLog = await db.dailySymptomLog.findFirst({
    where: {
      userId: user.id,
      logDate: nextLogDate,
      NOT: {
        id: symptomLogId
      }
    }
  });

  if (conflictingLog) {
    return {
      status: "error",
      message: "A symptom log already exists for that date.",
      fieldErrors: {
        logDate: ["Choose a different date or edit the existing log for that day."]
      }
    };
  }

  await db.dailySymptomLog.update({
    where: { id: symptomLogId },
    data: {
      logDate: nextLogDate,
      symptomEntries: {
        deleteMany: {},
        create: result.data.symptoms.map((symptom, index) => ({
          symptomName: symptom.name,
          symptomNameNormalized: normalizeValue(symptom.name),
          severity: symptom.severity,
          medicationTaken: Boolean(symptom.medicationName),
          medicationName: symptom.medicationName,
          medicationNameNormalized: symptom.medicationName
            ? normalizeValue(symptom.medicationName)
            : null,
          notes: symptom.notes,
          sortOrder: index
        }))
      }
    }
  });

  revalidatePath("/");
  revalidatePath("/history");
  revalidatePath(`/symptoms/${symptomLogId}/edit`);
  redirect("/history");
}

export async function deleteMealAction(mealId: string) {
  const user = await getCurrentUser();

  await db.meal.deleteMany({
    where: {
      id: mealId,
      userId: user.id
    }
  });

  revalidatePath("/");
  revalidatePath("/history");
  redirect("/history");
}

export async function deleteSymptomLogAction(symptomLogId: string) {
  const user = await getCurrentUser();

  await db.dailySymptomLog.deleteMany({
    where: {
      id: symptomLogId,
      userId: user.id
    }
  });

  revalidatePath("/");
  revalidatePath("/history");
  redirect("/history");
}

export async function saveReminderSettingsAction(formData: FormData) {
  const payload = {
    phoneNumber: formData.get("phoneNumber"),
    timezone: formData.get("timezone"),
    smsEnabled: formData.get("smsEnabled") === "true"
  };

  const result = reminderSettingsSchema.safeParse(payload);

  if (!result.success) {
    throw new Error("Reminder settings are invalid.");
  }

  const user = await getCurrentUser();

  await db.user.update({
    where: { id: user.id },
    data: {
      phoneNumber: result.data.phoneNumber,
      timezone: result.data.timezone
    }
  });

  await db.reminderSetting.upsert({
    where: {
      userId: user.id
    },
    update: {
      phoneNumber: result.data.phoneNumber,
      timezone: result.data.timezone,
      smsEnabled: result.data.smsEnabled,
      dailyReminderTime: parseClockTime("21:00")
    },
    create: {
      userId: user.id,
      phoneNumber: result.data.phoneNumber,
      timezone: result.data.timezone,
      smsEnabled: result.data.smsEnabled,
      dailyReminderTime: parseClockTime("21:00")
    }
  });

  revalidatePath("/settings");
  redirect("/settings");
}
