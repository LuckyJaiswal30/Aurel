import { FileText, LoaderCircle, X } from "lucide-react";
import { cn } from "@/lib/class-names";
import type { NoteAttachment } from "../use-note-attachments";

type AttachedNotesProps = {
  attachments: NoteAttachment[];
  onRemove: (id: string) => void;
};

export function AttachedNotes({ attachments, onRemove }: AttachedNotesProps) {
  if (attachments.length === 0) return null;
  return (
    <ul aria-live="polite" className="mb-2 flex flex-wrap gap-2">
      {attachments.map((attachment) => (
        <li
          key={attachment.id}
          className={cn(
            "flex max-w-full items-center gap-2 rounded-control border border-line bg-canvas py-1.5 pr-1 pl-2",
            attachment.state === "refused" && "border-danger/40",
          )}
        >
          {attachment.state === "uploading" ? (
            <LoaderCircle
              aria-hidden="true"
              className="size-4 shrink-0 animate-spin text-muted"
            />
          ) : (
            <FileText
              aria-hidden="true"
              className={cn(
                "size-4 shrink-0",
                attachment.state === "refused" ? "text-danger" : "text-ink",
              )}
            />
          )}
          <span className="min-w-0">
            <span className="block max-w-56 truncate text-sm text-text">
              {attachment.fileName}
            </span>
            <span
              className={cn(
                "block text-xs",
                attachment.state === "refused" ? "text-danger" : "text-muted",
              )}
            >
              {attachment.message}
            </span>
          </span>
          {attachment.state === "uploading" ? null : (
            <button
              type="button"
              onClick={() => onRemove(attachment.id)}
              aria-label={`Dismiss ${attachment.fileName}`}
              className="flex size-7 shrink-0 items-center justify-center rounded-control text-muted hover:bg-hover hover:text-text"
            >
              <X aria-hidden="true" className="size-3.5" />
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
