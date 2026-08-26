import { checkAnswerHarm } from "./check-harmful-content";
import {
  containsPersonalDetails,
  findUnknownCitations,
  isWithinCodeLimit,
  leaksCanary,
} from "./check-answer";

export type AnswerProblem =
  | "canary_leak"
  | "harmful"
  | "personal_details"
  | "unknown_citation"
  | "too_much_code";

export type AnswerReview = {
  problems: AnswerProblem[];
  action: "show" | "rewrite_as_hints" | "replace";
};

export type AnswerReviewInput = {
  question: string;
  answer: string;
  canaryWord: string;
  citedChunkIds: string[];
  retrievedChunkIds: string[];
};

const replaceProblems: AnswerProblem[] = [
  "canary_leak",
  "harmful",
  "personal_details",
];

export async function reviewAnswer(
  input: AnswerReviewInput,
): Promise<AnswerReview> {
  const problems: AnswerProblem[] = [];
  if (leaksCanary(input.answer, input.canaryWord)) problems.push("canary_leak");
  if (containsPersonalDetails(input.answer)) problems.push("personal_details");
  if (
    findUnknownCitations(input.citedChunkIds, input.retrievedChunkIds).length >
    0
  )
    problems.push("unknown_citation");
  if (!isWithinCodeLimit(input.answer)) problems.push("too_much_code");
  if ((await checkAnswerHarm(input.question, input.answer)) === "harmful")
    problems.push("harmful");

  if (problems.some((problem) => replaceProblems.includes(problem)))
    return { problems, action: "replace" };
  if (problems.length > 0) return { problems, action: "rewrite_as_hints" };
  return { problems, action: "show" };
}
