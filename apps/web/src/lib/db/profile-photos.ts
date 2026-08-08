import { randomUUID } from "node:crypto";
import { createAdminSupabase } from "@/lib/supabase/admin-client";

const profilePhotosBucket = "avatars";

export type ProfilePhotoType = { extension: "webp" | "jpg"; mimeType: string };

async function findPhotoPath(studentId: string) {
  const supabase = createAdminSupabase();
  const { data, error } = await supabase
    .from("profiles")
    .select("avatar_path")
    .eq("id", studentId)
    .maybeSingle();
  if (error) throw new Error("Could not load the profile photo");
  return data?.avatar_path ?? null;
}

async function setPhotoPath(studentId: string, path: string | null) {
  const supabase = createAdminSupabase();
  const { error } = await supabase
    .from("profiles")
    .update({ avatar_path: path })
    .eq("id", studentId);
  if (error) throw new Error("Could not save the profile photo");
}

async function removePhotoFile(path: string | null) {
  if (!path) return;
  await createAdminSupabase().storage.from(profilePhotosBucket).remove([path]);
}

export async function saveProfilePhoto(
  studentId: string,
  bytes: Uint8Array,
  type: ProfilePhotoType,
) {
  const supabase = createAdminSupabase();
  const path = `${studentId}/${randomUUID()}.${type.extension}`;
  const upload = await supabase.storage
    .from(profilePhotosBucket)
    .upload(path, bytes, { contentType: type.mimeType, upsert: false });
  if (upload.error) throw new Error("Could not store the profile photo");
  const previousPath = await findPhotoPath(studentId);
  try {
    await setPhotoPath(studentId, path);
  } catch (error) {
    await removePhotoFile(path);
    throw error;
  }
  await removePhotoFile(previousPath);
}

export async function deleteProfilePhoto(studentId: string) {
  const previousPath = await findPhotoPath(studentId);
  await setPhotoPath(studentId, null);
  await removePhotoFile(previousPath);
}

export async function readProfilePhoto(path: string) {
  const { data, error } = await createAdminSupabase()
    .storage.from(profilePhotosBucket)
    .download(path);
  if (error) return null;
  return data;
}
