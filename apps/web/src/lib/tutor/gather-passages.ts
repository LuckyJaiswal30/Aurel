import { searchNotes } from "@/lib/knowledge/client";
import { lookUpWikipedia } from "@/lib/reference/wikipedia";
import { findEvidence, type Evidence } from "./find-evidence";
import { fromNotes, fromWikipedia, type Passage } from "./passages";
import type { QuestionPlan } from "./plan-question";

const passagesToRetrieve = 6;
const focusedPassages = 3;
const sectionsToCheck = 2;

type PassageRequest = {
  studentId: string;
  subjectId: string | null;
  question: string;
  plan: QuestionPlan;
};

export async function gatherPassages(request: PassageRequest) {
  const { plan } = request;
  const [notes, articles] = await Promise.all([
    request.subjectId
      ? searchNotes({
          studentId: request.studentId,
          subjectId: request.subjectId,
          question: request.question,
          queries: [
            plan.rewrittenQuery,
            plan.stepBackQuery,
            plan.hypotheticalAnswer,
          ],
          limit: passagesToRetrieve,
        })
      : Promise.resolve([]),
    lookUpWikipedia(
      plan.lookupTopics.length > 0 ? plan.lookupTopics : [plan.topic],
    ),
  ]);
  return [...fromNotes(notes), ...fromWikipedia(articles)];
}

export async function gatherEvidence(
  question: string,
  passages: Passage[],
  signal?: AbortSignal,
) {
  const found = await findEvidence(question, passages, signal);
  const hasNotes = passages[0]?.kind === "notes";
  return found.length > 0 || !hasNotes
    ? found
    : findEvidence(question, passages.slice(0, focusedPassages), signal);
}

export function chooseSource(evidence: Evidence[], passages: Passage[]) {
  const kinds = new Set(
    evidence.map((item) => passages[item.passageNumber - 1]?.kind),
  );
  if (kinds.has("notes")) return "notes";
  return kinds.has("wikipedia") ? "reference" : "general";
}

export function findCitedSections(evidence: Evidence[], passages: Passage[]) {
  const numbers = [...new Set(evidence.map((item) => item.passageNumber))];
  return numbers
    .map((number) => passages[number - 1])
    .filter((passage): passage is Passage => passage?.kind === "notes")
    .slice(0, sectionsToCheck)
    .map((passage) => `${passage.heading ?? ""}\n${passage.content}`);
}
