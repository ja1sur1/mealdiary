import { z } from "zod";

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
