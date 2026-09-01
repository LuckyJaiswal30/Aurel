"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/class-names";
import type { ConversationSummary } from "@/lib/db/conversations";
import { findChatPath } from "@/lib/navigation/chat-path";
import { ChatDialogs } from "./ChatDialogs";
import { ChatOptionsMenu, type ChatDialogName } from "./ChatOptionsMenu";

type ChatListItemProps = {
  chat: ConversationSummary;
  isCurrent?: boolean;
  detail?: ReactNode;
  size?: "compact" | "roomy";
};

export function ChatListItem({
  chat,
  isCurrent = false,
  detail,
  size = "compact",
}: ChatListItemProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDialog, setOpenDialog] = useState<ChatDialogName | null>(null);

  return (
    <li
      className={cn(
        "group/chat relative flex items-center rounded-control hover:bg-hover",
        size === "compact" ? "h-8" : "h-11",
        (isCurrent || isMenuOpen) && "bg-hover",
      )}
    >
      <Link
        href={findChatPath(chat.subjectId, chat.id)}
        aria-current={isCurrent ? "page" : undefined}
        className="flex h-full min-w-0 flex-1 items-center gap-2 rounded-control pr-9 pl-2 text-sm text-text [@media(hover:none)]:pr-9"
      >
        <span className="truncate">{chat.title}</span>
        {chat.answeringStep ? (
          <span
            title="Still answering"
            className="size-1.5 shrink-0 animate-pulse rounded-full bg-ink"
          >
            <span className="sr-only">, still answering</span>
          </span>
        ) : null}
      </Link>
      {detail ? (
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute right-2 text-xs text-muted tabular-nums group-focus-within/chat:invisible group-hover/chat:invisible [@media(hover:none)]:hidden",
            isMenuOpen && "invisible",
          )}
        >
          {detail}
        </span>
      ) : null}
      <ChatOptionsMenu
        chatTitle={chat.title}
        onOpenChange={setIsMenuOpen}
        onChoose={setOpenDialog}
        triggerClassName={cn(
          "absolute right-0.5 opacity-0 group-focus-within/chat:opacity-100 group-hover/chat:opacity-100 focus-visible:opacity-100 [@media(hover:none)]:opacity-100",
          isMenuOpen && "opacity-100",
        )}
      />
      {openDialog ? (
        <ChatDialogs
          chat={chat}
          openDialog={openDialog}
          onClose={() => setOpenDialog(null)}
        />
      ) : null}
    </li>
  );
}
