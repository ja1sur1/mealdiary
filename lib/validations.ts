import { z } from "zod";

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Enter a valid email address.");

const passwordSchema = z
  .string()
  .min(8, "Use at least 8 characters.")
  .max(72, "Use 72 characters or fewer.");

export const mealFormSchema = z.object({
  mealDate: z.string().min(1),
  mealTime: z.string().min(1),
  source: z.enum(["HOME_COOKED", "OUTSIDE"]),
  mealType: z.enum(["BREAKFAST", "LUNCH", "DINNER", "OTHER"]),
  outsideLocation: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  foods: z
    .array(
      z.object({
        name: z.string().min(1),
        tags: z.array(z.string())
      })
    )
    .min(1)
}).superRefine((data, ctx) => {
  if (data.source === "OUTSIDE" && !data.outsideLocation?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Please enter where you ate this meal.",
      path: ["outsideLocation"]
    });
  }
});

export const symptomLogSchema = z.object({
  logDate: z.string().min(1),
  symptoms: z
    .array(
      z.object({
        name: z.string().min(1),
        severity: z.number().int().min(1).max(5),
        medicationName: z.string().optional(),
        notes: z.string().optional()
      }).superRefine((symptom, ctx) => {
        if (symptom.medicationName !== undefined && symptom.medicationName.trim().length === 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Medication name cannot be empty when provided.",
            path: ["medicationName"]
          });
        }
      })
    )
    .min(1)
});

export const reminderSettingsSchema = z.object({
  phoneNumber: z.string().min(1),
  timezone: z.string().min(1),
  smsEnabled: z.boolean()
});

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Enter your password.")
});

export const signUpSchema = z
  .object({
    name: z.string().trim().max(80, "Use 80 characters or fewer.").optional(),
    email: emailSchema,
    timezone: z.string().trim().min(1, "Choose a timezone."),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm your password.")
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Passwords must match.",
        path: ["confirmPassword"]
      });
    }
  });
