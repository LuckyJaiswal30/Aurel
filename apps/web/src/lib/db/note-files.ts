import type { NoteStatus } from "@/lib/db/documents";
import { createAdminSupabase } from "@/lib/supabase/admin-client";

export const studyFilesBucket = "study-files";

export type NewNoteFile = {
  id: string;
  studentId: string;
  subjectId: string;
  fileName: string;
  storagePath: string;
  mimeType: string;
  sizeBytes: number;
  contentHash: string;
};

export async function storeNoteFile(note: NewNoteFile, bytes: Uint8Array) {
  const supabase = createAdminSupabase();
  const upload = await supabase.storage
    .from(studyFilesBucket)
    .upload(note.storagePath, bytes, {
      contentType: note.mimeType,
      upsert: false,
    });
  if (upload.error) return { errorCode: "storage_failed" as const };

  const { error } = await supabase.from("documents").insert({
    id: note.id,
    user_id: note.studentId,
    subject_id: note.subjectId,
    file_name: note.fileName,
    storage_path: note.storagePath,
    mime_type: note.mimeType,
    size_bytes: note.sizeBytes,
    content_hash: note.contentHash,
  });
  if (error) {
    await supabase.storage.from(studyFilesBucket).remove([note.storagePath]);
    return {
      errorCode:
        error.code === "23505"
          ? ("duplicate" as const)
          : ("save_failed" as const),
    };
  }
  return { errorCode: null };
}

export async function setNoteStatus(
  noteId: string,
  status: NoteStatus,
  statusDetail: string | null = null,
) {
  const supabase = createAdminSupabase();
  await supabase
    .from("documents")
    .update({ status, status_detail: statusDetail })
    .eq("id", noteId);
}

export async function sumStudentUploadBytes(studentId: string) {
  const supabase = createAdminSupabase();
  const { data } = await supabase
    .from("documents")
    .select("size_bytes")
    .eq("user_id", studentId);
  return (data ?? []).reduce((total, row) => total + row.size_bytes, 0);
}

export async function removeStoredFiles(storagePaths: string[]) {
  if (storagePaths.length === 0) return;
  const supabase = createAdminSupabase();
  await supabase.storage.from(studyFilesBucket).remove(storagePaths);
}

export async function deleteNoteRecords(noteIds: string[]) {
  if (noteIds.length === 0) return;
  const supabase = createAdminSupabase();
  await supabase.from("documents").delete().in("id", noteIds);
}

export async function claimNoteJob(
  studentId: string,
  noteId: string,
  claim: {
    fromStatuses: NoteStatus[];
    toStatus: NoteStatus;
    stuckStatuses: NoteStatus[];
    stuckBefore: Date;
  },
) {
  const { data, error } = await createAdminSupabase().rpc("claim_note_job", {
    note_id: noteId,
    student_id: studentId,
    from_statuses: claim.fromStatuses,
    to_status: claim.toStatus,
    stuck_statuses: claim.stuckStatuses,
    stuck_before: claim.stuckBefore.toISOString(),
  });
  return !error && data === true;
}
