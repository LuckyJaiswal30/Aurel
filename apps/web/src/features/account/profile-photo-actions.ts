"use server";

import { refresh } from "next/cache";
import { requireStudentId } from "@/lib/auth/current-student";
import { deleteProfilePhoto, saveProfilePhoto } from "@/lib/db/profile-photos";
import { consumeUsage } from "@/lib/db/usage";
import {
  detectProfilePhoto,
  maxProfilePhotoBytes,
} from "@/lib/uploads/detect-profile-photo";

type PhotoResult = { isSaved: boolean; message: string };

export async function uploadProfilePhoto(
  formData: FormData,
): Promise<PhotoResult> {
  const studentId = await requireStudentId();
  const photo = formData.get("photo");
  if (!(photo instanceof File) || photo.size === 0)
    return { isSaved: false, message: "Choose a photo." };
  if (photo.size > maxProfilePhotoBytes)
    return { isSaved: false, message: "That photo is too large." };

  const bytes = new Uint8Array(await photo.arrayBuffer());
  const type = await detectProfilePhoto(bytes);
  if (!type)
    return { isSaved: false, message: "Use a JPG, PNG or WebP photo." };

  const usage = await consumeUsage(
    `user:${studentId}`,
    "profile_photo",
    3600,
    1,
    10,
  );
  if (!usage.isAllowed)
    return { isSaved: false, message: "Try changing your photo later." };

  try {
    await saveProfilePhoto(studentId, bytes, type);
  } catch {
    return { isSaved: false, message: "We couldn't save that photo." };
  }
  refresh();
  return { isSaved: true, message: "Photo updated." };
}

export async function removeProfilePhoto(): Promise<PhotoResult> {
  const studentId = await requireStudentId();
  try {
    await deleteProfilePhoto(studentId);
  } catch {
    return { isSaved: false, message: "We couldn't remove that photo." };
  }
  refresh();
  return { isSaved: true, message: "Photo removed." };
}
