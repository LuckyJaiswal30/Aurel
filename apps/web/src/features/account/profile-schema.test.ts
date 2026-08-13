import { expect, test } from "vitest";
import { displayNameSchema, studyProfileSchema } from "./profile-schema";

test("empty optional study fields become null", () => {
  expect(
    studyProfileSchema.parse({
      course: " ",
      studyYear: "",
      preferredLanguage: "hinglish",
      explanationLevel: "simpler",
    }),
  ).toEqual({
    course: null,
    studyYear: null,
    preferredLanguage: "hinglish",
    explanationLevel: "simpler",
  });
});

test("rejects unknown languages and out-of-range years", () => {
  const base = { course: "", explanationLevel: "standard" };
  expect(
    studyProfileSchema.safeParse({
      ...base,
      studyYear: "9",
      preferredLanguage: "english",
    }).success,
  ).toBe(false);
  expect(
    studyProfileSchema.safeParse({
      ...base,
      studyYear: "2",
      preferredLanguage: "french",
    }).success,
  ).toBe(false);
});

test("names are trimmed and required", () => {
  expect(displayNameSchema.parse("  Asha ")).toBe("Asha");
  expect(displayNameSchema.safeParse("   ").success).toBe(false);
});
