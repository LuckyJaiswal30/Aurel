"use client";

import { CalendarDays, FileText, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import type { NoteSummary } from "@/lib/db/documents";
import type { ChatOutput } from "../chat-output";
import { describeNoteStatus } from "@/lib/notes/note-status";
import {
  describeExamDate,
  type SubjectSummary,
} from "@/lib/subjects/subject-summary";

type StudyContextPanelProps = {
  id: string;
  subject: SubjectSummary;
  notes: NoteSummary[];
  outputs: ChatOutput[];
  onClose: () => void;
};

export function StudyContextPanel({
  id,
  subject,
  notes,
  outputs,
  onClose,
}: StudyContextPanelProps) {
  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (
        event.key !== "Escape" ||
        document.querySelector("[role=dialog], [role=menu]")
      )
        return;
      onClose();
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  return (
    <aside
      id={id}
      aria-label="Study context"
      className="fixed inset-x-3 top-[6.75rem] z-30 max-h-[calc(100dvh-8rem)] md:top-14 md:max-h-[calc(100dvh-5rem)] overflow-y-auto rounded-panel border border-line bg-surface shadow-[0_16px_40px_-20px_rgb(0_0_0/0.35)] md:inset-x-auto md:right-4 md:w-80"
    >
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <h2 className="text-sm font-medium text-text">This subject</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close study context"
          className="-m-1 rounded-control p-1 text-muted hover:bg-hover hover:text-text"
        >
          <X aria-hidden="true" className="size-4" />
        </button>
      </div>

      <section
        aria-labelledby="context-exam-heading"
        className="border-b border-line px-4 py-3"
      >
        <h3 id="context-exam-heading" className="sr-only">
          Exam
        </h3>
        <p className="flex items-center gap-2.5 text-sm text-text">
          <CalendarDays aria-hidden="true" className="size-4 text-muted" />
          {describeExamDate(subject.examDate, subject.daysUntilExam)}
        </p>
      </section>

      <section
        aria-labelledby="context-notes-heading"
        className="border-b border-line px-4 py-3"
      >
        <div className="flex items-baseline justify-between gap-3">
          <h3
            id="context-notes-heading"
            className="text-sm font-medium text-text"
          >
            Notes
          </h3>
          <Link
            href={`/subjects/${subject.id}/notes`}
            className="text-xs font-medium text-ink underline-offset-4 hover:underline"
          >
            Manage notes
          </Link>
        </div>
        {notes.length === 0 ? (
          <p className="mt-2 text-sm text-muted">
            No notes yet. Answers cite pages once you add some.
          </p>
        ) : (
          <ul className="mt-2 flex flex-col">
            {notes.map((note) => (
              <li key={note.id} className="flex items-center gap-2.5 py-1.5">
                <FileText
                  aria-hidden="true"
                  className="size-4 shrink-0 text-muted"
                />
                <span className="min-w-0 flex-1 truncate text-sm text-text">
                  {note.fileName}
                </span>
                <span className="shrink-0 text-xs text-muted">
                  {describeNoteStatus(note.status)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="context-outputs-heading" className="px-4 py-3">
        <h3
          id="context-outputs-heading"
          className="text-sm font-medium text-text"
        >
          Made in this chat
        </h3>
        {outputs.length === 0 ? (
          <p className="mt-2 text-sm text-muted">
            Flashcards, quizzes and summaries you make in this chat appear here.
          </p>
        ) : (
          <ul className="mt-2 grid grid-cols-2 gap-2">
            {outputs.map((output) => (
              <li
                key={output.id}
                className="rounded-control border border-line p-2.5"
              >
                <Sparkles aria-hidden="true" className="size-4 text-muted" />
                <span className="mt-2 block truncate text-sm text-text">
                  {output.title}
                </span>
                <span className="block text-xs text-muted capitalize">
                  {output.kind}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </aside>
  );
}
