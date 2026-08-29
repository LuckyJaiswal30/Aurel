import type { FeedbackReason, PastFeedback } from "@/lib/db/feedback";

export type FeedbackLessons = {
  notes: string[];
  likedAnswers: Record<string, string>;
};

const recentCount = 10;
const likedAnswerLength = 1200;

function countReasons(feedback: PastFeedback[]) {
  const counts = new Map<FeedbackReason, number>();
  for (const item of feedback)
    for (const reason of item.reasons)
      counts.set(reason, (counts.get(reason) ?? 0) + 1);
  return (reason: FeedbackReason) => counts.get(reason) ?? 0;
}

function removeLabels(answer: string) {
  return answer
    .replace(/^> \*\*[^\n]*\n\n/, "")
    .replace(/\n\n\*\*Missing from your notes:\*\*[^\n]*$/, "")
    .replace(/\[\d+\]/g, "")
    .slice(0, likedAnswerLength);
}

function describeLessons(count: (reason: FeedbackReason) => number) {
  const notes: string[] = [];
  const longer = count("too_short") - count("too_long");
  if (longer < 0)
    notes.push(
      "They have said answers were too long: keep this one tighter, at the short end of the recipe.",
    );
  if (longer > 0)
    notes.push(
      "They have said answers were too short: add a little more detail and one more example.",
    );
  if (count("unclear") > count("clear"))
    notes.push(
      "They have found answers hard to follow: use shorter sentences, define each term and add an everyday analogy.",
    );
  if (count("not_from_notes") > 0)
    notes.push(
      "They want answers built from their own notes: lean on the evidence and cite it.",
    );
  if (count("wrong") > 0)
    notes.push(
      "They flagged an earlier answer as wrong: state only what the evidence supports and double-check every number.",
    );
  if (count("good_examples") > 0)
    notes.push("They like worked examples: include one.");
  return notes;
}

export function learnFromFeedback(feedback: PastFeedback[]): FeedbackLessons {
  const recent = feedback.slice(0, recentCount);
  const likedAnswers: Record<string, string> = {};
  for (const item of feedback) {
    if (item.rating !== 1 || !item.format || likedAnswers[item.format])
      continue;
    likedAnswers[item.format] = removeLabels(item.answer);
  }
  return { notes: describeLessons(countReasons(recent)), likedAnswers };
}
