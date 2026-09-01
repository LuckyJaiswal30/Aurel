import { expect, test } from "vitest";
import { cleanGreeting } from "./write-greeting";

test("keeps one clean line and drops wrapping quotes", () => {
  expect(cleanGreeting('"Still up, Asha? What\'s on your mind?"\nExtra')).toBe(
    "Still up, Asha? What's on your mind?",
  );
});

test("rejects links, markup and lines that are too short or long", () => {
  expect(cleanGreeting("Visit https://example.com now")).toBeNull();
  expect(cleanGreeting("**Hello** there, Asha")).toBeNull();
  expect(cleanGreeting("Hi")).toBeNull();
  expect(cleanGreeting("word ".repeat(40))).toBeNull();
});
