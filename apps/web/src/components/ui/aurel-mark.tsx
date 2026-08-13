import Image from "next/image";
import { cn } from "@/lib/class-names";

type AurelMarkProps = {
  className?: string;
  isThinking?: boolean;
};

export function AurelMark({ className, isThinking = false }: AurelMarkProps) {
  return (
    <Image
      src="/aurel-logo.png"
      alt=""
      aria-hidden="true"
      width={64}
      height={64}
      className={cn(
        "shrink-0 select-none",
        isThinking && "animate-breathe",
        className,
      )}
    />
  );
}
