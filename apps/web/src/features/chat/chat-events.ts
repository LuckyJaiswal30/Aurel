import { z } from "zod";
import { citationSchema } from "@/lib/db/citation-schema";

const chatMessageSchema = z.object({
  id: z.string(),
  role: z.enum(["student", "tutor"]),
  content: z.string(),
  source: z
    .enum(["notes", "reference_library", "general_knowledge", "redirect"])
    .nullable(),
  citations: z.array(citationSchema),
  rating: z.union([z.literal(1), z.literal(-1), z.null()]),
  createdAt: z.string(),
});

export const chatEventSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("started"),
    conversationId: z.string().nullable(),
    studentMessage: chatMessageSchema,
  }),
  z.object({
    type: z.literal("progress"),
    step: z.enum([
      "checking",
      "plan",
      "search",
      "evidence",
      "write",
      "check",
      "revise",
      "review",
    ]),
  }),
  z.object({ type: z.literal("thought"), text: z.string().max(2000) }),
  z.object({ type: z.literal("reasoning"), text: z.string().max(20000) }),
  z.object({
    type: z.literal("draft"),
    text: z.string().max(20000),
    isVisible: z.boolean(),
  }),
  z.object({ type: z.literal("answer"), message: chatMessageSchema }),
  z.object({ type: z.literal("failed"), message: z.string() }),
]);

export type ParsedChatEvent = z.infer<typeof chatEventSchema>;

export function parseChatEvent(line: string): ParsedChatEvent | null {
  try {
    const parsed = chatEventSchema.safeParse(JSON.parse(line));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}
