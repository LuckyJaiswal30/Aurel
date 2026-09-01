import type { ChatMessage } from "@/lib/db/conversations";
import { listRecentFeedback } from "@/lib/db/feedback";
import { answerQuestion } from "@/lib/tutor/answer-question";
import { learnFromFeedback } from "@/lib/tutor/learn-from-feedback";
import type { AskTutorRequest, ChatEvent, ChatStep } from "./ask-tutor";
import { saveMessage } from "./chat-messages";

type TutorScope = Parameters<typeof answerQuestion>[0]["scope"];
const turnLength = 500;

export function describeTurns(
  turns: { role: ChatMessage["role"]; content: string }[],
) {
  return turns
    .map(
      (turn) =>
        `${turn.role === "student" ? "Student" : "Tutor"}: ${turn.content.slice(0, turnLength)}`,
    )
    .join("\n");
}

export async function answerAndSave(
  request: AskTutorRequest,
  check: { question: string; scope: TutorScope },
  base: { studentId: string; conversationId: string },
  conversation: string,
  showStep: (step: ChatStep) => void,
  emit: (event: ChatEvent) => void,
) {
  const lessons = learnFromFeedback(await listRecentFeedback(base.studentId));
  const answer = await answerQuestion({
    studentId: request.studentId,
    subjectId: request.subject?.id ?? null,
    question: check.question,
    conversation,
    scope: request.subject || check.scope !== "brief" ? check.scope : "study",
    context: {
      profile: request.profile,
      subjectName: request.subject?.name ?? "General study",
      examDate: request.subject?.examDate ?? null,
      lessons,
    },
    onStep: showStep,
    listener: {
      signal: request.signal,
      onNote: (text) => emit({ type: "thought", text }),
      onReasoning: (text) => emit({ type: "reasoning", text }),
      onDraft: (text, isVisible) => emit({ type: "draft", text, isVisible }),
    },
  });
  const reply = await saveMessage({
    ...base,
    role: "tutor",
    content: answer.kind === "answer" ? answer.markdown : answer.message,
    source:
      answer.kind === "clarify"
        ? "redirect"
        : answer.source === "notes"
          ? "notes"
          : answer.source === "reference"
            ? "reference_library"
            : "general_knowledge",
    citations: answer.kind === "answer" ? answer.citations : [],
    understoodQuestion: check.question,
    format: answer.kind === "answer" ? answer.format : null,
  });
  emit({ type: "answer", message: reply });
}
