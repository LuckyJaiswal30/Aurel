import { findStudentId } from "@/lib/auth/current-student";
import { readProfilePhoto } from "@/lib/db/profile-photos";
import { findProfile } from "@/lib/db/profiles";

export async function GET() {
  const studentId = await findStudentId();
  if (!studentId) return new Response(null, { status: 401 });
  const avatarPath = (await findProfile(studentId))?.avatarPath;
  const photo = avatarPath ? await readProfilePhoto(avatarPath) : null;
  if (!photo) return new Response(null, { status: 404 });
  return new Response(photo, {
    headers: {
      "Content-Type": avatarPath?.endsWith(".jpg")
        ? "image/jpeg"
        : "image/webp",
      "Cache-Control": "private, max-age=86400",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
