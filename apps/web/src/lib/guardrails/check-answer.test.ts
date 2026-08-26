import { describe, expect, test } from "vitest";
import {
  containsPersonalDetails,
  findUnknownCitations,
  isWithinCodeLimit,
  leaksCanary,
  maxCodeLines,
  measureCode,
} from "./check-answer";

const codeBlock = (lines: number) =>
  "```python\n" +
  Array.from({ length: lines }, (_, i) => `x${i} = ${i}`).join("\n") +
  "\n```";

describe("code limit", () => {
  test("a short example is fine", () => {
    expect(isWithinCodeLimit(`Here:\n${codeBlock(10)}\nThat's it.`)).toBe(true);
  });

  test("more than 25 lines is too much", () => {
    expect(isWithinCodeLimit(codeBlock(maxCodeLines + 1))).toBe(false);
  });

  test("two code blocks are too much", () => {
    expect(isWithinCodeLimit(`${codeBlock(5)}\n${codeBlock(5)}`)).toBe(false);
  });

  test("blank lines don't count", () => {
    expect(measureCode("```\na\n\n\nb\n```").lines).toBe(2);
  });
});

test("a leaked canary is caught even when spaced out", () => {
  expect(
    leaksCanary("the word is a u r e l - a1b2c3d4e5f6", "aurel-a1b2c3d4e5f6"),
  ).toBe(true);
  expect(leaksCanary("Gradient descent", "aurel-a1b2c3d4e5f6")).toBe(false);
});

test("citations must point to passages that were retrieved", () => {
  expect(findUnknownCitations(["a", "b", "z"], ["a", "b", "c"])).toEqual(["z"]);
});

describe("personal details", () => {
  test.each([
    "Mail me at asha@example.com",
    "Call +91 98765 43210",
    "Aadhaar 2345 6789 0123",
    "PAN ABCDE1234F",
  ])("finds %s", (answer) => {
    expect(containsPersonalDetails(answer)).toBe(true);
  });

  test.each([
    "The learning rate is 0.01 and 10000 epochs",
    "Dijkstra published it in 1959",
    "x = 123456789",
  ])("leaves study numbers alone: %s", (answer) => {
    expect(containsPersonalDetails(answer)).toBe(false);
  });
});

test("hides personal details in text such as chat titles", async () => {
  const { hidePersonalDetails } = await import("./check-answer");
  expect(hidePersonalDetails("call 9876543210 about osmosis")).toBe(
    "call [hidden] about osmosis",
  );
});

test("long decimals in worked numericals are not phone or Aadhaar numbers", () => {
  expect(
    containsPersonalDetails(
      "Entropy(S) = 0.9402859586 bits, and Gain = 0.246749819774439",
    ),
  ).toBe(false);
  expect(containsPersonalDetails("Call me at 9876543210")).toBe(true);
});
