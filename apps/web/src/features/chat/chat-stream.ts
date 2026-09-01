import type { Dispatch, SetStateAction } from "react";
import type { ChatMessage } from "@/lib/db/conversations";
import { parseChatEvent } from "./chat-events";

export function listMessageIds(messages: ChatMessage[]) {
  return messages.map((message) => message.id).join(",");
}

export function isSavedMessageId(messageId: string) {
  return /^[0-9a-f-]{36}$/i.test(messageId);
}

export function addStoppedMessage(
  setMessages: Dispatch<SetStateAction<ChatMessage[]>>,
) {
  const id = `stopped-${Date.now()}`;
  setMessages((current) => [
    ...current,
    {
      id,
      role: "tutor",
      content: "You stopped this answer.",
      source: "redirect",
      citations: [],
      rating: null,
      createdAt: new Date().toISOString(),
    },
  ]);
  return id;
}

export function localStudentMessage(question: string): ChatMessage {
  return {
    id: `pending-${Date.now()}`,
    role: "student",
    content: question,
    source: null,
    citations: [],
    rating: null,
    createdAt: new Date().toISOString(),
  };
}

export async function* readEvents(response: Response) {
  const reader = response.body?.getReader();
  if (!reader) return;
  const decoder = new TextDecoder();
  let buffer = "";
  for (;;) {
    const { done, value } = await reader.read();
    buffer += decoder.decode(value, { stream: !done });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      const event = line.trim() ? parseChatEvent(line) : null;
      if (event) yield event;
    }
    if (done) return;
  }
}
