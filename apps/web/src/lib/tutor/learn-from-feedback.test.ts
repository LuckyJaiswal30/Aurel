import { expect, test } from "vitest";
import type { PastFeedback } from "@/lib/db/feedback";
import { learnFromFeedback } from "./learn-from-feedback";

const answer = (
  rating: -1 | 1,
  reasons: PastFeedback["reasons"],
  format = "explain",
): PastFeedback => ({
  rating,
  reasons,
  format,
  answer: `Answer rated ${rating}`,
});

test("a student who says answers are too long gets tighter answers", () => {
  const lessons = learnFromFeedback([answer(-1, ["too_long"])]);
  expect(lessons.notes.join(" ")).toContain("too long");
});

test("too long and too short cancel out", () => {
  const lessons = learnFromFeedback([
    answer(-1, ["too_long"]),
    answer(-1, ["too_short"]),
  ]);
  expect(lessons.notes.join(" ")).not.toMatch(/too (long|short)/);
});

test("the newest liked answer becomes the style example for its format", () => {
  const lessons = learnFromFeedback([
    {
      ...answer(1, ["clear"]),
      answer: "> **This isn't in your notes.** Check it.\n\nNewest liked",
    },
    { ...answer(1, []), answer: "Older liked" },
    answer(1, [], "steps"),
  ]);
  expect(lessons.likedAnswers.explain).toBe("Newest liked");
  expect(lessons.likedAnswers.steps).toBe("Answer rated 1");
});

test("disliked answers are never used as examples", () => {
  expect(learnFromFeedback([answer(-1, ["wrong"])]).likedAnswers).toEqual({});
});
