"use client";

import { cn } from "@/lib/class-names";
import { useKeyLabels } from "@/lib/keyboard/use-key-labels";

type ShortcutKeysProps = {
  keys: string[];
  variant?: "boxed" | "plain";
  className?: string;
};

export function ShortcutKeys({
  keys,
  variant = "boxed",
  className,
}: ShortcutKeysProps) {
  const labels = useKeyLabels(keys);
  if (variant === "plain")
    return (
      <kbd className={cn("font-sans text-xs text-muted", className)}>
        {labels.join(" ")}
      </kbd>
    );
  return (
    <span className={cn("flex gap-1", className)}>
      {labels.map((label) => (
        <kbd
          key={label}
          className="inline-flex h-6 min-w-6 items-center justify-center rounded-[0.3rem] border border-line bg-canvas px-1.5 font-sans text-xs text-muted"
        >
          {label}
        </kbd>
      ))}
    </span>
  );
}
