import { describe, expect, test } from "vitest";
import { countDaysUntil, todayInIndia } from "./days-until";

describe("todayInIndia", () => {
  test("uses India's date, not UTC", () => {
    expect(todayInIndia(new Date("2026-10-07T20:00:00Z"))).toBe("2026-10-08");
    expect(todayInIndia(new Date("2026-10-07T10:00:00Z"))).toBe("2026-10-07");
  });
});

describe("countDaysUntil", () => {
  test("counts whole days", () => {
    expect(countDaysUntil("2026-11-12", "2026-10-07")).toBe(36);
    expect(countDaysUntil("2026-10-07", "2026-10-07")).toBe(0);
    expect(countDaysUntil("2026-10-01", "2026-10-07")).toBe(-6);
  });
});
