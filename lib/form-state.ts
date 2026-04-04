import type { ZodIssue } from "zod";

export type FormState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: Record<string, string[]>;
};

export type FormAction = (
  prevState: FormState,
  formData: FormData
) => Promise<FormState>;

export const initialFormState: FormState = {
  status: "idle"
};

export function issuesToFieldErrors(issues: ZodIssue[]) {
  const fieldErrors: Record<string, string[]> = {};

  for (const issue of issues) {
    const [root, index, child] = issue.path;
    let key = String(root ?? "form");

    if (root === "foods" && typeof index === "number") {
      key = child === "tags" ? `foodTags${index}` : `foodName${index}`;
    } else if (root === "symptoms" && typeof index === "number") {
      if (child === "severity") {
        key = `severity${index}`;
      } else if (child === "medicationName") {
        key = `medicationName${index}`;
      } else {
        key = `symptomName${index}`;
      }
    }

    fieldErrors[key] ??= [];
    fieldErrors[key].push(issue.message);
  }

  return fieldErrors;
}
