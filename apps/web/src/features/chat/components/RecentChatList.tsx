"use client";

import { usePathname } from "next/navigation";
import { findChatPath } from "@/lib/navigation/chat-path";
import { useRefreshWhile } from "@/lib/navigation/use-refresh-while";
import type { ConversationSummary } from "@/lib/db/conversations";
import { ChatListItem } from "./ChatListItem";

type RecentChatListProps = {
  conversations: ConversationSummary[];
};

export function RecentChatList({ conversations }: RecentChatListProps) {
  const pathname = usePathname();
  useRefreshWhile(
    conversations.some((conversation) => conversation.answeringStep),
  );

  return (
    <section aria-labelledby="recent-chats-heading">
      <h2 id="recent-chats-heading" className="px-2 pb-1 text-xs text-muted">
        Recent chats
      </h2>
      {conversations.length === 0 ? (
        <p className="px-2 py-1 text-xs text-muted">
          Chats you start will show up here.
        </p>
      ) : (
        <ul className="flex flex-col gap-px">
          {conversations.map((conversation) => (
            <ChatListItem
              key={conversation.id}
              chat={conversation}
              isCurrent={
                pathname ===
                findChatPath(conversation.subjectId, conversation.id)
              }
            />
          ))}
        </ul>
      )}
    </section>
  );
}
