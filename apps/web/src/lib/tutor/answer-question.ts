import { makeCanaryWord } from "@/lib/guardrails/canary";
import { answerGenerally } from "./answer-generally";
import { chooseFormat } from "./choose-format";
import type { Citation } from "./citations";
import { describeStudent, type StudentContext } from "./describe-student";
import { finishAnswer } from "./finish-answer";
import {
  chooseSource,
  findCitedSections,
  gatherEvidence,
  gatherPassages,
} from "./gather-passages";
import type { Passage } from "./passages";
import { planQuestion, type AnswerFormat } from "./plan-question";
import type { TutorListener } from "./tutor-listener";
import {
  writeAnswer,
  type AnswerSource,
  type DraftInput,
} from "./write-answer";

export type TutorAnswer =
  | { kind: "clarify"; message: string }
  | {
      kind: "answer";
      markdown: string;
      source: AnswerSource;
      format: AnswerFormat;
      citations: Citation[];
      missingTopic: string | null;
      wasRevised: boolean;
      checkProblems: string[];
      timings: Record<string, number>;
    };

export type TutorStep =
  "plan" | "search" | "evidence" | "write" | "check" | "revise" | "review";

export type TutorQuestion = {
  onStep?: (step: TutorStep) => void;
  listener?: TutorListener;
  studentId: string;
  subjectId: string | null;
  question: string;
  conversation?: string;
  scope: "study" | "brief" | "limited";
  context: StudentContext;
};

const formatNames: Record<AnswerFormat, string> = {
  explain: "an explanation",
  steps: "a step-by-step solution",
  exam_2: "a 2-mark answer",
  exam_5: "a 5-mark answer",
  exam_10: "a 10-mark answer",
  compare: "a comparison",
  quiz: "a quiz",
  practice: "a practice question to make up and solve",
};

async function makePlan(input: TutorQuestion) {
  const draftPlan = await planQuestion(
    input.question,
    input.conversation,
    input.listener?.signal,
  );
  const question = draftPlan.standaloneQuestion.trim() || input.question;
  const format = chooseFormat(
    input.question,
    chooseFormat(question, draftPlan.format),
  );
  return { plan: { ...draftPlan, format }, question };
}

function describePassages(passages: Passage[]) {
  const notes = passages.filter((passage) => passage.kind === "notes");
  const headings = notes
    .slice(0, 3)
    .map((passage) => passage.heading?.split(" > ").pop() ?? passage.fileName);
  return notes.length > 0
    ? `Found ${notes.length} matching parts of your notes: ${headings.join(", ")}`
    : "Your notes don't seem to cover this";
}

export async function answerQuestion(
  input: TutorQuestion,
): Promise<TutorAnswer> {
  if (input.subjectId === null) return answerGenerally(input);
  const { listener } = input;
  input.onStep?.("plan");
  const { plan, question } = await makePlan(input);
  if (!plan.isClear && plan.clarifyingQuestion)
    return { kind: "clarify", message: plan.clarifyingQuestion };
  listener?.onNote?.(
    `Understood as: "${question.slice(0, 160)}", so writing ${formatNames[plan.format]}`,
  );

  input.onStep?.("search");
  listener?.onNote?.(`Searching your notes for "${plan.rewrittenQuery}"`);
  const passages = await gatherPassages({ ...input, question, plan });
  listener?.onNote?.(describePassages(passages));
  input.onStep?.("evidence");
  const evidence = await gatherEvidence(question, passages, listener?.signal);
  listener?.onNote?.(
    evidence.length > 0
      ? `Picked ${evidence.length} exact lines to build the answer on`
      : "No exact lines to quote, so answering from general knowledge",
  );
  const source = chooseSource(evidence, passages);
  const draftInput: DraftInput = {
    question,
    plan,
    scope: input.scope,
    source,
    passages: source === "general" ? [] : passages,
    evidence,
    studentDescription: describeStudent(input.context),
    canaryWord: makeCanaryWord(),
    likedExample: input.context.lessons?.likedAnswers[plan.format],
    isDraftVisible: false,
    listener,
  };
  input.onStep?.("write");
  listener?.onNote?.("Writing the answer");
  const draft = await writeAnswer(draftInput);
  return finishAnswer(input, draftInput, draft, {
    shouldCheck: true,
    evidence,
    noteSections:
      plan.format === "practice"
        ? []
        : findCitedSections(evidence, draftInput.passages),
  });
}
