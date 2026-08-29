import type { TutorAnswer, TutorQuestion } from "./answer-question";
import { checkDraft, isDraftAcceptable } from "./check-draft";
import { languageNotes } from "./describe-student";
import type { Evidence } from "./find-evidence";
import { hasMissingTopic, labelAnswer } from "./label-answer";
import { reviewDraft } from "./review-draft";
import { writeAnswer, type DraftInput } from "./write-answer";

const unsafeAnswerMessage =
  "I couldn't put together a safe answer to that. Try asking it another way, or ask about one part at a time.";

type FinishOptions = {
  shouldCheck: boolean;
  evidence?: Evidence[];
  noteSections?: string[];
  timings?: Record<string, number>;
};

async function checkAndRevise(
  input: TutorQuestion,
  draftInput: DraftInput,
  draft: string,
  options: FinishOptions,
) {
  const listener = input.listener;
  input.onStep?.("check");
  listener?.onNote?.("Double-checking the answer and recomputing any numbers");
  const check = await checkDraft({
    question: draftInput.question,
    draft,
    plan: draftInput.plan,
    evidence: options.evidence ?? [],
    noteSections: options.noteSections ?? [],
    languageNote: languageNotes[input.context.profile.preferredLanguage],
    signal: listener?.signal,
  });
  if (isDraftAcceptable(check)) {
    listener?.onNote?.("The check passed");
    return { draft, check, wasRevised: false };
  }
  input.onStep?.("revise");
  listener?.onNote?.(
    `Fixing what the check found: ${check.problems.join("; ")}`,
  );
  const revised = await writeAnswer({
    ...draftInput,
    isDraftVisible: false,
    previousDraft: draft,
    revisionNotes: check.problems,
  });
  return { draft: revised, check, wasRevised: true };
}

export async function finishAnswer(
  input: TutorQuestion,
  draftInput: DraftInput,
  firstDraft: string,
  options: FinishOptions = { shouldCheck: false },
): Promise<TutorAnswer> {
  const checked = options.shouldCheck
    ? await checkAndRevise(input, draftInput, firstDraft, options)
    : { draft: firstDraft, check: null, wasRevised: false };
  input.onStep?.("review");
  input.listener?.onNote?.("Running the final safety checks");
  const { cited, review } = await reviewDraft(draftInput, checked.draft);
  if (review.action !== "show")
    return { kind: "clarify", message: unsafeAnswerMessage };
  const { plan, source } = draftInput;
  const isGlobal = draftInput.isGlobal ?? false;
  return {
    kind: "answer",
    markdown: labelAnswer({ answer: cited.answer, source, plan, isGlobal }),
    source,
    format: plan.format,
    citations: cited.citations,
    missingTopic: hasMissingTopic(source, plan, isGlobal) ? plan.topic : null,
    wasRevised: checked.wasRevised,
    checkProblems: checked.check?.problems ?? [],
    timings: options.timings ?? {},
  };
}
