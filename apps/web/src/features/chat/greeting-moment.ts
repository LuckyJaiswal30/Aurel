import type { AnswerLanguage } from "@/lib/db/profiles";

export type GreetingFacts = {
  firstName: string;
  language: AnswerLanguage;
  hour: number;
  weekday: number;
  nextExam: { subjectName: string; daysLeft: number } | null;
  lastSubjectName: string | null;
  daysSinceLastChat: number | null;
};

export type GreetingMoment =
  | "exam_today"
  | "exam_tomorrow"
  | "late_night"
  | "early_morning"
  | "first_visit"
  | "returning"
  | "exam_soon"
  | "weekend"
  | "morning"
  | "afternoon"
  | "evening"
  | "night";

function chooseTimeOfDay(hour: number): GreetingMoment {
  if (hour < 4) return "late_night";
  if (hour < 7) return "early_morning";
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  if (hour < 21) return "evening";
  return "night";
}

export function chooseGreetingMoment(facts: GreetingFacts): GreetingMoment {
  const daysLeft = facts.nextExam?.daysLeft ?? null;
  if (daysLeft === 0) return "exam_today";
  if (daysLeft === 1) return "exam_tomorrow";
  const timeOfDay = chooseTimeOfDay(facts.hour);
  if (timeOfDay === "late_night" || timeOfDay === "early_morning")
    return timeOfDay;
  if (facts.daysSinceLastChat === null) return "first_visit";
  if (facts.daysSinceLastChat >= 4) return "returning";
  if (daysLeft !== null && daysLeft <= 7) return "exam_soon";
  const isWeekend = facts.weekday === 0 || facts.weekday === 6;
  if (isWeekend && timeOfDay !== "night") return "weekend";
  return timeOfDay;
}

export function describeLocalTime(hour: number) {
  const suffix = hour < 12 ? "AM" : "PM";
  return `${hour % 12 === 0 ? 12 : hour % 12} ${suffix}`;
}
