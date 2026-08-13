"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { requireStudentId } from "@/lib/auth/current-student";
import { findOwnNoteFiles } from "@/lib/db/documents";
import { removeStoredFiles } from "@/lib/db/note-files";
import { insertSubject, removeSubject, updateSubject } from "@/lib/db/subjects";
import {
  readFormText,
  readFormValues,
  toFieldErrorState,
  type FormState,
} from "@/lib/forms/form-state";
import {
  examDateSchema,
  newSubjectSchema,
  subjectIdSchema,
  subjectNameSchema,
} from "./subject-schemas";

const duplicateNameState: FormState = {
  status: "error",
  fieldErrors: { name: ["You already have a subject with this name."] },
};

export async function createSubject(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireStudentId();
  const parsed = newSubjectSchema.safeParse({
    name: readFormText(formData, "name"),
    examDate: readFormText(formData, "examDate"),
  });
  const values = readFormValues(formData, ["name", "examDate"]);
  if (!parsed.success) return toFieldErrorState(parsed.error, values);

  const result = await insertSubject(parsed.data.name, parsed.data.examDate);
  if (result.errorCode === "23505") return { ...duplicateNameState, values };
  if (result.errorCode === "P0001") {
    return {
      status: "error",
      message: "You have reached the limit of 50 subjects.",
    };
  }
  if (!result.subjectId)
    return {
      status: "error",
      message: "We couldn't create the subject. Try again.",
    };
  refresh();
  redirect(`/subjects/${result.subjectId}`);
}

export async function renameSubject(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireStudentId();
  const values = readFormValues(formData, ["name"]);
  const subjectId = subjectIdSchema.safeParse(
    readFormText(formData, "subjectId"),
  );
  const name = subjectNameSchema.safeParse(values.name);
  if (!subjectId.success)
    return { status: "error", message: "That subject doesn't exist.", values };
  if (!name.success) return toFieldErrorState(name.error, values, "name");

  const result = await updateSubject(subjectId.data, { name: name.data });
  if (result.errorCode === "23505") return { ...duplicateNameState, values };
  if (!result.isUpdated)
    return {
      status: "error",
      message: "We couldn't rename the subject. Try again.",
      values,
    };
  refresh();
  return { status: "success" };
}

export async function changeExamDate(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireStudentId();
  const values = readFormValues(formData, ["examDate"]);
  const subjectId = subjectIdSchema.safeParse(
    readFormText(formData, "subjectId"),
  );
  const examDate = examDateSchema.safeParse(values.examDate);
  if (!subjectId.success)
    return { status: "error", message: "That subject doesn't exist.", values };
  if (!examDate.success)
    return toFieldErrorState(examDate.error, values, "examDate");

  const result = await updateSubject(subjectId.data, {
    examDate: examDate.data,
  });
  if (!result.isUpdated)
    return {
      status: "error",
      message: "We couldn't save the date. Try again.",
      values,
    };
  refresh();
  return { status: "success" };
}

export async function deleteSubject(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const studentId = await requireStudentId();
  const subjectId = subjectIdSchema.safeParse(
    readFormText(formData, "subjectId"),
  );
  if (!subjectId.success)
    return { status: "error", message: "That subject doesn't exist." };

  const notes = await findOwnNoteFiles({ subjectId: subjectId.data });
  const result = await removeSubject(studentId, subjectId.data);
  if (!result.isRemoved)
    return {
      status: "error",
      message: "We couldn't delete the subject. Try again.",
    };
  await removeStoredFiles(notes.map((note) => note.storagePath));
  refresh();
  redirect("/subjects");
}
