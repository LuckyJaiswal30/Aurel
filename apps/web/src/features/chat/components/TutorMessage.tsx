"use client";

import { createMathPlugin } from "@streamdown/math";
import "katex/dist/katex.min.css";
import { Streamdown } from "streamdown";
import type { ChatMessage } from "@/lib/db/conversations";
import { formatMathAnswer } from "../format-math";
import { markCitations } from "../mark-citations";
import { AnswerActions } from "./AnswerActions";
import { CitationChip } from "./CitationChip";
import { SourceList } from "./SourceList";

const math = createMathPlugin({ singleDollarTextMath: true });

type TutorMessageProps = {
  message: ChatMessage;
  subjectId: string | null;
};

export function TutorMessage({ message, subjectId }: TutorMessageProps) {
  const citationsByNumber = new Map(
    message.citations.map((citation) => [String(citation.number), citation]),
  );
  const markdown = markCitations(
    formatMathAnswer(message.content),
    message.citations.map((citation) => citation.number),
  );

  return (
    <article aria-label="Tutor's answer">
      <Streamdown
        mode="static"
        tableMaxHeight={0}
        plugins={{ math }}
        allowedTags={{ "cite-ref": ["n"] }}
        components={{
          "cite-ref": (props: Record<string, unknown>) => (
            <CitationChip
              messageId={message.id}
              number={String(props.n)}
              citation={citationsByNumber.get(String(props.n))}
            />
          ),
        }}
        className="answer-body font-serif text-lg leading-[1.7] text-text"
      >
        {markdown}
      </Streamdown>
      <SourceList
        messageId={message.id}
        subjectId={subjectId}
        citations={message.citations}
      />
      {message.source !== "redirect" ? (
        <AnswerActions
          messageId={message.id}
          content={message.content}
          initialRating={message.rating}
        />
      ) : null}
    </article>
  );
}
