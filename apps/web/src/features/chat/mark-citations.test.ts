import { expect, test } from "vitest";
import { markCitations } from "./mark-citations";

test("turns citation marks into chips", () => {
  expect(markCitations("Fits noise [1, 2].", [1, 2])).toBe(
    'Fits noise <cite-ref n="1"></cite-ref><cite-ref n="2"></cite-ref>.',
  );
});

test("leaves unknown numbers and code alone", () => {
  expect(markCitations("See [3] and `a[1]`", [1])).toBe("See [3] and `a[1]`");
});

test("marks citations between two dollar amounts", () => {
  expect(markCitations("The fee is $5 [1] and $10 for bulk [2].", [1, 2])).toBe(
    'The fee is $5 <cite-ref n="1"></cite-ref> and $10 for bulk <cite-ref n="2"></cite-ref>.',
  );
});

test("leaves maths alone", () => {
  expect(markCitations("Sum $x[1] + x[2]$ is shown [1].", [1, 2])).toBe(
    'Sum $x[1] + x[2]$ is shown <cite-ref n="1"></cite-ref>.',
  );
});
