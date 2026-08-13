import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { newSubjectSchema, subjectIdSchema } from "./subject-schemas";

describe("newSubjectSchema", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-07T06:00:00Z"));
  });
  afterEach(() => vi.useRealTimers());

  test("trims the name and treats an empty date as no date", () => {
    expect(newSubjectSchema.parse({ name: "  DBMS ", examDate: "" })).toEqual({
      name: "DBMS",
      examDate: null,
    });
  });

  test("accepts today", () => {
    expect(
      newSubjectSchema.parse({ name: "DBMS", examDate: "2026-10-07" }).examDate,
    ).toBe("2026-10-07");
  });

  test("keeps a real date", () => {
    expect(
      newSubjectSchema.parse({ name: "DBMS", examDate: "2026-11-12" }).examDate,
    ).toBe("2026-11-12");
  });

  test.each([
    { name: "   ", examDate: "" },
    { name: "x".repeat(81), examDate: "" },
    { name: "DBMS", examDate: "12/11/2026" },
    { name: "DBMS", examDate: "2026-10-06" },
    { name: "DBMS", examDate: "2101-01-01" },
  ])("rejects %o", (input) => {
    expect(newSubjectSchema.safeParse(input).success).toBe(false);
  });
});

test("subject ids must be UUIDs", () => {
  expect(subjectIdSchema.safeParse("../../etc").success).toBe(false);
  expect(
    subjectIdSchema.safeParse("2cc1308c-2f58-4d4c-bbc9-66d6a053bbd1").success,
  ).toBe(true);
});
