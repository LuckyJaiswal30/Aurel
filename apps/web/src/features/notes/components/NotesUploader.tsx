"use client";

import { Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState, type DragEvent } from "react";
import { cn } from "@/lib/class-names";
import { sendNoteFile } from "@/lib/uploads/send-note-file";
import {
  acceptedNoteExtensions,
  maxNoteSizeLabel,
} from "@/lib/uploads/note-limits";

type NotesUploaderProps = {
  subjectId: string;
};

type UploadMessage = { fileName: string; text: string; isError: boolean };

export function NotesUploader({ subjectId }: NotesUploaderProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [messages, setMessages] = useState<UploadMessage[]>([]);

  async function uploadFiles(files: File[]) {
    if (files.length === 0 || isUploading) return;
    setIsUploading(true);
    setMessages([]);
    for (const file of files.slice(0, 10)) {
      const result = await sendNoteFile(subjectId, file);
      setMessages((current) => [
        ...current,
        {
          fileName: file.name,
          text: result.message,
          isError: !result.isUploaded,
        },
      ]);
      router.refresh();
    }
    setIsUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  function dropFiles(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    void uploadFiles(Array.from(event.dataTransfer.files));
  }

  return (
    <div>
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={dropFiles}
        className={cn(
          "flex flex-col items-center justify-center rounded-panel border border-dashed border-line px-6 py-10 text-center transition-colors",
          isDragging && "border-ink bg-ink/5",
        )}
      >
        <Upload aria-hidden="true" className="size-5 text-muted" />
        <p className="mt-3 text-sm text-text">
          {isUploading ? "Uploading…" : "Drop your notes here, or"}{" "}
          {isUploading ? null : (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="font-medium text-ink underline-offset-4 hover:underline"
            >
              choose files
            </button>
          )}
        </p>
        <p className="mt-1 text-xs text-muted">
          PDF, Word, PowerPoint, images or text. Up to {maxNoteSizeLabel} each.
        </p>
        <label htmlFor="note-files" className="sr-only">
          Choose note files
        </label>
        <input
          ref={inputRef}
          id="note-files"
          type="file"
          multiple
          accept={acceptedNoteExtensions}
          className="sr-only"
          onChange={(event) =>
            void uploadFiles(Array.from(event.target.files ?? []))
          }
        />
      </div>
      {messages.length > 0 ? (
        <ul aria-live="polite" className="mt-3 flex flex-col gap-1">
          {messages.map((message) => (
            <li
              key={message.fileName}
              className={cn(
                "text-sm",
                message.isError ? "text-danger" : "text-muted",
              )}
            >
              <span className="font-medium">{message.fileName}:</span>{" "}
              {message.text}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
