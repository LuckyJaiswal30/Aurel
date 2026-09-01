import { expect, test } from "vitest";
import { pickGreetingLine } from "./greeting-lines";
import { chooseGreetingMoment, type GreetingFacts } from "./greeting-moment";

const facts: GreetingFacts = {
  firstName: "Asha",
  language: "english",
  hour: 10,
  weekday: 3,
  nextExam: null,
  lastSubjectName: null,
  daysSinceLastChat: 1,
};

test("an exam today comes before the time of day", () => {
  expect(
    chooseGreetingMoment({
      ...facts,
      hour: 2,
      nextExam: { subjectName: "AI", daysLeft: 0 },
    }),
  ).toBe("exam_today");
});

test("late at night the greeting notices the hour", () => {
  expect(chooseGreetingMoment({ ...facts, hour: 2 })).toBe("late_night");
  expect(pickGreetingLine("late_night", { ...facts, hour: 2 }, () => 0)).toBe(
    "Still up at 2 AM, Asha?",
  );
});

test("a student back after days away is welcomed back", () => {
  expect(chooseGreetingMoment({ ...facts, daysSinceLastChat: 6 })).toBe(
    "returning",
  );
});

test("a first visit gets a welcome", () => {
  expect(chooseGreetingMoment({ ...facts, daysSinceLastChat: null })).toBe(
    "first_visit",
  );
});

test("weekends get their own lines, but not at night", () => {
  expect(chooseGreetingMoment({ ...facts, weekday: 6 })).toBe("weekend");
  expect(chooseGreetingMoment({ ...facts, weekday: 6, hour: 22 })).toBe(
    "night",
  );
});

test("lines that need a subject are skipped when there is none", () => {
  for (let index = 0; index < 3; index += 1) {
    const line = pickGreetingLine("afternoon", facts, () => index / 3);
    expect(line).not.toContain("{subject}");
    expect(line).not.toMatch(/to \?|  /);
  }
});

test("every hand-written greeting fits on one line", async () => {
  const { readFileSync } = await import("node:fs");
  const source = readFileSync(
    new URL("./greeting-lines.ts", import.meta.url),
    "utf8",
  );
  const lines = [
    ...source.matchAll(/"([^"{][^"]*\{name\}[^"]*|[^"]*\{name\}[^"]*)"/g),
  ].map((match) => match[1] ?? "");
  for (const line of lines)
    expect(line.replace("{name}", "Asha").length).toBeLessThanOrEqual(45);
});
