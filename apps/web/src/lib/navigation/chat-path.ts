export function findChatPath(subjectId: string | null, conversationId: string) {
  return subjectId
    ? `/subjects/${subjectId}/chats/${conversationId}`
    : `/chats/${conversationId}`;
}

export function findNewChatPath(subjectId: string | null) {
  return subjectId ? `/subjects/${subjectId}` : "/chats";
}
