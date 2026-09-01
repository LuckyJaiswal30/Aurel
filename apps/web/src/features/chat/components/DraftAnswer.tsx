"use client";

import { createMathPlugin } from "@streamdown/math";
import "katex/dist/katex.min.css";
import { Streamdown } from "streamdown";
import { formatMathAnswer } from "../format-math";

const math = createMathPlugin({ singleDollarTextMath: true });

type DraftAnswerProps = {
  text: string;
};

export function DraftAnswer({ text }: DraftAnswerProps) {
  return (
    <div aria-live="off" className="mt-4">
      <Streamdown
        plugins={{ math }}
        tableMaxHeight={0}
        className="answer-body font-serif text-lg leading-[1.7] text-text"
      >
        {formatMathAnswer(text)}
      </Streamdown>
    </div>
  );
}
