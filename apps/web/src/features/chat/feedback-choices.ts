import type { FeedbackReason } from "@/lib/db/feedback";

type FeedbackChoice = { reason: FeedbackReason; label: string };

export const helpfulChoices: FeedbackChoice[] = [
  { reason: "clear", label: "Clear explanation" },
  { reason: "right_length", label: "Right length" },
  { reason: "good_examples", label: "Good examples" },
  { reason: "used_my_notes", label: "Used my notes" },
];

export const unhelpfulChoices: FeedbackChoice[] = [
  { reason: "wrong", label: "Wrong or inaccurate" },
  { reason: "too_long", label: "Too long" },
  { reason: "too_short", label: "Not enough detail" },
  { reason: "unclear", label: "Hard to follow" },
  { reason: "not_from_notes", label: "Didn't use my notes" },
];
