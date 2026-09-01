"use client";

import { X } from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";
import { cn } from "@/lib/class-names";
import { explainRating } from "../chat-actions";
import { helpfulChoices, unhelpfulChoices } from "../feedback-choices";

type FeedbackPanelProps = {
  messageId: string;
  rating: 1 | -1;
  onClose: () => void;
};

export function FeedbackPanel({
  messageId,
  rating,
  onClose,
}: FeedbackPanelProps) {
  const [reasons, setReasons] = useState<string[]>([]);
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState<"open" | "sent" | "failed">("open");
  const [isSending, startSending] = useTransition();
  const choices = rating === 1 ? helpfulChoices : unhelpfulChoices;
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    panelRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, []);

  function toggle(reason: string) {
    setReasons((current) =>
      current.includes(reason)
        ? current.filter((item) => item !== reason)
        : [...current, reason],
    );
  }

  function send() {
    startSending(async () => {
      const result = await explainRating(messageId, reasons, comment);
      setStatus(result.isSaved ? "sent" : "failed");
      if (result.isSaved) setTimeout(onClose, 2200);
    });
  }

  if (status === "sent")
    return (
      <p role="status" className="mt-2 animate-fade-in text-sm text-muted">
        Thanks. I&apos;ll use this to shape your next answers.
      </p>
    );

  return (
    <div
      ref={panelRef}
      className="mt-2 max-w-xl scroll-mb-40 animate-rise-in rounded-panel border border-line bg-surface p-3"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-text">
          {rating === 1 ? "What worked well?" : "What went wrong?"}
        </p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close feedback"
          className="flex size-7 items-center justify-center rounded-control text-muted hover:bg-hover hover:text-text"
        >
          <X aria-hidden="true" className="size-4" />
        </button>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {choices.map((choice) => {
          const isChosen = reasons.includes(choice.reason);
          return (
            <button
              key={choice.reason}
              type="button"
              aria-pressed={isChosen}
              onClick={() => toggle(choice.reason)}
              className={cn(
                "h-8 rounded-full border border-line px-3 text-sm text-text transition-colors hover:bg-hover",
                isChosen && "border-ink bg-ink/10 text-ink",
              )}
            >
              {choice.label}
            </button>
          );
        })}
      </div>
      <label htmlFor={`feedback-${messageId}`} className="sr-only">
        Anything else
      </label>
      <textarea
        id={`feedback-${messageId}`}
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        maxLength={1000}
        rows={2}
        placeholder="Anything else? (optional)"
        className="mt-2 block w-full resize-none rounded-control border border-line bg-canvas px-3 py-2 text-sm text-text outline-none placeholder:text-muted focus:border-muted/60"
      />
      <div className="mt-2 flex items-center justify-end gap-3">
        {status === "failed" ? (
          <p role="alert" className="text-sm text-danger">
            Couldn&apos;t send that. Try again.
          </p>
        ) : null}
        <button
          type="button"
          onClick={send}
          disabled={isSending || (reasons.length === 0 && !comment.trim())}
          className="h-8 rounded-control bg-primary px-3 text-sm text-on-primary disabled:opacity-50"
        >
          {isSending ? "Sending…" : "Send feedback"}
        </button>
      </div>
    </div>
  );
}
