import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { NoteSummary } from "@/lib/db/documents";
import type { SubjectSummary } from "@/lib/db/subjects";
import { isNoteInProgress } from "@/lib/notes/note-status";
import { NoteRow } from "./NoteRow";
import { NotesStatusWatcher } from "./NotesStatusWatcher";
import { NotesUploader } from "./NotesUploader";

type NotesPageProps = {
  subject: SubjectSummary;
  notes: NoteSummary[];
};

export function NotesPage({ subject, notes }: NotesPageProps) {
  return (
    <div className="mx-auto w-full max-w-3xl py-6 md:py-10">
      <Link
        href={`/subjects/${subject.id}`}
        className="inline-flex items-center gap-1 text-sm text-muted hover:text-text"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Back to chat
      </Link>
      <h1 className="mt-3 font-serif text-2xl font-medium text-text">
        {subject.name} notes
      </h1>
      <p className="mt-1 max-w-xl text-sm text-muted">
        The tutor answers from these files and shows the page. Each upload is
        checked to be study material, and phone or ID numbers inside it are
        hidden before it is read.
      </p>

      <div className="mt-6">
        <NotesUploader subjectId={subject.id} />
      </div>

      <section aria-labelledby="note-list-heading" className="mt-8">
        <h2 id="note-list-heading" className="text-sm font-medium text-text">
          {notes.length === 0
            ? "No notes yet"
            : `${notes.length} ${notes.length === 1 ? "file" : "files"}`}
        </h2>
        {notes.length > 0 ? (
          <ul className="mt-3 divide-y divide-line rounded-panel border border-line bg-surface">
            {notes.map((note) => (
              <NoteRow key={note.id} note={note} />
            ))}
          </ul>
        ) : null}
      </section>
      <NotesStatusWatcher
        isWatching={notes.some((note) => isNoteInProgress(note.status))}
      />
    </div>
  );
}
