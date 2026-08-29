import { reviewAnswer } from "@/lib/guardrails/review-answer";
import { readCitations } from "./citations";
import { writeAnswer, type DraftInput } from "./write-answer";

const hintNote =
  "Too much code: teach with hints and at most one short code block of under 25 lines.";

function reviewCited(input: DraftInput, draft: string) {
  const cited = readCitations(draft, input.passages);
  return reviewAnswer({
    question: input.question,
    answer: cited.answer,
    canaryWord: input.canaryWord,
    citedChunkIds: cited.citations.map((citation) => citation.chunkId),
    retrievedChunkIds: input.passages.map((passage) => passage.chunkId),
  }).then((review) => ({ cited, review }));
}

export async function reviewDraft(input: DraftInput, draft: string) {
  const first = await reviewCited(input, draft);
  if (first.review.action !== "rewrite_as_hints") return first;
  const hints = await writeAnswer({
    ...input,
    scope: "limited",
    previousDraft: first.cited.answer,
    revisionNotes: [hintNote],
  });
  return reviewCited(input, hints);
}
