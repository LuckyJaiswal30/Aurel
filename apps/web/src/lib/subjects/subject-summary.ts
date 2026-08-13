import type { SubjectSummary } from "@/lib/db/subjects";

export type { SubjectSummary };

export function describeExamDate(
  examDate: string | null,
  daysUntilExam: number | null,
) {
  if (!examDate || daysUntilExam === null) return "No exam date yet";
  const formatted = new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
  }).format(new Date(`${examDate}T00:00:00`));
  if (daysUntilExam < 0) return `Exam was on ${formatted}`;
  if (daysUntilExam === 0) return `Exam today, ${formatted}`;
  if (daysUntilExam === 1) return `Exam tomorrow, ${formatted}`;
  return `Exam in ${daysUntilExam} days, ${formatted}`;
}

export function describeNotesCount(notesCount: number) {
  if (notesCount === 0) return "No notes yet";
  return notesCount === 1 ? "1 file" : `${notesCount} files`;
}

export function findNextExam(subjects: SubjectSummary[]) {
  return subjects
    .filter(
      (subject) => subject.daysUntilExam !== null && subject.daysUntilExam >= 0,
    )
    .sort(
      (first, second) =>
        (first.daysUntilExam ?? 0) - (second.daysUntilExam ?? 0),
    )[0];
}

export function describeNextExam(subject: SubjectSummary) {
  if (subject.daysUntilExam === 0)
    return `${subject.name} exam is today. You've got this.`;
  if (subject.daysUntilExam === 1) return `${subject.name} exam is tomorrow.`;
  return `${subject.name} exam in ${subject.daysUntilExam} days.`;
}
