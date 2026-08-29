import { countDaysUntil, todayInIndia } from "@/lib/dates/days-until";
import type { StudentProfile } from "@/lib/db/profiles";
import type { FeedbackLessons } from "./learn-from-feedback";

export type StudentContext = {
  profile: StudentProfile;
  subjectName: string;
  examDate: string | null;
  lessons?: FeedbackLessons;
};

const levelNotes = {
  simpler:
    "Explain simply, with an everyday analogy, and avoid jargon until it is defined.",
  standard: "Explain at a normal undergraduate level.",
  deeper: "Go a step deeper: precise terms, edge cases and why it works.",
} as const;

export const languageNotes = {
  english: "Write in English.",
  hindi:
    "Write in Hindi (Devanagari). Keep technical terms in English, for example सामान्यीकरण (normalization).",
  hinglish:
    "Write in Hinglish: Hindi written in the Latin alphabet, mixed naturally with English technical terms, like a friendly senior explaining. This includes headings and table cells.",
} as const;

export function describeStudent(context: StudentContext) {
  const { profile } = context;
  const lines = [
    `Subject: ${context.subjectName}.`,
    profile.course
      ? `Course: ${profile.course}${profile.studyYear ? `, year ${profile.studyYear}` : ""}.`
      : null,
    context.examDate
      ? `Exam in ${Math.max(0, countDaysUntil(context.examDate, todayInIndia()))} days.`
      : null,
    levelNotes[profile.explanationLevel],
    languageNotes[profile.preferredLanguage],
    context.lessons?.notes.length
      ? `From their feedback on earlier answers:\n${context.lessons.notes.map((note) => `- ${note}`).join("\n")}`
      : null,
  ];
  return lines.filter(Boolean).join("\n");
}
