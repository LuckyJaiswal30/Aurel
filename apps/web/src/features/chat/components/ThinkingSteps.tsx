"use client";

import { cn } from "@/lib/class-names";
import { useStickToBottom } from "../use-stick-to-bottom";

type ThinkingStepsProps = {
  notes: string[];
  reasoning: string;
  isLive?: boolean;
};

export function ThinkingSteps({
  notes,
  reasoning,
  isLive = false,
}: ThinkingStepsProps) {
  const reasoningRef = useStickToBottom<HTMLDivElement>(reasoning);

  return (
    <div className="mt-2 ml-2.5 border-l border-line pl-5">
      <ol className="flex flex-col gap-1.5">
        {notes.map((note, index) => (
          <li
            key={`${index}-${note}`}
            className={cn(
              "animate-fade-in text-muted",
              isLive && index === notes.length - 1 && "text-text",
            )}
          >
            {note}
          </li>
        ))}
      </ol>
      {reasoning ? (
        <div
          ref={reasoningRef}
          className="mt-3 max-h-48 overflow-y-auto rounded-control bg-hover px-3 py-2 text-xs leading-relaxed whitespace-pre-wrap text-muted"
          aria-label="Aurel's reasoning"
        >
          {reasoning}
        </div>
      ) : null}
    </div>
  );
}
