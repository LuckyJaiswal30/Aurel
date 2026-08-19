"use server";

import { refresh } from "next/cache";
import { after } from "next/server";
import { z } from "zod";
import { requireStudentId } from "@/lib/auth/current-student";
import { findOwnNoteFiles } from "@/lib/db/documents";
import {
  claimNoteJob,
  deleteNoteRecords,
  removeStoredFiles,
} from "@/lib/db/note-files";
import { consumeUsage } from "@/lib/db/usage";
import {
  canRetryNote,
  inProgressStatuses,
  stuckAfterMilliseconds,
} from "@/lib/notes/note-status";
import {
  continueReadingNote,
  processUploadedNote,
} from "./process-uploaded-note";

const noteIdSchema = z.uuid();

async function findOwnNote(noteId: unknown) {
  const studentId = await requireStudentId();
  const parsedId = noteIdSchema.safeParse(noteId);
  if (!parsedId.success) return null;
  const [note] = await findOwnNoteFiles({ noteId: parsedId.data });
  return note ? { ...note, studentId } : null;
}

async function canStartAnotherJob(studentId: string) {
  const usage = await consumeUsage(
    `user:${studentId}`,
    "note_retry",
    3600,
    1,
    10,
  );
  return usage.isAllowed;
}

export async function deleteNote(noteId: string) {
  const note = await findOwnNote(noteId);
  if (!note) return { isDone: false };
  await removeStoredFiles([note.storagePath]);
  await deleteNoteRecords([note.id]);
  refresh();
  return { isDone: true };
}

export async function confirmStudyMaterial(noteId: string) {
  const note = await findOwnNote(noteId);
  if (!note || !(await canStartAnotherJob(note.studentId)))
    return { isDone: false };
  const isClaimed = await claimNoteJob(note.studentId, note.id, {
    fromStatuses: ["held_for_confirmation"],
    toStatus: "reading",
    stuckStatuses: [],
    stuckBefore: new Date(),
  });
  if (!isClaimed) return { isDone: false };
  after(() => continueReadingNote(note.id, note.fileName));
  refresh();
  return { isDone: true };
}

export async function retryNote(noteId: string) {
  const note = await findOwnNote(noteId);
  if (!note || !canRetryNote(note.status, note.updatedAt))
    return { isDone: false };
  if (!(await canStartAnotherJob(note.studentId))) return { isDone: false };
  const isClaimed = await claimNoteJob(note.studentId, note.id, {
    fromStatuses: ["failed"],
    toStatus: "checking",
    stuckStatuses: inProgressStatuses,
    stuckBefore: new Date(Date.now() - stuckAfterMilliseconds),
  });
  if (!isClaimed) return { isDone: false };
  after(() => processUploadedNote(note));
  refresh();
  return { isDone: true };
}
