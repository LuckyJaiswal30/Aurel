import type { NoteStatus } from "@/lib/db/documents";

const noteStatusLabels: Record<NoteStatus, string> = {
  uploaded: "Waiting to be read",
  checking: "Checking it is study material",
  held_for_confirmation: "Needs your confirmation",
  rejected: "Not accepted",
  reading: "Reading",
  indexing: "Preparing for search",
  ready: "Ready",
  failed: "Couldn't be read",
};

export function describeNoteStatus(status: NoteStatus) {
  return noteStatusLabels[status];
}

export const inProgressStatuses: NoteStatus[] = [
  "uploaded",
  "checking",
  "reading",
  "indexing",
];
export const stuckAfterMilliseconds = 20 * 60 * 1000;

export function isNoteInProgress(status: NoteStatus) {
  return inProgressStatuses.includes(status);
}

export function canRetryNote(
  status: NoteStatus,
  updatedAt: string,
  now: number = Date.now(),
) {
  if (status === "failed") return true;
  return (
    isNoteInProgress(status) &&
    now - Date.parse(updatedAt) > stuckAfterMilliseconds
  );
}
