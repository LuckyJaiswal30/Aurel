import { expect, test } from "vitest";
import { asksToLookUp, makeQuickPlan } from "./answer-generally";

test("only an explicit request sends a general question to Wikipedia", () => {
  expect(asksToLookUp("search the web for the latest ISRO launch")).toBe(true);
  expect(asksToLookUp("look it up on Wikipedia: Ramanujan")).toBe(true);
  expect(asksToLookUp("What is photosynthesis?")).toBe(false);
});

test("a short sum gets a quick, plain answer, not a worked solution", () => {
  const plan = makeQuickPlan("What is 2+2");
  expect(plan.format).toBe("explain");
  expect(plan.difficulty).toBe("easy");
});

test("a practice request still gets thinking and a worked solution", () => {
  const plan = makeQuickPlan(
    "Make me a practice question on integration and solve it",
  );
  expect(plan.format).toBe("practice");
  expect(plan.difficulty).toBe("hard");
});
