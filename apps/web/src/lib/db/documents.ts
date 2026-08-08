import { cache } from "react";
import type { Database } from "@/lib/db/database-types";
import { createServerSupabase } from "@/lib/supabase/server-client";

export type NoteStatus = Database["public"]["Enums"]["document_status"];

export type NoteSummary = {
  id: string;
  fileName: string;
  status: NoteStatus;
  statusDetail: string | null;
  sizeBytes: number;
  pageCount: number | null;
  uploadedAt: string;
  updatedAt: string;
};

export const listSubjectNotes = cache(
  async (subjectId: string): Promise<NoteSummary[]> => {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase
      .from("documents")
      .select(
        "id, file_name, status, status_detail, size_bytes, page_count, created_at, updated_at",
      )
      .eq("subject_id", subjectId)
      .order("created_at", { ascending: false });
    if (error) throw new Error("Could not load notes");
    return data.map((row) => ({
      id: row.id,
      fileName: row.file_name,
      status: row.status,
      statusDetail: row.status_detail,
      sizeBytes: row.size_bytes,
      pageCount: row.page_count,
      uploadedAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  },
);

export async function findOwnNoteFiles(filter: {
  noteId?: string;
  subjectId?: string;
}) {
  const supabase = await createServerSupabase();
  let query = supabase
    .from("documents")
    .select("id, file_name, storage_path, status, updated_at");
  if (filter.noteId) query = query.eq("id", filter.noteId);
  if (filter.subjectId) query = query.eq("subject_id", filter.subjectId);
  const { data, error } = await query;
  if (error) throw new Error("Could not load notes");
  return data.map((row) => ({
    id: row.id,
    fileName: row.file_name,
    storagePath: row.storage_path,
    status: row.status,
    updatedAt: row.updated_at,
  }));
}
