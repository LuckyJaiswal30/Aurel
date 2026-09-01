import type { ChatStep } from "./ask-tutor";

export const chatStepLabels: Record<ChatStep, string> = {
  checking: "Checking your question",
  plan: "Working out what you need",
  search: "Searching your notes",
  evidence: "Picking out the exact lines",
  write: "Writing the answer",
  check: "Double-checking it against your notes",
  revise: "Fixing what the check found",
  review: "Final safety checks",
};

export const pendingQuestionKey = "aurel-pending-question";

export function readChatStep(value: string | null): ChatStep | null {
  if (!value) return null;
  return value in chatStepLabels ? (value as ChatStep) : "write";
}
