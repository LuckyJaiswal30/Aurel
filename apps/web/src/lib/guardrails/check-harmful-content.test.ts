import { expect, test } from "vitest";
import { readGuardReply } from "./check-harmful-content";

test("reads Llama Guard's verdicts", () => {
  expect(readGuardReply("safe")).toBe("safe");
  expect(readGuardReply("unsafe\nS1")).toBe("harmful");
  expect(readGuardReply("unsafe\nS9,S1")).toBe("harmful");
});

test("self-harm is a care case, never a block", () => {
  expect(readGuardReply("unsafe\nS11")).toBe("care");
  expect(readGuardReply("unsafe\nS1,S11")).toBe("care");
});

test("law, medicine, history and civics topics are left to the scope judge", () => {
  expect(readGuardReply("unsafe\nS6")).toBe("safe");
  expect(readGuardReply("unsafe\nS13,S5")).toBe("safe");
});

test("an unexpected reply counts as safe and other layers decide", () => {
  expect(readGuardReply("")).toBe("safe");
});

test("unsafe without a category still blocks", () => {
  expect(readGuardReply("unsafe")).toBe("harmful");
  expect(readGuardReply("unsafe\n")).toBe("harmful");
});
