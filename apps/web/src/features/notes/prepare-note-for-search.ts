import { writeChunkContext } from "@/lib/ai/write-chunk-context";
import {
  listNoteChunks,
  saveChunkContext,
  type NoteChunk,
} from "@/lib/db/note-chunks";
import { setNoteStatus } from "@/lib/db/note-files";
import { embedDocument } from "@/lib/knowledge/client";

const parallelContextWriters = 2;

async function addChunkContext(fileName: string, chunk: NoteChunk) {
  try {
    const contextNote = await writeChunkContext({
      fileName,
      heading: chunk.heading,
      sectionText: chunk.sectionText,
      chunkText: chunk.content,
    });
    if (contextNote) await saveChunkContext(chunk.id, contextNote);
  } catch {
    // A missing context note only makes this chunk slightly harder to find.
  }
}

async function addContextNotes(noteId: string, fileName: string) {
  const chunks = await listNoteChunks(noteId);
  let finished = 0;
  const queue = [...chunks];
  const workers = Array.from({ length: parallelContextWriters }, async () => {
    for (let chunk = queue.shift(); chunk; chunk = queue.shift()) {
      await addChunkContext(fileName, chunk);
      finished += 1;
      if (finished % 10 === 0) {
        await setNoteStatus(
          noteId,
          "indexing",
          `Preparing ${finished} of ${chunks.length} passages`,
        );
      }
    }
  });
  await Promise.all(workers);
}

export async function prepareNoteForSearch(noteId: string, fileName: string) {
  await setNoteStatus(noteId, "indexing", "Preparing passages for search");
  await addContextNotes(noteId, fileName);
  await setNoteStatus(noteId, "indexing", "Building the search index");
  await embedDocument(noteId);
}
