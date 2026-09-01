"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { sendNoteFile } from "@/lib/uploads/send-note-file";

export type NoteAttachment = {
  id: string;
  fileName: string;
  state: "uploading" | "uploaded" | "refused";
  message: string;
};

const maxFilesAtOnce = 10;

export function useNoteAttachments() {
  const router = useRouter();
  const [attachments, setAttachments] = useState<NoteAttachment[]>([]);

  function update(id: string, change: Partial<NoteAttachment>) {
    setAttachments((current) =>
      current.map((item) => (item.id === id ? { ...item, ...change } : item)),
    );
  }

  async function attachFiles(subjectId: string, files: File[]) {
    const queued = files.slice(0, maxFilesAtOnce).map((file) => ({
      file,
      attachment: {
        id: crypto.randomUUID(),
        fileName: file.name,
        state: "uploading" as const,
        message: "Uploading",
      },
    }));
    setAttachments((current) => [
      ...current,
      ...queued.map(({ attachment }) => attachment),
    ]);
    for (const { file, attachment } of queued) {
      const result = await sendNoteFile(subjectId, file);
      update(attachment.id, {
        state: result.isUploaded ? "uploaded" : "refused",
        message: result.isUploaded ? "Added to notes" : result.message,
      });
      if (result.isUploaded) router.refresh();
    }
  }

  function removeAttachment(id: string) {
    setAttachments((current) => current.filter((item) => item.id !== id));
  }

  return { attachments, attachFiles, removeAttachment };
}
