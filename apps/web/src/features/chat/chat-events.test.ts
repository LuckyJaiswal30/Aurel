import { expect, test } from "vitest";
import { parseChatEvent } from "./chat-events";

test("reads well-formed events", () => {
  expect(parseChatEvent('{"type":"progress","step":"search"}')).toEqual({
    type: "progress",
    step: "search",
  });
});

test("skips broken or unknown lines instead of failing the answer", () => {
  expect(parseChatEvent("<html>")).toBeNull();
  expect(parseChatEvent('{"type":"progress","step":"dance"}')).toBeNull();
});
