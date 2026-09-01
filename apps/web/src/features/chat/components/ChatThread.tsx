"use client";

import { useEffect, useRef } from "react";
import type { ChatMessage } from "@/lib/db/conversations";
import type { ChatStep } from "../ask-tutor";
import { chatStepLabels } from "../chat-progress";
import type {
  FinishedThinking as FinishedRecord,
  Thinking,
} from "../use-thinking";
import { DraftAnswer } from "./DraftAnswer";
import { FinishedThinking } from "./FinishedThinking";
import { StudentMessage } from "./StudentMessage";
import { TutorMessage } from "./TutorMessage";
import { ThinkingPanel } from "./ThinkingPanel";
import { TutorProgress } from "./TutorProgress";

type ChatThreadProps = {
  subjectId: string | null;
  messages: ChatMessage[];
  step: ChatStep | null;
  error: string;
  savedCount: number;
  canEdit: boolean;
  onEdit: (messageId: string, question: string) => void;
  thinking: Thinking | null;
  finishedThinking: Record<string, FinishedRecord>;
};

export function ChatThread({
  subjectId,
  messages,
  step,
  error,
  savedCount,
  canEdit,
  onEdit,
  thinking,
  finishedThinking,
}: ChatThreadProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, step, thinking?.notes.length, thinking?.draft.length]);

  return (
    <section
      aria-label="Conversation"
      aria-live="polite"
      className="flex flex-1 flex-col gap-8 py-8"
    >
      {messages.map((message, index) => (
        <div
          key={message.id}
          className={
            index >= savedCount && !finishedThinking[message.id]
              ? "animate-rise-in"
              : undefined
          }
        >
          {finishedThinking[message.id] ? (
            <FinishedThinking record={finishedThinking[message.id]!} />
          ) : null}
          {message.role === "student" ? (
            <StudentMessage
              content={message.content}
              canEdit={canEdit}
              onEdit={(question) => onEdit(message.id, question)}
            />
          ) : (
            <TutorMessage message={message} subjectId={subjectId} />
          )}
        </div>
      ))}
      {thinking ? (
        <div className="animate-rise-in">
          <ThinkingPanel
            thinking={thinking}
            fallbackLabel={step ? chatStepLabels[step] : "Starting"}
          />
          {thinking.draft ? <DraftAnswer text={thinking.draft} /> : null}
        </div>
      ) : step ? (
        <div className="animate-rise-in">
          <TutorProgress step={step} />
        </div>
      ) : null}
      {error ? (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      ) : null}
      <div ref={endRef} className="scroll-mb-40" />
    </section>
  );
}
