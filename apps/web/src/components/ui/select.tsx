import { ChevronDown } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "@/lib/class-names";
import { controlClass } from "./control-styles";

type SelectProps = ComponentProps<"select"> & {
  options: { value: string; label: string }[];
};

export function Select({ options, className, ...props }: SelectProps) {
  return (
    <span className={cn("relative flex items-center", className)}>
      <select
        className={cn(controlClass, "cursor-pointer appearance-none pr-9")}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute right-3 size-4 text-muted"
      />
    </span>
  );
}
