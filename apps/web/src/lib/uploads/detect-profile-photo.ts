import { fileTypeFromBuffer } from "file-type";
import type { ProfilePhotoType } from "@/lib/db/profile-photos";

export const maxProfilePhotoBytes = 1024 * 1024;

const photoTypes: Record<string, ProfilePhotoType> = {
  webp: { extension: "webp", mimeType: "image/webp" },
  jpg: { extension: "jpg", mimeType: "image/jpeg" },
};

export async function detectProfilePhoto(
  bytes: Uint8Array,
): Promise<ProfilePhotoType | null> {
  const detected = await fileTypeFromBuffer(bytes);
  return detected ? (photoTypes[detected.ext] ?? null) : null;
}
