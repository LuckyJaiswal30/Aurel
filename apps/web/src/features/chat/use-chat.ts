"use client";

import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import type { ChatMessage } from "@/lib/db/conversations";
import { findChatPath } from "@/lib/navigation/chat-path";
import { useRefreshWhile } from "@/lib/navigation/use-refresh-while";
import type { ChatStep } from "./ask-tutor";
import {
  addStoppedMessage,
  isSavedMessageId,
  listMessageIds,
  localStudentMessage,
  readEvents,
} from "./chat-stream";
import { readChatStep } from "./chat-progress";
import { useThinking } from "./use-thinking";

const failedMessage =
  "I couldn't reach the tutor. Check your connection, then ask again.";

type UseChatOptions = {
  subjectId: string | null;
  conversationId: string | null;
  initialMessages: ChatMessage[];
  answeringStep: string | null;
};

export function useChat(options: UseChatOptions) {
  const router = useRouter();
  const [messages, setMessages] = useState(options.initialMessages);
  const [conversationId, setConversationId] = useState(options.conversationId);
  const [liveStep, setLiveStep] = useState<ChatStep | null>(null);
  const [error, setError] = useState("");
  const thinking = useThinking();
  const { startThinking, applyEvent, finishThinking } = thinking;
  const running = useRef<{
    requestId: string;
    controller: AbortController;
  } | null>(null);
  const [savedIds, setSavedIds] = useState(
    listMessageIds(options.initialMessages),
  );
  const isLive = liveStep !== null;
  const incomingIds = listMessageIds(options.initialMessages);
  if (incomingIds !== savedIds && incomingIds !== "") {
    setSavedIds(incomingIds);
    if (!isLive && options.initialMessages.length > messages.length)
      setMessages(options.initialMessages);
  }
  const backgroundStep = isLive ? null : readChatStep(options.answeringStep);
  useRefreshWhile(backgroundStep !== null);
  const step = liveStep ?? backgroundStep;

  const ask = useCallback(
    async (question: string, editMessageId: string | null = null) => {
      setError("");
      setLiveStep("checking");
      startThinking();
      const requestId = crypto.randomUUID();
      const controller = new AbortController();
      running.current = { requestId, controller };
      let answerId: string | null = null;
      const pending = localStudentMessage(question);
      setMessages((current) => [...current, pending]);
      let isStarted = false;
      let newConversationId: string | null = null;
      const dropPending = () =>
        setMessages((current) =>
          current.filter((message) => message.id !== pending.id),
        );
      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subjectId: options.subjectId,
            conversationId,
            question,
            editMessageId,
            requestId,
          }),
          signal: controller.signal,
        });
        if (!response.ok) {
          const body = (await response.json().catch(() => null)) as {
            message?: string;
          } | null;
          throw new Error(body?.message ?? failedMessage);
        }
        for await (const event of readEvents(response)) {
          if (event.type === "started") {
            isStarted = true;
            setMessages((current) =>
              current.map((message) =>
                message.id === pending.id ? event.studentMessage : message,
              ),
            );
            if (!conversationId && event.conversationId) {
              newConversationId = event.conversationId;
              setConversationId(newConversationId);
              router.refresh();
            }
          }
          if (event.type === "progress") setLiveStep(event.step);
          applyEvent(event);
          if (event.type === "answer") {
            answerId = event.message.id;
            setMessages((current) => [...current, event.message]);
          }
          if (event.type === "failed") {
            if (!isStarted) dropPending();
            setError(event.message);
          }
        }
      } catch (caught) {
        if (controller.signal.aborted) {
          if (!isStarted) dropPending();
          else answerId = addStoppedMessage(setMessages);
        } else {
          if (!isStarted) dropPending();
          setError(caught instanceof Error ? caught.message : failedMessage);
        }
      } finally {
        running.current = null;
        finishThinking(answerId);
        setLiveStep(null);
        if (newConversationId) {
          window.history.replaceState(
            null,
            "",
            findChatPath(options.subjectId, newConversationId),
          );
          router.refresh();
        }
      }
    },
    [
      conversationId,
      options.subjectId,
      router,
      startThinking,
      applyEvent,
      finishThinking,
    ],
  );

  const stop = useCallback(() => {
    const current = running.current;
    if (!current) return;
    void fetch("/api/chat/stop", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId: current.requestId }),
    }).catch(() => undefined);
    current.controller.abort();
  }, []);

  const edit = useCallback(
    async (messageId: string, question: string) => {
      setMessages((current) => {
        const index = current.findIndex((message) => message.id === messageId);
        return index < 0 ? current : current.slice(0, index);
      });
      await ask(question, isSavedMessageId(messageId) ? messageId : null);
    },
    [ask],
  );

  return {
    messages,
    step,
    error,
    ask,
    edit,
    stop,
    thinking: thinking.thinking,
    finishedThinking: thinking.finished,
    isBusy: step !== null,
  };
}
