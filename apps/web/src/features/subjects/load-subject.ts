import { notFound } from "next/navigation";
import { subjectIdSchema } from "./subject-schemas";
import { listSubjectNotes } from "@/lib/db/documents";
import { findSubject } from "@/lib/db/subjects";

export async function loadSubjectWithNotes(
  params: Promise<{ subjectId: string }>,
) {
  const parsedId = subjectIdSchema.safeParse((await params).subjectId);
  if (!parsedId.success) notFound();
  const [subject, notes] = await Promise.all([
    findSubject(parsedId.data),
    listSubjectNotes(parsedId.data),
  ]);
  if (!subject) notFound();
  return { subject, notes };
}
