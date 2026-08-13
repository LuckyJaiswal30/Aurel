import { expect, test } from "vitest";
import { isApplePlatform } from "./shortcuts";

test("Macs, iPhones and iPads use the command key", () => {
  expect(
    isApplePlatform("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"),
  ).toBe(true);
  expect(isApplePlatform("Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X)")).toBe(
    true,
  );
});

test("Windows, Linux and Android use Ctrl", () => {
  expect(isApplePlatform("Mozilla/5.0 (Windows NT 10.0; Win64; x64)")).toBe(
    false,
  );
  expect(isApplePlatform("Mozilla/5.0 (Linux; Android 15; Pixel 9)")).toBe(
    false,
  );
});
