import { cache } from "react";
import { z } from "zod";
import { citationSchema, type StoredCitation } from "@/lib/db/citation-schema";
import { createAdminSupabase } from "@/lib/supabase/admin-client";
import { createServerSupabase } from "@/lib/supabase/server-client";

export type { StoredCitation };
export type AnswerSourceLabel =
  "notes" | "reference_library" | "general_knowledge" | "redirect";

export type ChatMessage = {
  id: string;
  role: "student" | "tutor";
  content: string;
  source: AnswerSourceLabel | null;
  citations: StoredCitation[];
  rating: -1 | 1 | null;
  createdAt: string;
};

export type ConversationSummary = {
  id: string;
  subjectId: string | null;
  title: string;
  updatedAt: string;
  answeringStep: string | null;
};

const answeringLimitMilliseconds = 11 * 60 * 1000;

function readAnsweringStep(step: string | null, since: string | null) {
  if (!step || !since) return null;
  const isStale = Date.now() - Date.parse(since) > answeringLimitMilliseconds;
  return isStale ? null : step;
}

export async function setAnsweringStep(
  studentId: string,
  conversationId: string,
  step: string | null,
) {
  await createAdminSupabase()
    .from("conversations")
    .update(
      step
        ? { answering_step: step, answering_since: new Date().toISOString() }
        : { answering_step: null, answering_since: null },
    )
    .eq("id", conversationId)
    .eq("user_id", studentId);
}

const citationsSchema = z.array(citationSchema).catch([]);

export async function startConversation(
  subjectId: string | null,
  title: string,
) {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("conversations")
    .insert({ subject_id: subjectId, title })
    .select("id")
    .single();
  if (error) throw new Error("Could not start the chat");
  return data.id;
}

export async function findConversation(conversationId: string) {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("conversations")
    .select(
      "id, subject_id, title, updated_at, answering_step, answering_since",
    )
    .eq("id", conversationId)
    .maybeSingle();
  if (error) throw new Error("Could not load the chat");
  return data
    ? {
        id: data.id,
        subjectId: data.subject_id,
        title: data.title,
        updatedAt: data.updated_at,
        answeringStep: readAnsweringStep(
          data.answering_step,
          data.answering_since,
        ),
      }
    : null;
}

const summaryColumns =
  "id, subject_id, title, updated_at, answering_step, answering_since";

type SummaryRow = {
  id: string;
  subject_id: string | null;
  title: string;
  updated_at: string;
  answering_step: string | null;
  answering_since: string | null;
};

function toSummary(row: SummaryRow): ConversationSummary {
  return {
    id: row.id,
    subjectId: row.subject_id,
    title: row.title,
    updatedAt: row.updated_at,
    answeringStep: readAnsweringStep(row.answering_step, row.answering_since),
  };
}

export const listRecentConversations = cache(
  async (limit = 20): Promise<ConversationSummary[]> => {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase
      .from("conversations")
      .select(summaryColumns)
      .order("updated_at", { ascending: false })
      .limit(limit);
    if (error) throw new Error("Could not load chats");
    return data.map(toSummary);
  },
);

export async function listSubjectConversations(
  subjectId: string,
  limit = 30,
): Promise<ConversationSummary[]> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("conversations")
    .select(summaryColumns)
    .eq("subject_id", subjectId)
    .order("updated_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error("Could not load chats");
  return data.map(toSummary);
}

export async function listConversationMessages(
  conversationId: string,
): Promise<ChatMessage[]> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("messages")
    .select(
      "id, role, content, answer_source, citations, created_at, message_feedback(rating)",
    )
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });
  if (error) throw new Error("Could not load messages");
  return data.map((row) => {
    const feedback = Array.isArray(row.message_feedback)
      ? row.message_feedback[0]
      : row.message_feedback;
    return {
      id: row.id,
      role: row.role,
      content: row.content,
      source: row.answer_source,
      citations: citationsSchema.parse(row.citations),
      rating:
        feedback?.rating === 1 || feedback?.rating === -1
          ? feedback.rating
          : null,
      createdAt: row.created_at,
    };
  });
}

export type NewChatMessage = {
  studentId: string;
  conversationId: string;
  role: "student" | "tutor";
  content: string;
  source: AnswerSourceLabel | null;
  citations: StoredCitation[];
  understoodQuestion: string | null;
  format?: string | null;
};

export async function saveChatMessage(message: NewChatMessage) {
  const supabase = createAdminSupabase();
  const { data, error } = await supabase
    .from("messages")
    .insert({
      user_id: message.studentId,
      conversation_id: message.conversationId,
      role: message.role,
      content: message.content.slice(0, 20000),
      answer_source: message.source,
      citations: message.citations,
      understood_question: message.understoodQuestion?.slice(0, 2000) ?? null,
      answer_format: message.format ?? null,
    })
    .select("id, created_at")
    .single();
  if (error) throw new Error("Could not save the message");
  await supabase
    .from("conversations")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", message.conversationId);
  return { id: data.id, createdAt: data.created_at };
}

export async function listRecentQuestions(conversationId: string, limit = 4) {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("messages")
    .select("content")
    .eq("conversation_id", conversationId)
    .eq("role", "student")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error("Could not load recent questions");
  return data.map((row) => row.content).reverse();
}

export async function rateAnswer(messageId: string, rating: -1 | 1 | null) {
  const supabase = await createServerSupabase();
  if (rating === null) {
    const { error } = await supabase
      .from("message_feedback")
      .delete()
      .eq("message_id", messageId);
    return { isSaved: !error };
  }
  const inserted = await supabase
    .from("message_feedback")
    .insert({ message_id: messageId, rating });
  if (!inserted.error) return { isSaved: true };
  if (inserted.error.code !== "23505") return { isSaved: false };
  const { error } = await supabase
    .from("message_feedback")
    .update({ rating })
    .eq("message_id", messageId);
  return { isSaved: !error };
}

export async function deleteMessagesFrom(
  studentId: string,
  conversationId: string,
  messageId: string,
) {
  const supabase = createAdminSupabase();
  const { data } = await supabase
    .from("messages")
    .select("created_at")
    .eq("id", messageId)
    .eq("conversation_id", conversationId)
    .eq("user_id", studentId)
    .maybeSingle();
  if (!data) return { isDeleted: false };
  const { error } = await supabase
    .from("messages")
    .delete()
    .eq("conversation_id", conversationId)
    .eq("user_id", studentId)
    .gte("created_at", data.created_at);
  return { isDeleted: !error };
}

export async function listRecentTurns(conversationId: string, limit = 4) {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("messages")
    .select("role, content")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) return [];
  return data.reverse();
}

export async function renameConversation(
  conversationId: string,
  title: string,
) {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("conversations")
    .update({ title })
    .eq("id", conversationId)
    .select("id");
  return { isRenamed: !error && data.length === 1 };
}

export async function removeConversation(conversationId: string) {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("conversations")
    .delete()
    .eq("id", conversationId)
    .select("id");
  return { isRemoved: !error && data.length === 1 };
}

export async function removeAllConversations(studentId: string) {
  const supabase = await createServerSupabase();
  const { error } = await supabase
    .from("conversations")
    .delete()
    .eq("user_id", studentId);
  return { isRemoved: !error };
}
