import { createAdminSupabase } from "@/lib/supabase/admin-client";
import { createServerSupabase } from "@/lib/supabase/server-client";

export const feedbackReasons = [
  "wrong",
  "too_long",
  "too_short",
  "unclear",
  "not_from_notes",
  "clear",
  "right_length",
  "good_examples",
  "used_my_notes",
] as const;

export type FeedbackReason = (typeof feedbackReasons)[number];

export type PastFeedback = {
  rating: -1 | 1;
  reasons: FeedbackReason[];
  format: string | null;
  answer: string;
};

export async function saveFeedbackDetails(
  messageId: string,
  reasons: FeedbackReason[],
  comment: string | null,
) {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("message_feedback")
    .update({ reasons, comment, is_wrong: reasons.includes("wrong") })
    .eq("message_id", messageId)
    .select("message_id");
  return { isSaved: !error && data.length === 1 };
}

function readReasons(value: string[]): FeedbackReason[] {
  return value.filter((reason): reason is FeedbackReason =>
    (feedbackReasons as readonly string[]).includes(reason),
  );
}

export async function listRecentFeedback(
  studentId: string,
  limit = 20,
): Promise<PastFeedback[]> {
  const { data, error } = await createAdminSupabase()
    .from("message_feedback")
    .select("rating, reasons, messages(content, answer_format)")
    .eq("user_id", studentId)
    .not("rating", "is", null)
    .order("updated_at", { ascending: false })
    .limit(limit);
  if (error) return [];
  return data.flatMap((row) => {
    const message = Array.isArray(row.messages)
      ? row.messages[0]
      : row.messages;
    if (!message || (row.rating !== 1 && row.rating !== -1)) return [];
    return [
      {
        rating: row.rating,
        reasons: readReasons(row.reasons),
        format: message.answer_format,
        answer: message.content,
      },
    ];
  });
}
