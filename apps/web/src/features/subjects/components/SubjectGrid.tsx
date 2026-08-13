import Link from "next/link";
import {
  describeExamDate,
  describeNotesCount,
  type SubjectSummary,
} from "@/lib/subjects/subject-summary";
import { NewSubjectDialog } from "./NewSubjectDialog";

type SubjectGridProps = {
  subjects: SubjectSummary[];
};

export function SubjectGrid({ subjects }: SubjectGridProps) {
  return (
    <div className="mx-auto w-full max-w-4xl py-6 md:py-10">
      <header className="flex items-center justify-between gap-4">
        <h1 className="font-serif text-2xl font-medium text-text">Subjects</h1>
        <NewSubjectDialog />
      </header>
      {subjects.length === 0 ? (
        <p className="mt-10 max-w-sm text-lg text-muted">
          Add the subjects you are studying. Each one keeps its own notes, chats
          and revision.
        </p>
      ) : (
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((subject) => (
            <li key={subject.id}>
              <Link
                href={`/subjects/${subject.id}`}
                className="flex h-full flex-col rounded-panel border border-line bg-surface p-4 transition-colors hover:bg-hover"
              >
                <span className="text-lg font-medium text-text">
                  {subject.name}
                </span>
                <span className="mt-0.5 text-sm text-muted">
                  {describeNotesCount(subject.notesCount)}
                </span>
                <span className="mt-5 text-xs text-muted">
                  {describeExamDate(subject.examDate, subject.daysUntilExam)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
