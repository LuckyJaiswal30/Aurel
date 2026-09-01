import type { CurrentStudent } from "@/lib/auth/current-student";
import { listRecentConversations } from "@/lib/db/conversations";
import { listSubjects } from "@/lib/db/subjects";
import { findNextExam } from "@/lib/subjects/subject-summary";
import type { GreetingFacts } from "./greeting-moment";

const dayMilliseconds = 24 * 60 * 60 * 1000;

export async function collectGreetingFacts(
  student: CurrentStudent,
  localTime: { hour: number; weekday: number },
): Promise<GreetingFacts> {
  const [subjects, conversations] = await Promise.all([
    listSubjects(),
    listRecentConversations(),
  ]);
  const nextExam = findNextExam(subjects);
  const lastChat = conversations[0];
  return {
    firstName: (student.displayName.split(" ")[0] ?? "").slice(0, 40),
    language: student.profile.preferredLanguage,
    hour: localTime.hour,
    weekday: localTime.weekday,
    nextExam: nextExam
      ? { subjectName: nextExam.name, daysLeft: nextExam.daysUntilExam ?? 0 }
      : null,
    lastSubjectName:
      subjects.find((subject) => subject.id === lastChat?.subjectId)?.name ??
      null,
    daysSinceLastChat: lastChat
      ? Math.floor(
          (Date.now() - Date.parse(lastChat.updatedAt)) / dayMilliseconds,
        )
      : null,
  };
}
