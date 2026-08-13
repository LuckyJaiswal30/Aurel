"use client";

import type { KeyboardEvent, ReactNode } from "react";
import { cn } from "@/lib/class-names";

type SegmentOption<Value extends string> = {
  value: Value;
  label: string;
  icon?: ReactNode;
};

type SegmentedControlProps<Value extends string> = {
  label: string;
  value: Value;
  options: SegmentOption<Value>[];
  onChange: (value: Value) => void;
  isIconOnly?: boolean;
};

export function SegmentedControl<Value extends string>({
  label,
  value,
  options,
  onChange,
  isIconOnly = false,
}: SegmentedControlProps<Value>) {
  function moveSelection(event: KeyboardEvent<HTMLDivElement>) {
    const step =
      event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (step === 0) return;
    event.preventDefault();
    const currentIndex = options.findIndex((option) => option.value === value);
    const next =
      options[(currentIndex + step + options.length) % options.length];
    if (next) onChange(next.value);
  }

  return (
    <div
      role="radiogroup"
      aria-label={label}
      onKeyDown={moveSelection}
      className="inline-flex rounded-control border border-line bg-canvas p-0.5"
    >
      {options.map((option) => {
        const isSelected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            aria-label={isIconOnly ? option.label : undefined}
            title={isIconOnly ? option.label : undefined}
            tabIndex={isSelected ? 0 : -1}
            onClick={() => onChange(option.value)}
            className={cn(
              "flex h-7 items-center justify-center gap-1.5 rounded-[0.3rem] text-sm text-muted hover:text-text",
              isIconOnly ? "w-8" : "px-3",
              isSelected &&
                "bg-surface text-text shadow-[0_1px_2px_rgb(0_0_0/0.08)]",
            )}
          >
            {option.icon}
            {isIconOnly ? null : option.label}
          </button>
        );
      })}
    </div>
  );
}
