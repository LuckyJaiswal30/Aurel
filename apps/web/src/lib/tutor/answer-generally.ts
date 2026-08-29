import { lookUpWikipedia } from "@/lib/reference/wikipedia";
import type { TutorAnswer, TutorQuestion } from "./answer-question";
import { chooseFormat } from "./choose-format";
import { describeStudent } from "./describe-student";
import { finishAnswer } from "./finish-answer";
import { fromWikipedia } from "./passages";
import type { QuestionPlan } from "./plan-question";
import type { TutorListener } from "./tutor-listener";
import { lookupMarker, writeAnswer, type DraftInput } from "./write-answer";
import { makeCanaryWord } from "@/lib/guardrails/canary";

const lookupRequest =
  /\b(search|look\s*(it\s*)?up|google|browse|check)\b[^.?!]{0,40}\b(web|internet|online|wikipedia)\b|\bwikipedia\b/i;
const shortArithmetic =
  /^[\s\w?]{0,20}[\d.\s()]+([+\-*/×÷^x][\d.\s()]+)+\s*\??$/i;
const quickLength = 160;

export function asksToLookUp(question: string) {
  return lookupRequest.test(question);
}

export function makeQuickPlan(question: string): QuestionPlan {
  const isArithmetic = shortArithmetic.test(question.trim());
  const format = isArithmetic ? "explain" : chooseFormat(question, "explain");
  const isHard = ["steps", "practice", "compare"].includes(format);
  return {
    standaloneQuestion: question,
    format,
    difficulty: isHard ? "hard" : "easy",
    topic: question.slice(0, 120),
    rewrittenQuery: question.slice(0, 300),
    stepBackQuery: "",
    hypotheticalAnswer: "",
    lookupTopics: [],
    isClear: true,
    clarifyingQuestion: "",
  };
}

function holdBackLookup(listener: TutorListener | undefined): TutorListener {
  let held = "";
  let isDecided = false;
  return {
    ...listener,
    onDraft: (text, isVisible) => {
      if (isDecided) return listener?.onDraft?.(text, isVisible);
      held += text;
      if (held.trimStart().length < lookupMarker.length) return;
      isDecided = true;
      if (!held.trimStart().startsWith(lookupMarker))
        listener?.onDraft?.(held, isVisible);
    },
  };
}

function readLookupTopic(draft: string) {
  const line = draft.trim();
  return line.startsWith(lookupMarker)
    ? line.slice(lookupMarker.length).trim().slice(0, 120) || null
    : null;
}

function finishOptions(draftInput: DraftInput) {
  const hasWorking = ["steps", "practice"].includes(draftInput.plan.format);
  return { shouldCheck: hasWorking && !draftInput.isQuick };
}

export async function answerGenerally(
  input: TutorQuestion,
): Promise<TutorAnswer> {
  const listener = input.listener;
  const plan = makeQuickPlan(input.question);
  const base: DraftInput = {
    question: input.conversation
      ? `${input.question}\n\nEarlier in this chat:\n${input.conversation}`
      : input.question,
    plan,
    scope: input.scope,
    source: "general",
    passages: [],
    evidence: [],
    studentDescription: describeStudent(input.context),
    canaryWord: makeCanaryWord(),
    isGlobal: true,
    isQuick: plan.difficulty === "easy" && input.question.length <= quickLength,
    isDraftVisible: true,
    listener,
  };

  input.onStep?.("write");
  let lookupTopic = asksToLookUp(input.question) ? input.question : null;
  if (!lookupTopic) {
    listener?.onNote?.("Answering from what I already know");
    const draft = await writeAnswer({
      ...base,
      allowLookup: true,
      listener: holdBackLookup(listener),
    });
    lookupTopic = readLookupTopic(draft);
    if (!lookupTopic)
      return finishAnswer(input, base, draft, finishOptions(base));
    listener?.onNote?.(`Not sure enough, so looking up "${lookupTopic}"`);
  } else
    listener?.onNote?.("You asked me to look it up, so searching Wikipedia");

  const passages = fromWikipedia(await lookUpWikipedia([lookupTopic]));
  listener?.onNote?.(
    passages.length > 0
      ? `Reading Wikipedia: ${passages.map((passage) => passage.heading).join(", ")}`
      : "Wikipedia had nothing useful, so answering from what I know",
  );
  const lookedUp: DraftInput = {
    ...base,
    source: passages.length > 0 ? "reference" : "general",
    passages,
    isQuick: false,
  };
  const draft = await writeAnswer(lookedUp);
  return finishAnswer(input, lookedUp, draft, finishOptions(lookedUp));
}
