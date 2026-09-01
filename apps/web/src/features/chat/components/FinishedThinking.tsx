"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/class-names";
import type { FinishedThinking as FinishedThinkingRecord } from "../use-thinking";
import { ThinkingSteps } from "./ThinkingSteps";

type FinishedThinkingProps = {
  record: FinishedThinkingRecord;
};

export function FinishedThinking({ record }: FinishedThinkingProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mb-3 text-sm">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
        className="flex items-center gap-1.5 rounded-control py-1 text-muted hover:text-text"
      >
        Thought for {record.seconds}s
        <ChevronDown
          aria-hidden="true"
          className={cn(
            "size-4 transition-transform duration-200 ease-glide",
            isOpen && "rotate-180",
          )}
        />
      </button>
      {isOpen ? (
        <ThinkingSteps notes={record.notes} reasoning={record.reasoning} />
      ) : null}
    </div>
  );
}
