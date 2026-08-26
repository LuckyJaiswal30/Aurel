import { recordGuardrailEvent, type GuardrailEvent } from "@/lib/db/guardrails";
import { classifyQuestion, type QuestionClass } from "./classify-question";
import { cleanInput, maxQuestionCharacters } from "./clean-input";
import { chargeExtraForMisuse, enforceLimits } from "./enforce-limits";
import { guardMessages } from "./guard-messages";
import { needsCare } from "./match-patterns";
import { writeRedirect, type RedirectKind } from "./write-redirect";
import type { AnswerLanguage } from "@/lib/db/profiles";

export type QuestionCheckInput = {
  studentId: string;
  ipAddress: string | null;
  question: string;
  recentQuestions: string[];
  subjectNames: string[];
  currentSubjectName: string | null;
  language: AnswerLanguage;
};

export type QuestionCheck =
  | {
      verdict: "allowed";
      question: string;
      scope: "study" | "brief" | "limited";
    }
  | {
      verdict: "stopped";
      kind: "limit" | "care" | "blocked" | "off_topic" | "unclear" | "error";
      message: string;
    };

async function redirectFor(
  kind: RedirectKind,
  input: QuestionCheckInput,
  question: string,
  fallback: string,
) {
  const reply = await writeRedirect({
    kind,
    question,
    subjectName: input.currentSubjectName,
    language: input.language,
  }).catch(() => null);
  return reply ?? fallback;
}

async function block(
  input: QuestionCheckInput,
  question: string,
  event: Omit<GuardrailEvent, "outcome" | "isStrike">,
) {
  const [result, reply] = await Promise.all([
    recordGuardrailEvent(input.studentId, {
      ...event,
      outcome: "blocked",
      isStrike: true,
    }),
    redirectFor("blocked", input, question, guardMessages.blocked),
    chargeExtraForMisuse(input.studentId),
  ]);
  const message =
    result.strikesToday >= 2
      ? `${reply} ${guardMessages.strikeWarning}`
      : reply;
  return { verdict: "stopped", kind: "blocked", message } as const;
}

async function giveCare(studentId: string, layer: number) {
  await recordGuardrailEvent(studentId, {
    layer,
    outcome: "care",
    category: "distress",
    isStrike: false,
  }).catch(() => undefined);
  return {
    verdict: "stopped",
    kind: "care",
    message: guardMessages.care,
  } as const;
}

export async function checkQuestion(
  input: QuestionCheckInput,
): Promise<QuestionCheck> {
  const cleaned = cleanInput(input.question);
  if (needsCare(cleaned.textsToCheck)) return giveCare(input.studentId, 3);
  if (input.question.length > maxQuestionCharacters)
    return {
      verdict: "stopped",
      kind: "limit",
      message: guardMessages.tooLong,
    };
  const limit = await enforceLimits(input.studentId, input.ipAddress);
  if (!limit.isAllowed)
    return { verdict: "stopped", kind: "limit", message: limit.message };

  let classified: QuestionClass;
  try {
    classified = await classifyQuestion({
      texts: cleaned.textsToCheck,
      question: cleaned.text,
      revealedText: cleaned.revealedText,
      recentQuestions: input.recentQuestions.map(
        (turn) => cleanInput(turn).text,
      ),
      subjectNames: input.subjectNames,
    });
  } catch {
    return {
      verdict: "stopped",
      kind: "error",
      message: guardMessages.checkFailed,
    };
  }

  if (classified.kind === "error")
    return {
      verdict: "stopped",
      kind: "error",
      message: guardMessages.checkFailed,
    };
  if (classified.kind === "care")
    return giveCare(input.studentId, classified.layer);
  if (classified.kind === "blocked")
    return block(input, cleaned.text, {
      layer: classified.layer,
      category: classified.category,
    });
  if (classified.kind === "off_topic") {
    await recordGuardrailEvent(input.studentId, {
      layer: 4,
      outcome: "redirected",
      category: "off_topic",
      isStrike: false,
    });
    await chargeExtraForMisuse(input.studentId);
    return {
      verdict: "stopped",
      kind: "off_topic",
      message: await redirectFor(
        "off_topic",
        input,
        cleaned.text,
        guardMessages.offTopic(input.currentSubjectName),
      ),
    };
  }
  if (classified.kind === "unclear")
    return {
      verdict: "stopped",
      kind: "unclear",
      message: await redirectFor(
        "unclear",
        input,
        cleaned.text,
        guardMessages.unclear,
      ),
    };
  return {
    verdict: "allowed",
    question: cleaned.text,
    scope: classified.scope,
  };
}
