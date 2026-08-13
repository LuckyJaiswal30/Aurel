import { Slot } from "radix-ui";
import type { ComponentProps } from "react";
import { cn } from "@/lib/class-names";

const variantClasses = {
  primary: "bg-primary text-on-primary hover:opacity-90",
  secondary: "border border-line bg-surface text-text hover:bg-hover",
  ghost: "text-text hover:bg-hover",
  danger: "bg-danger text-white hover:opacity-90",
} as const;

type ButtonProps = ComponentProps<"button"> & {
  variant?: keyof typeof variantClasses;
  asChild?: boolean;
};

export function Button({
  className,
  variant = "primary",
  asChild = false,
  ...props
}: ButtonProps) {
  const Component = asChild ? Slot.Root : "button";

  return (
    <Component
      data-slot="button"
      className={cn(
        "inline-flex min-h-9 shrink-0 items-center justify-center gap-2 rounded-control px-3 text-sm font-medium whitespace-nowrap transition-[background-color,opacity] disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}
