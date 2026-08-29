import { expect, test } from "vitest";
import { chooseFormat } from "./choose-format";

test.each([
  ["Give the PEAS description of an automated taxi. (5 marks)", "exam_5"],
  ["Explain Bayesian networks with an example. (10 marks)", "exam_10"],
  ["Differentiate forward and backward chaining. (2 marks)", "exam_2"],
  [
    "utility based agent aur goal based agent me kya difference hai?",
    "compare",
  ],
  ["बैगिंग और बूस्टिंग में क्या अंतर है?", "compare"],
  ["Compare L1 and L2 regularisation.", "compare"],
  ["A classifier has TP = 40, FP = 10. Calculate accuracy.", "steps"],
  ["Run k-means with k = 2 on the points 1, 2, 10, 11", "steps"],
  ["Quiz me on Bayes' theorem", "quiz"],
] as const)("%s is answered as %s", (question, format) => {
  expect(chooseFormat(question, "explain")).toBe(format);
});

test("falls back to the plan when no rule matches", () => {
  expect(chooseFormat("What is a rational agent?", "explain")).toBe("explain");
});

test("asking for a made-up question to solve picks practice", () => {
  for (const question of [
    "show me one sample question with its answer step by step",
    "Make me a practice problem on integration and solve it",
    "give me a question on Bayes theorem and solve it",
    "create a new numerical on propagation delay",
  ])
    expect(chooseFormat(question, "explain")).toBe("practice");
});
