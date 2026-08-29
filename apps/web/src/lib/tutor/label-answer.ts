import type { QuestionPlan } from "./plan-question";
import type { AnswerSource } from "./write-answer";

type LabelInput = {
  answer: string;
  source: AnswerSource;
  plan: QuestionPlan;
  isGlobal: boolean;
};

function describeMissingTopic(topic: string) {
  return `**Missing from your notes:** ${topic}. Add notes on it so I can cite them next time.`;
}

export function labelAnswer({ answer, source, plan, isGlobal }: LabelInput) {
  if (source === "notes" || plan.format === "practice") return answer;
  if (isGlobal)
    return source === "reference"
      ? `> **From Wikipedia.** Check it against your syllabus.\n\n${answer}`
      : answer;
  if (source === "reference")
    return `> **From Wikipedia, not your notes.** Check it against your syllabus.\n\n${answer}\n\n${describeMissingTopic(plan.topic)}`;
  return `> **This isn't in your notes.** Here's the standard explanation; check it against your syllabus.\n\n${answer}\n\n${describeMissingTopic(plan.topic)}`;
}

export function hasMissingTopic(
  source: AnswerSource,
  plan: QuestionPlan,
  isGlobal: boolean,
) {
  return source !== "notes" && plan.format !== "practice" && !isGlobal;
}
