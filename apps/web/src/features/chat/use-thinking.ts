"use client";

import { useCallback, useState } from "react";
import type { ParsedChatEvent } from "./chat-events";

export type Thinking = {
  startedAt: number;
  notes: string[];
  reasoning: string;
  draft: string;
};

export type FinishedThinking = {
  seconds: number;
  notes: string[];
  reasoning: string;
};

const maxReasoningLength = 20000;

function applyThinkingEvent(thinking: Thinking, event: ParsedChatEvent) {
  if (event.type === "thought")
    return { ...thinking, notes: [...thinking.notes, event.text] };
  if (event.type === "reasoning")
    return {
      ...thinking,
      reasoning: (thinking.reasoning + event.text).slice(-maxReasoningLength),
    };
  if (event.type === "draft" && event.isVisible)
    return { ...thinking, draft: thinking.draft + event.text };
  if (event.type === "draft") return thinking;
  return thinking;
}

export function useThinking() {
  const [thinking, setThinking] = useState<Thinking | null>(null);
  const [finished, setFinished] = useState<Record<string, FinishedThinking>>(
    {},
  );

  const startThinking = useCallback(() => {
    setThinking({ startedAt: Date.now(), notes: [], reasoning: "", draft: "" });
  }, []);

  const applyEvent = useCallback((event: ParsedChatEvent) => {
    setThinking((current) =>
      current ? applyThinkingEvent(current, event) : current,
    );
  }, []);

  const finishThinking = useCallback((messageId: string | null) => {
    setThinking((current) => {
      if (current && messageId)
        setFinished((saved) => ({
          ...saved,
          [messageId]: {
            seconds: Math.max(
              1,
              Math.round((Date.now() - current.startedAt) / 1000),
            ),
            notes: current.notes,
            reasoning: current.reasoning,
          },
        }));
      return null;
    });
  }, []);

  return { thinking, finished, startThinking, applyEvent, finishThinking };
}
