import { expect, test } from "vitest";
import { findChatPath, findNewChatPath } from "./chat-path";

test("subject chats live inside their subject, general chats under /chats", () => {
  expect(findChatPath("s1", "c1")).toBe("/subjects/s1/chats/c1");
  expect(findChatPath(null, "c1")).toBe("/chats/c1");
  expect(findNewChatPath(null)).toBe("/chats");
  expect(findNewChatPath("s1")).toBe("/subjects/s1");
});
