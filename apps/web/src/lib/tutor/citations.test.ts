import { expect, test } from "vitest";
import type { Passage } from "./passages";
import { readCitations } from "./citations";

const passage = (chunkId: string, pageNumber: number): Passage => ({
  chunkId,
  documentId: "doc",
  fileName: "ml.pdf",
  pageNumber,
  heading: null,
  content: "text",
  score: 1,
  sectionId: "s",
  sectionContent: "text",
  sectionPageStart: pageNumber,
  sectionPageEnd: pageNumber,
  kind: "notes",
  url: null,
});

test("maps passage numbers to the chunks they came from", () => {
  const result = readCitations(
    "Overfitting fits noise [2]. Bias is error [1, 2].",
    [passage("a", 3), passage("b", 5)],
  );
  expect(result.citations.map((citation) => citation.chunkId)).toEqual([
    "a",
    "b",
  ]);
  expect(result.answer).toBe(
    "Overfitting fits noise [2]. Bias is error [1, 2].",
  );
});

test("removes citations to passages that were never retrieved", () => {
  const result = readCitations("Made-up claim [7].", [passage("a", 1)]);
  expect(result.answer).toBe("Made-up claim.");
  expect(result.citations).toEqual([]);
});

test("leaves code alone", () => {
  const answer = "Use `arr[1]` here:\n```python\nx[1] = arr[0]\n```";
  expect(readCitations(answer, [passage("a", 1)]).answer).toBe(answer);
});

test("an answer wrapped whole in a code block is unwrapped", async () => {
  const { unwrapWholeAnswer } = await import("./write-answer");
  const wrapped =
    '```python\n# Exam Answer\nanswer_text = """Goal agents reach a goal [1].\n\n**Conclusion:** done."""\n```';
  expect(unwrapWholeAnswer(wrapped)).toBe(
    "Goal agents reach a goal [1].\n\n**Conclusion:** done.",
  );
  const realCode = "```python\nprint(1)\n```";
  expect(unwrapWholeAnswer(realCode)).toBe(realCode);
});
