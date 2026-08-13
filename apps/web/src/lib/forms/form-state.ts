import { z } from "zod";

export type FormState = {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  values?: Record<string, string>;
};

export const idleFormState: FormState = { status: "idle" };

export function toFieldErrorState(
  error: z.ZodError,
  values?: Record<string, string>,
  fieldName?: string,
): FormState {
  return {
    status: "error",
    message: "Check the highlighted fields.",
    fieldErrors: fieldName
      ? { [fieldName]: error.issues.map((issue) => issue.message) }
      : z.flattenError(error).fieldErrors,
    values,
  };
}

export function readFormValues(formData: FormData, names: string[]) {
  return Object.fromEntries(
    names.map((name) => [name, readFormText(formData, name) ?? ""]),
  );
}

export function readFormText(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : undefined;
}
