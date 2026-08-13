import Image from "next/image";
import { cn } from "@/lib/class-names";

type StudentAvatarProps = {
  displayName: string;
  photoUrl?: string | null;
  size?: "regular" | "large";
};

export function StudentAvatar({
  displayName,
  photoUrl,
  size = "regular",
}: StudentAvatarProps) {
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
  const pixels = size === "large" ? 56 : 28;

  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-ink/15 font-semibold text-ink",
        size === "large" ? "size-14 text-lg" : "size-7 text-xs",
      )}
    >
      {photoUrl ? (
        <Image
          src={photoUrl}
          alt=""
          width={pixels}
          height={pixels}
          unoptimized
          className="size-full object-cover"
        />
      ) : (
        initials || "S"
      )}
    </span>
  );
}
