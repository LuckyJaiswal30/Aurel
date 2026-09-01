"use client";

import { Mic, Square } from "lucide-react";
import {
  useRef,
  useState,
  type DragEvent,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { cn } from "@/lib/class-names";
import { acceptedNoteExtensions } from "@/lib/uploads/note-limits";
import { useNoteAttachments } from "../use-note-attachments";
import { AttachMenu } from "./AttachMenu";
import { AttachedNotes } from "./AttachedNotes";

type AskBoxProps = {
  placeholder: string;
  subjectId?: string;
  isBusy?: boolean;
  onAsk: (question: string) => void;
  onStop?: () => void;
};

export function AskBox({
  placeholder,
  subjectId = "",
  isBusy = false,
  onAsk,
  onStop,
}: AskBoxProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { attachments, attachFiles, removeAttachment } = useNoteAttachments();

  function submitOnEnter(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (
      event.key !== "Enter" ||
      event.shiftKey ||
      event.nativeEvent.isComposing
    )
      return;
    event.preventDefault();
    formRef.current?.requestSubmit();
  }

  function askQuestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const question = new FormData(event.currentTarget).get("question");
    if (isBusy || typeof question !== "string" || question.trim() === "")
      return;
    onAsk(question.trim());
    event.currentTarget.reset();
  }

  function addFiles(files: File[]) {
    if (files.length === 0 || !subjectId) return;
    void attachFiles(subjectId, files);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function dropFiles(event: DragEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsDragging(false);
    addFiles(Array.from(event.dataTransfer.files));
  }

  return (
    <form
      ref={formRef}
      onSubmit={askQuestion}
      onDragOver={(event) => {
        if (!event.dataTransfer.types.includes("Files")) return;
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={dropFiles}
      className="w-full"
    >
      <div
        data-composer
        className={cn(
          "rounded-ask border border-line bg-surface px-3 pt-3 pb-2.5 shadow-[0_2px_8px_-2px_rgb(0_0_0/0.06)] focus-within:border-muted/50",
          isDragging && "border-ink",
        )}
      >
        <AttachedNotes attachments={attachments} onRemove={removeAttachment} />
        <label htmlFor="ask-question" className="sr-only">
          Your question
        </label>
        <span id="ask-hint" className="sr-only">
          Press Enter to ask. Press Shift and Enter for a new line.
        </span>
        <textarea
          id="ask-question"
          name="question"
          rows={1}
          maxLength={4000}
          onKeyDown={submitOnEnter}
          placeholder={placeholder}
          aria-describedby="ask-hint"
          className="block max-h-60 min-h-7 w-full resize-none bg-transparent px-1.5 text-lg leading-7 text-text outline-none [field-sizing:content] placeholder:text-muted"
        />
        <div className="mt-2.5 flex items-center justify-between">
          <AttachMenu
            subjectId={subjectId}
            isDisabled={!subjectId}
            onAddNotes={() => fileInputRef.current?.click()}
          />
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={acceptedNoteExtensions}
            tabIndex={-1}
            aria-hidden="true"
            className="hidden"
            onChange={(event) => addFiles(Array.from(event.target.files ?? []))}
          />
          {onStop ? (
            <button
              type="button"
              onClick={onStop}
              aria-label="Stop the answer"
              title="Stop"
              className="flex size-8 animate-fade-in items-center justify-center rounded-full bg-primary text-on-primary transition-transform hover:scale-105"
            >
              <Square
                aria-hidden="true"
                className="size-3"
                fill="currentColor"
              />
            </button>
          ) : (
            <button
              type="button"
              disabled
              aria-label="Voice input, coming soon"
              title="Voice input is coming soon"
              className="flex size-8 items-center justify-center rounded-control text-muted disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Mic aria-hidden="true" className="size-4" />
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
