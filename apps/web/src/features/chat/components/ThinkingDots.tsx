"use client";

import type { AnimationEvent } from "react";

const startingDelays = ["0ms", "160ms", "320ms"];

function shuffleTiming(event: AnimationEvent<HTMLSpanElement>) {
  const dot = event.currentTarget;
  dot.style.animationDuration = `${800 + Math.round(Math.random() * 700)}ms`;
}

export function ThinkingDots() {
  return (
    <span aria-hidden="true" className="inline-flex items-center gap-1">
      {startingDelays.map((delay) => (
        <span
          key={delay}
          onAnimationIteration={shuffleTiming}
          style={{ animationDelay: delay }}
          className="size-1.5 rounded-full bg-muted animate-thinking-dot"
        />
      ))}
    </span>
  );
}
