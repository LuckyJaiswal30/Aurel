"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { AurelMark } from "@/components/ui/aurel-mark";
import { cn } from "@/lib/class-names";
import type { Thinking } from "../use-thinking";
import { ThinkingDots } from "./ThinkingDots";
import { ThinkingSteps } from "./ThinkingSteps";

type ThinkingPanelProps = {
  thinking: Thinking;
  fallbackLabel: string;
};

function useElapsedSeconds(startedAt: number) {
  const [now, setNow] = useState(startedAt);
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  return Math.max(0, Math.round((now - startedAt) / 1000));
}

export function ThinkingPanel({ thinking, fallbackLabel }: ThinkingPanelProps) {
  const [isOpen, setIsOpen] = useState(true);
  const seconds = useElapsedSeconds(thinking.startedAt);
  const latest = thinking.notes.at(-1) ?? fallbackLabel;

  return (
    <div role="status" className="text-sm">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
        className="flex w-full items-center gap-2.5 rounded-control py-1 text-left text-muted hover:text-text"
      >
        <AurelMark className="size-5" isThinking />
        <span className="text-text">Aurel is thinking</span>
        <ThinkingDots />
        <span className="ml-auto text-xs tabular-nums">{seconds}s</span>
        <ChevronDown
          aria-hidden="true"
          className={cn(
            "size-4 transition-transform duration-200 ease-glide",
            isOpen && "rotate-180",
          )}
        />
      </button>
      {isOpen ? (
        <ThinkingSteps
          notes={thinking.notes}
          reasoning={thinking.reasoning}
          isLive
        />
      ) : (
        <p
          key={latest}
          className="mt-1 ml-7.5 animate-fade-in truncate text-muted"
        >
          {latest}
        </p>
      )}
    </div>
  );
}
