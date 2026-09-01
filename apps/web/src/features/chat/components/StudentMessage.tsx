"use client";

import { Pencil } from "lucide-react";
import { useState, type FormEvent, type KeyboardEvent } from "react";
import { actionButtonClass } from "./AnswerActions";
import { CopyButton } from "./CopyButton";

type StudentMessageProps = {
  content: string;
  canEdit: boolean;
  onEdit: (question: string) => void;
};

export function StudentMessage({
  content,
  canEdit,
  onEdit,
}: StudentMessageProps) {
  const [isEditing, setIsEditing] = useState(false);

  function saveEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const question = new FormData(event.currentTarget).get("question");
    if (typeof question !== "string" || !question.trim()) return;
    setIsEditing(false);
    if (question.trim() !== content) onEdit(question.trim());
  }

  function handleKeys(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Escape") setIsEditing(false);
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  }

  if (isEditing)
    return (
      <form
        onSubmit={saveEdit}
        className="ml-auto w-full max-w-[85%] animate-fade-in rounded-panel border border-line bg-surface p-3"
      >
        <label htmlFor="edit-question" className="sr-only">
          Edit your question
        </label>
        <textarea
          id="edit-question"
          name="question"
          defaultValue={content}
          maxLength={4000}
          autoFocus
          onKeyDown={handleKeys}
          onFocus={(event) =>
            event.currentTarget.setSelectionRange(
              content.length,
              content.length,
            )
          }
          className="block max-h-60 min-h-7 w-full resize-none bg-transparent px-1 text-base leading-7 text-text outline-none [field-sizing:content]"
        />
        <div className="mt-2 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="h-8 rounded-control border border-line px-3 text-sm text-text hover:bg-hover"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="h-8 rounded-control bg-primary px-3 text-sm text-on-primary"
          >
            Send
          </button>
        </div>
      </form>
    );

  return (
    <div className="group flex flex-col items-end">
      <p className="max-w-[85%] rounded-panel bg-hover px-4 py-2.5 text-base whitespace-pre-wrap text-text">
        {content}
      </p>
      <div className="mt-1 flex gap-0.5 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-100">
        <CopyButton
          text={content}
          label="Copy your question"
          className={actionButtonClass}
        />
        {canEdit ? (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            aria-label="Edit your question"
            title="Edit"
            className={actionButtonClass}
          >
            <Pencil aria-hidden="true" className="size-4" />
          </button>
        ) : null}
      </div>
    </div>
  );
}
