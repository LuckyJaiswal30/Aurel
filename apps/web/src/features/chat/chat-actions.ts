"use server";

import { z } from "zod";
import { findStudentId } from "@/lib/auth/current-student";
import { rateAnswer } from "@/lib/db/conversations";
import { consumeUsage } from "@/lib/db/usage";
import { feedbackReasons, saveFeedbackDetails } from "@/lib/db/feedback";

const ratingSchema = z.object({
  messageId: z.uuid(),
  rating: z.union([z.literal(1), z.literal(-1), z.null()]),
});

const detailsSchema = z.object({
  messageId: z.uuid(),
  reasons: z.array(z.enum(feedbackReasons)).max(6),
  comment: z.string().trim().max(1000),
});

async function canSendFeedback() {
  const studentId = await findStudentId();
  if (!studentId) return false;
  const usage = await consumeUsage(`user:${studentId}`, "feedback", 60, 1, 30);
  return usage.isAllowed;
}

export async function rateTutorAnswer(
  messageId: string,
  rating: 1 | -1 | null,
) {
  const parsed = ratingSchema.safeParse({ messageId, rating });
  if (!parsed.success || !(await canSendFeedback())) return { isSaved: false };
  return rateAnswer(parsed.data.messageId, parsed.data.rating);
}

export async function explainRating(
  messageId: string,
  reasons: string[],
  comment: string,
) {
  const parsed = detailsSchema.safeParse({ messageId, reasons, comment });
  if (!parsed.success || !(await canSendFeedback())) return { isSaved: false };
  return saveFeedbackDetails(
    parsed.data.messageId,
    [...new Set(parsed.data.reasons)],
    parsed.data.comment || null,
  );
}
