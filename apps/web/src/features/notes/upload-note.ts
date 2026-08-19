import { createHash, randomUUID } from "node:crypto";
import { after } from "next/server";
import { z } from "zod";
import { consumeUsage } from "@/lib/db/usage";
import { storeNoteFile, sumStudentUploadBytes } from "@/lib/db/note-files";
import { findSubject } from "@/lib/db/subjects";
import { detectStudyFile } from "@/lib/uploads/detect-study-file";
import { maxNoteBytes, maxNoteSizeLabel } from "@/lib/uploads/note-limits";
import { processUploadedNote } from "./process-uploaded-note";

const maxStudentBytes = 500 * 1024 * 1024;

const uploadFieldsSchema = z.object({
  subjectId: z.uuid(),
  file: z.instanceof(File),
});

type UploadOutcome =
  | { status: "accepted"; noteId: string }
  | { status: "refused"; httpStatus: number; message: string };

function refuse(httpStatus: number, message: string): UploadOutcome {
  return { status: "refused", httpStatus, message };
}

function cleanFileName(name: string) {
  const cleaned = name
    .normalize("NFC")
    .replace(/[\u0000-\u001f\u007f/\\]/g, "")
    .trim();
  return (cleaned || "notes").slice(0, 200);
}

export async function uploadNote(
  studentId: string,
  formData: FormData,
): Promise<UploadOutcome> {
  const fields = uploadFieldsSchema.safeParse({
    subjectId: formData.get("subjectId"),
    file: formData.get("file"),
  });
  if (!fields.success) return refuse(400, "Choose a file to upload.");
  const { subjectId, file } = fields.data;

  if (file.size === 0) return refuse(400, "That file is empty.");
  if (file.size > maxNoteBytes)
    return refuse(413, `Files can be up to ${maxNoteSizeLabel}.`);
  const [subject, usedBytes] = await Promise.all([
    findSubject(subjectId),
    sumStudentUploadBytes(studentId),
  ]);
  if (!subject) return refuse(404, "That subject doesn't exist.");
  if (usedBytes + file.size > maxStudentBytes) {
    return refuse(
      413,
      "You've reached the 500 MB storage limit. Delete some notes first.",
    );
  }

  const usage = await consumeUsage(
    `user:${studentId}`,
    "note_upload",
    3600,
    1,
    30,
  );
  if (!usage.isAllowed)
    return refuse(429, "You've uploaded a lot this hour. Try again later.");

  const bytes = new Uint8Array(await file.arrayBuffer());
  const kind = await detectStudyFile(bytes, file.name);
  if (!kind)
    return refuse(
      415,
      "Upload PDFs, Word or PowerPoint files, images, or plain text. Zips and code aren't accepted.",
    );

  const noteId = randomUUID();
  const storagePath = `${studentId}/${subjectId}/${noteId}.${kind.extension}`;
  const fileName = cleanFileName(file.name);
  const stored = await storeNoteFile(
    {
      id: noteId,
      studentId,
      subjectId,
      fileName,
      storagePath,
      mimeType: kind.mimeType,
      sizeBytes: file.size,
      contentHash: createHash("sha256").update(bytes).digest("hex"),
    },
    bytes,
  );
  if (stored.errorCode === "duplicate")
    return refuse(409, "You've already uploaded this file to this subject.");
  if (stored.errorCode)
    return refuse(500, "We couldn't save the file. Try again.");

  after(() => processUploadedNote({ id: noteId, fileName, storagePath }));
  return { status: "accepted", noteId };
}
