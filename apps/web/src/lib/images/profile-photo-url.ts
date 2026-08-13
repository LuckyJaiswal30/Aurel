export function profilePhotoUrl(avatarPath: string | null) {
  if (!avatarPath) return null;
  const version = avatarPath.split("/").at(-1) ?? "";
  return `/api/profile-photo?v=${encodeURIComponent(version)}`;
}
