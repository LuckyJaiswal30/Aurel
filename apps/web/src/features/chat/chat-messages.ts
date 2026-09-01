import {
  saveChatMessage,
  type ChatMessage,
  type NewChatMessage,
} from "@/lib/db/conversations";

export async function saveMessage(
  message: NewChatMessage,
): Promise<ChatMessage> {
  const saved = await saveChatMessage(message);
  return {
    id: saved.id,
    role: message.role,
    content: message.content,
    source: message.source,
    citations: message.citations,
    rating: null,
    createdAt: saved.createdAt,
  };
}

export function transientMessage(
  role: ChatMessage["role"],
  content: string,
): ChatMessage {
  return {
    id: `transient-${role}-${Date.now()}`,
    role,
    content,
    source: role === "tutor" ? "redirect" : null,
    citations: [],
    rating: null,
    createdAt: new Date().toISOString(),
  };
}
