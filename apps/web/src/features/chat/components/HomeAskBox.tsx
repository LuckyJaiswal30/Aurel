"use client";

import { useRouter } from "next/navigation";
import { useRef } from "react";
import { glideToBottom } from "@/lib/motion/glide-to-bottom";
import { findNewChatPath } from "@/lib/navigation/chat-path";
import { pendingQuestionKey } from "../chat-progress";
import { AskBox } from "./AskBox";

export function HomeAskBox() {
  const router = useRouter();
  const wrapperRef = useRef<HTMLDivElement>(null);

  async function moveComposerDown() {
    const wrapper = wrapperRef.current;
    const composer = wrapper?.querySelector<HTMLElement>("[data-composer]");
    if (!wrapper || !composer) return;
    const home = wrapper.closest("[data-study-home]") ?? wrapper;
    const fading = Array.from(
      home.querySelectorAll<HTMLElement>("[data-fades-on-ask]"),
    );
    await glideToBottom(composer, fading);
  }

  async function startChat(question: string) {
    try {
      sessionStorage.setItem(
        pendingQuestionKey,
        JSON.stringify({ subjectId: null, question }),
      );
    } catch {
      return;
    }
    const chatPath = findNewChatPath(null);
    router.prefetch(chatPath);
    await moveComposerDown();
    router.push(chatPath);
  }

  return (
    <div ref={wrapperRef}>
      <AskBox
        placeholder="Ask about any subject"
        onAsk={(question) => void startChat(question)}
      />
    </div>
  );
}
