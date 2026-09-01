"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/class-names";
import type { NoteSummary } from "@/lib/db/documents";
import type { ChatMessage, ConversationSummary } from "@/lib/db/conversations";
import type { SubjectSummary } from "@/lib/subjects/subject-summary";
import { pendingQuestionKey } from "../chat-progress";
import { useChat } from "../use-chat";
import { AskBox } from "./AskBox";
import { ChatEmptyState } from "./ChatEmptyState";
import { ChatHeader } from "./ChatHeader";
import { ChatThread } from "./ChatThread";
import { StudyContextPanel } from "./StudyContextPanel";

type ChatWorkspaceProps = {
  subject: SubjectSummary | null;
  notes?: NoteSummary[];
  pastChats?: ConversationSummary[];
  conversationId?: string | null;
  initialMessages?: ChatMessage[];
  answeringStep?: string | null;
};

const contextPanelId = "study-context-panel";

function takePendingQuestion(subjectId: string | null) {
  try {
    const stored = sessionStorage.getItem(pendingQuestionKey);
    if (!stored) return null;
    const pending = JSON.parse(stored) as {
      subjectId?: string | null;
      question?: string;
    };
    if ((pending.subjectId ?? null) !== subjectId || !pending.question)
      return null;
    sessionStorage.removeItem(pendingQuestionKey);
    return pending.question;
  } catch {
    return null;
  }
}

export function ChatWorkspace({
  subject,
  notes = [],
  pastChats = [],
  conversationId = null,
  initialMessages = [],
  answeringStep = null,
}: ChatWorkspaceProps) {
  const subjectId = subject?.id ?? null;
  const [isContextOpen, setIsContextOpen] = useState(false);
  const closeContext = useCallback(() => setIsContextOpen(false), []);
  const chat = useChat({
    subjectId,
    conversationId,
    initialMessages,
    answeringStep,
  });
  const { ask } = chat;
  const hasCheckedPending = useRef(false);

  useEffect(() => {
    if (hasCheckedPending.current) return;
    hasCheckedPending.current = true;
    const pending = takePendingQuestion(subjectId);
    if (pending) void ask(pending);
  }, [ask, subjectId]);

  return (
    <div className="flex flex-1 flex-col">
      <ChatHeader
        subject={subject}
        notesCount={notes.length}
        isContextOpen={isContextOpen}
        contextPanelId={contextPanelId}
        onToggleContext={() => setIsContextOpen((current) => !current)}
      />

      {subject && isContextOpen ? (
        <StudyContextPanel
          id={contextPanelId}
          subject={subject}
          notes={notes}
          outputs={[]}
          onClose={closeContext}
        />
      ) : null}

      <div
        className={cn(
          "flex flex-1 flex-col transition-[padding]",
          isContextOpen && "xl:pr-[21rem]",
        )}
      >
        <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col">
          {chat.messages.length > 0 ? (
            <ChatThread
              subjectId={subjectId}
              messages={chat.messages}
              step={chat.step}
              error={chat.error}
              savedCount={initialMessages.length}
              canEdit={!chat.isBusy}
              onEdit={(messageId, question) =>
                void chat.edit(messageId, question)
              }
              thinking={chat.thinking}
              finishedThinking={chat.finishedThinking}
            />
          ) : (
            <ChatEmptyState
              subject={subject}
              notesCount={notes.length}
              pastChats={pastChats}
            />
          )}
          <div className="sticky bottom-0 bg-canvas pt-2 pb-[max(1rem,env(safe-area-inset-bottom))] md:pb-6">
            <AskBox
              placeholder={
                chat.messages.length > 0
                  ? "Ask a follow-up"
                  : subject
                    ? `Ask anything about ${subject.name}`
                    : "Ask about any subject"
              }
              subjectId={subjectId ?? undefined}
              isBusy={chat.isBusy}
              onAsk={(question) => void ask(question)}
              onStop={chat.thinking ? chat.stop : undefined}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
