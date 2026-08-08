import { z } from "zod";

export const citationSchema = z.object({
  number: z.number().int(),
  chunkId: z.string(),
  documentId: z.string(),
  fileName: z.string(),
  pageNumber: z.number().int(),
  heading: z.string().nullable(),
  kind: z.enum(["notes", "wikipedia"]).default("notes"),
  url: z.url().nullable().default(null),
});

export type StoredCitation = z.infer<typeof citationSchema>;
