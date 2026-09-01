import { expect, test } from "vitest";
import { formatMathAnswer } from "./format-math";

test("display maths inside a numbered step stays in that step on its own line", () => {
  const input =
    "**Solution**\n1. Divide.\n$$t = \\frac{d}{s}$$\n2. Convert.\n$$t = 7.5$$";
  expect(formatMathAnswer(input)).toBe(
    "**Solution**\n\n1. Divide.\n\n   $$\n   t = \\frac{d}{s}\n   $$\n\n2. Convert.\n\n   $$\n   t = 7.5\n   $$",
  );
});

test("bold headings get their own paragraph", () => {
  expect(
    formatMathAnswer("**Question**\nFind x.\n\n**Answer**\n$$\\boxed{x = 2}$$"),
  ).toBe("**Question**\n\nFind x.\n\n**Answer**\n\n$$\n\\boxed{x = 2}\n$$");
});

test("multi-line aligned blocks are kept together", () => {
  const input =
    "1. Expand.\n$$\\begin{aligned}\na &= b \\\\\n&= c\n\\end{aligned}$$\nDone.";
  expect(formatMathAnswer(input)).toBe(
    "1. Expand.\n\n   $$\n   \\begin{aligned}\n   a &= b \\\\\n   &= c\n   \\end{aligned}\n   $$\n\nDone.",
  );
});

test("inline maths and plain text are left alone", () => {
  const input = "The value $x = 2$ works.\nNext line.";
  expect(formatMathAnswer(input)).toBe(input);
});

test("a citation after display maths joins the line before it", () => {
  expect(formatMathAnswer("**Formula**\n$$t = d/s$$ [1]")).toBe(
    "**Formula** [1]\n\n$$\nt = d/s\n$$",
  );
});
