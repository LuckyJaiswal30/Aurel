import { describe, expect, test } from "vitest";
import {
  isPublicPath,
  isSignedOutOnlyPath,
  toSafeRedirectPath,
} from "./route-access";

describe("toSafeRedirectPath", () => {
  test("keeps paths inside the app", () => {
    expect(toSafeRedirectPath("/subjects/abc")).toBe("/subjects/abc");
  });

  test.each([
    null,
    undefined,
    "",
    "https://evil.example",
    "//evil.example",
    "/\\evil.example",
    "/\t/evil.example",
    "/\n/evil.example",
    "subjects",
  ])("sends %s back to the home page", (value) => {
    expect(toSafeRedirectPath(value)).toBe("/");
  });
});

describe("route access", () => {
  test("auth screens and the callback are public", () => {
    expect(isPublicPath("/sign-in")).toBe(true);
    expect(isPublicPath("/auth/callback")).toBe(true);
  });

  test("study screens need a session", () => {
    expect(isPublicPath("/")).toBe(false);
    expect(isPublicPath("/subjects")).toBe(false);
    expect(isPublicPath("/sign-in-anything")).toBe(false);
  });

  test("only sign in and sign up bounce signed-in students", () => {
    expect(isSignedOutOnlyPath("/sign-up")).toBe(true);
    expect(isSignedOutOnlyPath("/check-email")).toBe(false);
  });
});
