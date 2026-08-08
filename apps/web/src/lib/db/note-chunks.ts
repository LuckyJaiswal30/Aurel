import { createAdminSupabase } from "@/lib/supabase/admin-client";

const pageSize = 1000;

export type NoteChunk = {
  id: string;
  heading: string | null;
  content: string;
  sectionText: string;
};

async function readAllPages<Row>(
  readPage: (
    from: number,
    to: number,
  ) => PromiseLike<{ data: Row[] | null; error: unknown }>,
) {
  const rows: Row[] = [];
  for (;;) {
    const { data, error } = await readPage(
      rows.length,
      rows.length + pageSize - 1,
    );
    if (error || !data) throw new Error("Could not load chunks");
    rows.push(...data);
    if (data.length < pageSize) return rows;
  }
}

export async function listNoteChunks(noteId: string): Promise<NoteChunk[]> {
  const supabase = createAdminSupabase();
  const [chunks, sections] = await Promise.all([
    readAllPages((from, to) =>
      supabase
        .from("document_chunks")
        .select("id, heading, content, section_id")
        .eq("document_id", noteId)
        .order("position")
        .range(from, to),
    ),
    readAllPages((from, to) =>
      supabase
        .from("document_sections")
        .select("id, content")
        .eq("document_id", noteId)
        .order("position")
        .range(from, to),
    ),
  ]);
  const sectionTexts = new Map(
    sections.map((section) => [section.id, section.content]),
  );
  return chunks.map((chunk) => ({
    id: chunk.id,
    heading: chunk.heading,
    content: chunk.content,
    sectionText: sectionTexts.get(chunk.section_id) ?? "",
  }));
}

export async function saveChunkContext(chunkId: string, contextNote: string) {
  const supabase = createAdminSupabase();
  const { error } = await supabase
    .from("document_chunks")
    .update({ context_note: contextNote })
    .eq("id", chunkId);
  if (error) throw new Error("Could not save chunk context");
}
