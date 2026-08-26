import { scorePromptAttack } from "@/lib/knowledge/client";
import { checkQuestionHarm } from "./check-harmful-content";
import { judgeScope } from "./judge-scope";
import { looksLikeAttack, needsCare } from "./match-patterns";

const promptAttackThreshold = 0.5;

export type QuestionClass =
  | { kind: "care"; layer: number }
  | { kind: "blocked"; layer: number; category: string }
  | { kind: "off_topic" }
  | { kind: "unclear" }
  | { kind: "error" }
  | { kind: "allowed"; scope: "study" | "brief" | "limited" };

export type ClassifyInput = {
  texts: string[];
  question: string;
  revealedText: string | null;
  recentQuestions: string[];
  subjectNames: string[];
};

export async function classifyQuestion(
  input: ClassifyInput,
): Promise<QuestionClass> {
  if (needsCare(input.texts)) return { kind: "care", layer: 3 };
  if (looksLikeAttack(input.texts))
    return { kind: "blocked", layer: 3, category: "prompt_attack" };

  const textForModels = input.revealedText
    ? `${input.question}\n\n(Decoded from disguised text: ${input.revealedText.slice(0, 2000)})`
    : input.question;
  const [attack, harm, scope] = await Promise.allSettled([
    scorePromptAttack(
      input.revealedText
        ? [input.question, input.revealedText]
        : [input.question],
    ),
    checkQuestionHarm(textForModels),
    judgeScope({
      question: textForModels,
      recentQuestions: input.recentQuestions,
      subjectNames: input.subjectNames,
    }),
  ]);
  const scopeLabel = scope.status === "fulfilled" ? scope.value.scope : null;
  const isAcademic = scopeLabel === "study" || scopeLabel === "limited";

  if (harm.status === "fulfilled" && harm.value === "care" && !isAcademic)
    return { kind: "care", layer: 3 };
  if (harm.status === "rejected" || scope.status === "rejected")
    return { kind: "error" };
  if (attack.status === "rejected")
    console.error("Prompt Guard is unavailable; other layers still apply");
  else if (attack.value >= promptAttackThreshold)
    return { kind: "blocked", layer: 3, category: "prompt_attack" };
  if (harm.value === "harmful")
    return { kind: "blocked", layer: 3, category: "harmful_content" };
  if (scope.value.scope === "exam_cheating")
    return { kind: "blocked", layer: 4, category: "exam_cheating" };
  if (scope.value.scope === "off_topic") return { kind: "off_topic" };
  if (scope.value.scope === "unclear") return { kind: "unclear" };
  return { kind: "allowed", scope: scope.value.scope };
}
