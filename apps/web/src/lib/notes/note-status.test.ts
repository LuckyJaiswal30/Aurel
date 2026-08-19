import { expect, test } from "vitest";
import { canRetryNote, isNoteInProgress } from "./note-status";

const now = Date.parse("2026-10-07T12:00:00Z");

test("failed notes can always be retried", () => {
  expect(canRetryNote("failed", "2026-10-07T11:59:00Z", now)).toBe(true);
});

test("notes stuck in progress for over twenty minutes can be retried", () => {
  expect(canRetryNote("reading", "2026-10-07T11:35:00Z", now)).toBe(true);
  expect(canRetryNote("indexing", "2026-10-07T11:35:00Z", now)).toBe(true);
  expect(canRetryNote("reading", "2026-10-07T11:45:00Z", now)).toBe(false);
});

test("finished or held notes are not retried", () => {
  expect(canRetryNote("ready", "2026-10-07T10:00:00Z", now)).toBe(false);
  expect(
    canRetryNote("held_for_confirmation", "2026-10-07T10:00:00Z", now),
  ).toBe(false);
  expect(isNoteInProgress("ready")).toBe(false);
});
