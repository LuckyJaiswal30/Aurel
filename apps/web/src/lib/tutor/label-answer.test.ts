import { expect, test } from "vitest";
import { labelAnswer } from "./label-answer";
import type { QuestionPlan } from "./plan-question";

const plan = { format: "explain", topic: "Q-learning" } as QuestionPlan;

test("subject chats say what is missing from the notes", () => {
  const answer = labelAnswer({
    answer: "A",
    source: "general",
    plan,
    isGlobal: false,
  });
  expect(answer).toContain("isn't in your notes");
  expect(answer).toContain("Missing from your notes:** Q-learning");
});

test("general chats never mention the notes", () => {
  expect(
    labelAnswer({ answer: "A", source: "general", plan, isGlobal: true }),
  ).toBe("A");
  expect(
    labelAnswer({ answer: "A", source: "reference", plan, isGlobal: true }),
  ).not.toContain("notes");
});

test("practice questions are not labelled as missing", () => {
  expect(
    labelAnswer({
      answer: "A",
      source: "general",
      plan: { ...plan, format: "practice" },
      isGlobal: false,
    }),
  ).toBe("A");
});
