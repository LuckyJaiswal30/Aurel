import {
  deleteMessagesFrom,
  findConversation,
  listRecentQuestions,
  listRecentTurns,
  setAnsweringStep,
  startConversation,
  type ChatMessage,
} from "@/lib/db/conversations";
import type { StudentProfile } from "@/lib/db/profiles";
import { hidePersonalDetails } from "@/lib/guardrails/check-answer";
import { checkQuestion } from "@/lib/guardrails/check-question";
import type { SubjectSummary } from "@/lib/subjects/subject-summary";
import type { TutorStep } from "@/lib/tutor/answer-question";
import { answerAndSave, describeTurns } from "./answer-and-save";
import { saveMessage, transientMessage } from "./chat-messages";

export type ChatStep = "checking" | TutorStep;

const stoppedMessage = "You stopped this answer.";
const unfinishedAnswerMessage =
  "I couldn't finish this answer in time. Ask it again, and I'll start fresh.";

export type ChatEvent =
  | {
      type: "started";
      conversationId: string | null;
      studentMessage: ChatMessage;
    }
  | { type: "progress"; step: ChatStep }
  | { type: "thought"; text: string }
  | { type: "reasoning"; text: string }
  | { type: "draft"; text: string; isVisible: boolean }
  | { type: "answer"; message: ChatMessage }
  | { type: "failed"; message: string };

export type AskTutorRequest = {
  studentId: string;
  ipAddress: string | null;
  profile: StudentProfile;
  subject: SubjectSummary | null;
  subjectNames: string[];
  conversationId: string | null;
  question: string;
  editMessageId: string | null;
  signal?: AbortSignal;
};

async function findExistingConversation(request: AskTutorRequest) {
  if (!request.conversationId) return { conversationId: null, isValid: true };
  const conversation = await findConversation(request.conversationId);
  return {
    conversationId: conversation?.id ?? null,
    isValid: conversation?.subjectId === (request.subject?.id ?? null),
  };
}

async function replyWithoutAnswer(
  request: AskTutorRequest,
  conversationId: string | null,
  reply: string,
  emit: (event: ChatEvent) => void,
) {
  if (!conversationId) {
    emit({
      type: "started",
      conversationId: null,
      studentMessage: transientMessage("student", request.question),
    });
    emit({ type: "answer", message: transientMessage("tutor", reply) });
    return;
  }
  const base = { studentId: request.studentId, conversationId, citations: [] };
  const studentMessage = await saveMessage({
    ...base,
    role: "student",
    content: request.question,
    source: null,
    understoodQuestion: null,
  });
  emit({ type: "started", conversationId, studentMessage });
  const message = await saveMessage({
    ...base,
    role: "tutor",
    content: reply,
    source: "redirect",
    understoodQuestion: null,
  });
  emit({ type: "answer", message });
}

export async function askTutor(
  request: AskTutorRequest,
  emit: (event: ChatEvent) => void,
) {
  const existing = await findExistingConversation(request);
  if (!existing.isValid) {
    emit({ type: "failed", message: "That chat doesn't exist any more." });
    return;
  }
  emit({ type: "progress", step: "checking" });
  emit({
    type: "thought",
    text: "Checking the question is safe and about studying",
  });
  const check = await checkQuestion({
    studentId: request.studentId,
    ipAddress: request.ipAddress,
    question: request.question,
    recentQuestions: existing.conversationId
      ? await listRecentQuestions(existing.conversationId)
      : [],
    subjectNames: request.subject ? request.subjectNames : [],
    currentSubjectName: request.subject?.name ?? null,
    language: request.profile.preferredLanguage,
  });
  if (request.signal?.aborted) return;
  if (
    check.verdict !== "stopped" &&
    existing.conversationId &&
    request.editMessageId
  )
    await deleteMessagesFrom(
      request.studentId,
      existing.conversationId,
      request.editMessageId,
    );
  if (check.verdict === "stopped") {
    await replyWithoutAnswer(
      request,
      existing.conversationId,
      check.message,
      emit,
    );
    return;
  }

  const conversationId =
    existing.conversationId ??
    (await startConversation(
      request.subject?.id ?? null,
      hidePersonalDetails(check.question).slice(0, 80),
    ));
  const base = { studentId: request.studentId, conversationId };
  const conversation = existing.conversationId
    ? describeTurns(await listRecentTurns(existing.conversationId))
    : "";
  const studentMessage = await saveMessage({
    ...base,
    role: "student",
    content: request.question,
    source: null,
    citations: [],
    understoodQuestion: null,
  });
  let stepWrites = Promise.resolve();
  const saveStep = (step: ChatStep | null) => {
    stepWrites = stepWrites
      .then(() => setAnsweringStep(request.studentId, conversationId, step))
      .catch(() => undefined);
    return stepWrites;
  };
  const showStep = (step: ChatStep) => {
    emit({ type: "progress", step });
    void saveStep(step);
  };
  await saveStep("plan");
  emit({ type: "started", conversationId, studentMessage });
  emit({ type: "progress", step: "plan" });
  try {
    await answerAndSave(request, check, base, conversation, showStep, emit);
  } catch (error) {
    const isStopped = request.signal?.aborted ?? false;
    if (!isStopped) console.error("Chat answer failed", error);
    const message = await saveMessage({
      ...base,
      role: "tutor",
      content: isStopped ? stoppedMessage : unfinishedAnswerMessage,
      source: "redirect",
      citations: [],
      understoodQuestion: null,
    });
    emit({ type: "answer", message });
  } finally {
    await saveStep(null);
  }
}
