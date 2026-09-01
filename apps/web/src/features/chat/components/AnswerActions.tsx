"use client";

import { ThumbsDown, ThumbsUp } from "lucide-react";
import { useRef, useState, useTransition } from "react";
import { cn } from "@/lib/class-names";
import { rateTutorAnswer } from "../chat-actions";
import { CopyButton } from "./CopyButton";
import { FeedbackPanel } from "./FeedbackPanel";

type AnswerActionsProps = {
  messageId: string;
  content: string;
  initialRating: -1 | 1 | null;
};

export const actionButtonClass =
  "flex size-8 items-center justify-center rounded-control text-muted transition-colors hover:bg-hover hover:text-text";

export function AnswerActions({
  messageId,
  content,
  initialRating,
}: AnswerActionsProps) {
  const [rating, setRating] = useState(initialRating);
  const [isAsking, setIsAsking] = useState(false);
  const savedRating = useRef(initialRating);
  const [, startSaving] = useTransition();

  function rate(choice: 1 | -1) {
    const next = rating === choice ? null : choice;
    setRating(next);
    setIsAsking(next !== null);
    startSaving(async () => {
      const result = await rateTutorAnswer(messageId, next);
      if (result.isSaved) savedRating.current = next;
      else {
        setRating(savedRating.current);
        setIsAsking(false);
      }
    });
  }

  return (
    <div>
      <div className="mt-2 -ml-1.5 flex items-center gap-0.5">
        <CopyButton
          text={content}
          label="Copy answer"
          className={actionButtonClass}
        />
        <button
          type="button"
          onClick={() => rate(1)}
          aria-pressed={rating === 1}
          aria-label="Helpful answer"
          title="Helpful"
          className={cn(actionButtonClass, rating === 1 && "text-ink")}
        >
          <ThumbsUp
            aria-hidden="true"
            className="size-4"
            fill={rating === 1 ? "currentColor" : "none"}
          />
        </button>
        <button
          type="button"
          onClick={() => rate(-1)}
          aria-pressed={rating === -1}
          aria-label="Not helpful"
          title="Not helpful"
          className={cn(actionButtonClass, rating === -1 && "text-danger")}
        >
          <ThumbsDown
            aria-hidden="true"
            className="size-4"
            fill={rating === -1 ? "currentColor" : "none"}
          />
        </button>
      </div>
      {isAsking && rating !== null ? (
        <FeedbackPanel
          key={rating}
          messageId={messageId}
          rating={rating}
          onClose={() => setIsAsking(false)}
        />
      ) : null}
    </div>
  );
}
