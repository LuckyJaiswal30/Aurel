import type { GreetingFacts, GreetingMoment } from "./greeting-moment";
import { describeLocalTime } from "./greeting-moment";

const greetingLines: Record<GreetingMoment, string[]> = {
  exam_today: [
    "{subject} exam today. You've got this, {name}.",
    "Big day, {name}. Quick warm-up?",
    "Exam day, {name}. One calm review?",
  ],
  exam_tomorrow: [
    "{subject} tomorrow. What feels shaky?",
    "One day to go, {name}. Where first?",
    "Exam tomorrow, {name}. Let's tighten up.",
  ],
  late_night: [
    "Still up at {time}, {name}?",
    "It's {time}, {name}. What's on your mind?",
    "Late one tonight, {name}?",
    "{time} and still going, {name}?",
  ],
  early_morning: [
    "Up early, {name}. What's first?",
    "Early start, {name}. Fresh mind.",
    "Morning, {name}. What shall we cover?",
  ],
  first_visit: [
    "Welcome to Aurel, {name}.",
    "Hi {name}. What are you studying?",
  ],
  returning: [
    "Good to see you again, {name}.",
    "Welcome back, {name}.",
    "Back for more, {name}?",
  ],
  exam_soon: [
    "{days} days to {subject}, {name}.",
    "{subject} is close. Which topic first?",
    "Counting down to {subject}, {name}.",
  ],
  weekend: [
    "Weekend study, {name}?",
    "A calm weekend for revision, {name}.",
    "Weekend, {name}. Go deeper today?",
  ],
  morning: [
    "Good morning, {name}.",
    "Morning, {name}. What's on today?",
    "Good morning, {name}. Ready?",
  ],
  afternoon: [
    "Good afternoon, {name}.",
    "Afternoon, {name}. What shall we learn?",
    "Hi {name}. What's on your mind?",
  ],
  evening: [
    "Good evening, {name}.",
    "Evening, {name}. A short session?",
    "Hi {name}. How did today go?",
  ],
  night: [
    "Late session, {name}?",
    "Night owl mode, {name}.",
    "One more topic before bed, {name}?",
  ],
};

function fillLine(line: string, facts: GreetingFacts) {
  return line
    .replaceAll("{name}", facts.firstName)
    .replaceAll("{time}", describeLocalTime(facts.hour))
    .replaceAll("{days}", String(facts.nextExam?.daysLeft ?? ""))
    .replaceAll(
      "{subject}",
      facts.nextExam?.subjectName ?? facts.lastSubjectName ?? "",
    );
}

export function pickGreetingLine(
  moment: GreetingMoment,
  facts: GreetingFacts,
  random = Math.random,
) {
  const hasSubject = Boolean(facts.nextExam ?? facts.lastSubjectName);
  const lines = greetingLines[moment].filter(
    (line) => hasSubject || !line.includes("{subject}"),
  );
  const fallback = `Hi ${facts.firstName}. What are we studying today?`;
  const line = lines[Math.floor(random() * lines.length)];
  return line ? fillLine(line, facts) : fallback;
}
