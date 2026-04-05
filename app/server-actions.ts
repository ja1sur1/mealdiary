"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSession, deleteCurrentSession, hashPassword, verifyPassword } from "@/lib/auth";
import { db } from "@/lib/db";
import { requireCurrentUser } from "@/lib/current-user";
import { parseFoodsFromFormData, parseSymptomsFromFormData } from "@/lib/form-parsers";
import {
  mealFormSchema,
  reminderSettingsSchema,
  signInSchema,
  signUpSchema,
  symptomLogSchema
} from "@/lib/validations";
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

export async function signUpAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const result = signUpSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    signupCode: formData.get("signupCode"),
    timezone: formData.get("timezone"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword")
  });

  if (!result.success) {
    return {
      status: "error",
      message: "Please fix the highlighted fields and try again.",
      fieldErrors: issuesToFieldErrors(result.error.issues)
    };
  }

  const existingUser = await db.user.findUnique({
    where: {
      email: result.data.email
    }
  });

  if (existingUser?.passwordHash) {
    return {
      status: "error",
      message: "An account already exists for that email address.",
      fieldErrors: {
        email: ["Use a different email address or sign in instead."]
      }
    };
  }

  const signupSecret = await db.signupSecret.findFirst({
    where: {
      code: result.data.signupCode,
      isActive: true
    }
  });

  if (!signupSecret) {
    return {
      status: "error",
      message: "That signup code is not valid.",
      fieldErrors: {
        signupCode: ["Enter a valid signup code to create an account."]
      }
    };
  }

  const passwordHash = await hashPassword(result.data.password);
  const userData = {
    name: result.data.name?.trim() ? result.data.name.trim() : undefined,
    email: result.data.email,
    timezone: result.data.timezone,
    passwordHash
  };

  let user;

  if (existingUser) {
    user = await db.user.update({
      where: {
        id: existingUser.id
      },
      data: userData
    });
  } else {
    const [passwordUserCount, legacyUsers] = await Promise.all([
      db.user.count({
        where: {
          passwordHash: {
            not: null
          }
        }
      }),
      db.user.findMany({
        where: {
          passwordHash: null
        },
        orderBy: {
          createdAt: "asc"
        },
        take: 2
      })
    ]);

    if (passwordUserCount === 0 && legacyUsers.length === 1) {
      user = await db.user.update({
        where: {
          id: legacyUsers[0].id
        },
        data: userData
      });
    } else {
      user = await db.user.create({
        data: userData
      });
    }
  }

  await createSession(user.id);
  redirect("/");
}

export async function signInAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const result = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password")
  });

  if (!result.success) {
    return {
      status: "error",
      message: "Enter your email and password to continue.",
      fieldErrors: issuesToFieldErrors(result.error.issues)
    };
  }

  const user = await db.user.findUnique({
    where: {
      email: result.data.email
    }
  });

  if (!user?.passwordHash || !(await verifyPassword(result.data.password, user.passwordHash))) {
    return {
      status: "error",
      message: "That email and password combination was not recognized.",
      fieldErrors: {
        email: ["Check your credentials and try again."],
        password: ["Check your credentials and try again."]
      }
    };
  }

  await createSession(user.id);
  redirect("/");
}

export async function signOutAction() {
  await deleteCurrentSession();
  redirect("/sign-in");
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

  const user = await requireCurrentUser();
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

  const user = await requireCurrentUser();
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

  const user = await requireCurrentUser();

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

  const user = await requireCurrentUser();
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
  const user = await requireCurrentUser();

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
  const user = await requireCurrentUser();

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

  const user = await requireCurrentUser();

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
