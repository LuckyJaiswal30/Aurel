"use server";

import { refresh } from "next/cache";
import { requireStudentId } from "@/lib/auth/current-student";
import { updateProfile } from "@/lib/db/profiles";
import {
  readFormValues,
  toFieldErrorState,
  type FormState,
} from "@/lib/forms/form-state";
import { displayNameSchema, studyProfileSchema } from "./profile-schema";

const saveFailedState: FormState = {
  status: "error",
  message: "We couldn't save that. Try again.",
};

export async function saveDisplayName(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const studentId = await requireStudentId();
  const values = readFormValues(formData, ["displayName"]);
  const parsed = displayNameSchema.safeParse(values.displayName);
  if (!parsed.success)
    return toFieldErrorState(parsed.error, values, "displayName");

  const result = await updateProfile(studentId, { displayName: parsed.data });
  if (!result.isUpdated) return { ...saveFailedState, values };
  refresh();
  return {
    status: "success",
    message: "Name saved.",
    values: { displayName: parsed.data },
  };
}

export async function saveStudyProfile(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const studentId = await requireStudentId();
  const values = readFormValues(formData, [
    "course",
    "studyYear",
    "preferredLanguage",
    "explanationLevel",
  ]);
  const parsed = studyProfileSchema.safeParse(values);
  if (!parsed.success) return toFieldErrorState(parsed.error, values);

  const result = await updateProfile(studentId, parsed.data);
  if (!result.isUpdated) return { ...saveFailedState, values };
  refresh();
  return {
    status: "success",
    message: "Study profile saved.",
    values: { ...values, course: values.course?.trim() ?? "" },
  };
}
