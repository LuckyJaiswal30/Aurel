"use client";

import { FileText, Trash2 } from "lucide-react";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/class-names";
import type { NoteSummary } from "@/lib/db/documents";
import {
  canRetryNote,
  describeNoteStatus,
  isNoteInProgress,
} from "@/lib/notes/note-status";
import { confirmStudyMaterial, deleteNote, retryNote } from "../note-actions";

type NoteRowProps = {
  note: NoteSummary;
};

const uploadedDateFormat = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
});

function describeSize(sizeBytes: number) {
  if (sizeBytes < 1024 * 1024)
    return `${Math.max(1, Math.round(sizeBytes / 1024))} KB`;
  return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function NoteRow({ note }: NoteRowProps) {
  const [isWorking, startWorking] = useTransition();
  const isProblem = note.status === "rejected" || note.status === "failed";
  const details = [
    describeSize(note.sizeBytes),
    note.pageCount
      ? `${note.pageCount} ${note.pageCount === 1 ? "page" : "pages"}`
      : null,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <li className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <FileText
          aria-hidden="true"
          className="mt-0.5 size-4 shrink-0 text-muted"
        />
        <div className="min-w-0">
          <p className="truncate text-sm text-text">{note.fileName}</p>
          <p className="text-xs text-muted">
            {details}, {uploadedDateFormat.format(new Date(note.uploadedAt))}
          </p>
          <p
            className={cn(
              "mt-1 flex items-center gap-1.5 text-xs",
              isProblem ? "text-danger" : "text-muted",
            )}
          >
            {isNoteInProgress(note.status) ? (
              <span
                aria-hidden="true"
                className="size-1.5 animate-pulse rounded-full bg-ink"
              />
            ) : null}
            {note.statusDetail ?? describeNoteStatus(note.status)}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1 pl-7 sm:pl-0">
        {note.status === "held_for_confirmation" ? (
          <Button
            variant="secondary"
            disabled={isWorking}
            onClick={() =>
              startWorking(
                async () => void (await confirmStudyMaterial(note.id)),
              )
            }
          >
            It&apos;s study material
          </Button>
        ) : null}
        {canRetryNote(note.status, note.updatedAt) ? (
          <Button
            variant="secondary"
            disabled={isWorking}
            onClick={() =>
              startWorking(async () => void (await retryNote(note.id)))
            }
          >
            Try again
          </Button>
        ) : null}
        <Button
          variant="ghost"
          disabled={isWorking}
          aria-label={`Delete ${note.fileName}`}
          title="Delete note"
          onClick={() =>
            startWorking(async () => void (await deleteNote(note.id)))
          }
          className="px-2 text-muted hover:text-danger"
        >
          <Trash2 aria-hidden="true" />
        </Button>
      </div>
    </li>
  );
}
