import { describe, expect, test } from "vitest";
import { signUpSchema } from "./auth-schemas";

const validSignUp = {
  displayName: "Asha",
  email: " Asha@Example.com ",
  password: "aurel2026study",
  consent: "on",
};

describe("signUpSchema", () => {
  test("normalises the email", () => {
    expect(signUpSchema.parse(validSignUp).email).toBe("asha@example.com");
  });

  test.each([
    ["a short password", { password: "abc12345" }],
    ["a password without numbers", { password: "aurelonlyletters" }],
    ["a password without letters", { password: "1234567890" }],
    ["missing consent", { consent: undefined }],
    ["a bad email", { email: "asha" }],
  ])("rejects %s", (_label, change) => {
    expect(signUpSchema.safeParse({ ...validSignUp, ...change }).success).toBe(
      false,
    );
  });
});
