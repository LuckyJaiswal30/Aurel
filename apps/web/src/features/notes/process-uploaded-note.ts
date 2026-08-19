import { classifyStudyMaterial } from "@/lib/ai/classify-study-material";
import { previewDocument, readDocument } from "@/lib/knowledge/client";
import { removeStoredFiles, setNoteStatus } from "@/lib/db/note-files";
import { prepareNoteForSearch } from "./prepare-note-for-search";

type UploadedNote = {
  id: string;
  fileName: string;
  storagePath: string;
};

const rejectionMessages = {
  personal_document:
    "This looks like a personal document, so it wasn't kept. Upload study material only.",
  not_study_material:
    "This doesn't look like study material, so it wasn't kept.",
} as const;

export async function processUploadedNote(note: UploadedNote) {
  try {
    await setNoteStatus(note.id, "checking");
    const preview = await previewDocument(note.id);
    if (preview.rejection) {
      await removeStoredFiles([note.storagePath]);
      await setNoteStatus(note.id, "rejected", preview.rejection);
      return;
    }
    if (preview.sampleText.trim().length < 40) {
      await setNoteStatus(
        note.id,
        "held_for_confirmation",
        "We couldn't find much text. Is this study material?",
      );
      return;
    }

    const verdict = await classifyStudyMaterial(
      note.fileName,
      preview.sampleText,
    );
    if (
      verdict.kind === "personal_document" ||
      verdict.kind === "not_study_material"
    ) {
      await removeStoredFiles([note.storagePath]);
      await setNoteStatus(note.id, "rejected", rejectionMessages[verdict.kind]);
      return;
    }
    if (verdict.kind === "unclear") {
      await setNoteStatus(
        note.id,
        "held_for_confirmation",
        "We weren't sure this is study material. Please confirm.",
      );
      return;
    }
    await continueReadingNote(note.id, note.fileName);
  } catch {
    await setNoteStatus(
      note.id,
      "failed",
      "We couldn't check this file. Try again in a moment.",
    );
  }
}

export async function continueReadingNote(noteId: string, fileName: string) {
  try {
    await setNoteStatus(noteId, "reading");
    const chunkCount = await readDocument(noteId);
    if (chunkCount > 0) await prepareNoteForSearch(noteId, fileName);
  } catch {
    await setNoteStatus(
      noteId,
      "failed",
      "We couldn't finish reading this file. Try again in a moment.",
    );
  }
}
