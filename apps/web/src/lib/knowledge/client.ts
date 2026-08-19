import { z } from "zod";
import { readServerEnv } from "@/lib/server-env";

const previewSchema = z.object({
  pageCount: z.number().int().nonnegative(),
  sampleText: z.string(),
  rejection: z.string().max(300).nullable().default(null),
});

export type DocumentPreview = z.infer<typeof previewSchema>;

async function callKnowledgeService(
  path: string,
  timeoutMilliseconds: number,
  body?: unknown,
) {
  const { knowledgeServiceUrl, knowledgeServiceToken } = readServerEnv();
  return fetch(new URL(path, knowledgeServiceUrl), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${knowledgeServiceToken}`,
      ...(body === undefined ? {} : { "Content-Type": "application/json" }),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(timeoutMilliseconds),
  });
}

export async function previewDocument(
  documentId: string,
): Promise<DocumentPreview> {
  const response = await callKnowledgeService(
    `/documents/${documentId}/preview`,
    120_000,
  );
  if (!response.ok)
    throw new Error(`Preview failed with status ${response.status}`);
  return previewSchema.parse(await response.json());
}

const chunkCountSchema = z.object({
  chunkCount: z.number().int().nonnegative(),
});
const longTaskMilliseconds = 15 * 60 * 1000;

async function runDocumentTask(documentId: string, task: "read" | "embed") {
  const response = await callKnowledgeService(
    `/documents/${documentId}/${task}`,
    longTaskMilliseconds,
  );
  if (!response.ok)
    throw new Error(`Document ${task} failed with status ${response.status}`);
  return chunkCountSchema.parse(await response.json()).chunkCount;
}

export function readDocument(documentId: string) {
  return runDocumentTask(documentId, "read");
}

export function embedDocument(documentId: string) {
  return runDocumentTask(documentId, "embed");
}

const promptAttackSchema = z.object({
  maliciousScore: z.number().min(0).max(1),
});

export async function scorePromptAttack(texts: string[]) {
  const response = await callKnowledgeService("/guard/prompt-attack", 60_000, {
    texts: [...new Set(texts)].slice(0, 8),
  });
  if (!response.ok)
    throw new Error(`Prompt check failed with status ${response.status}`);
  return promptAttackSchema.parse(await response.json()).maliciousScore;
}

const searchResultSchema = z.object({
  chunkId: z.string(),
  documentId: z.string(),
  fileName: z.string(),
  pageNumber: z.number().int(),
  heading: z.string().nullable(),
  content: z.string(),
  score: z.number(),
  sectionId: z.string(),
  sectionContent: z.string(),
  sectionPageStart: z.number().int(),
  sectionPageEnd: z.number().int(),
});
const searchResponseSchema = z.object({ results: z.array(searchResultSchema) });

export type NotePassageResult = z.infer<typeof searchResultSchema>;

export type SearchNotesInput = {
  studentId: string;
  subjectId: string;
  question: string;
  queries: string[];
  limit: number;
};

export async function searchNotes(input: SearchNotesInput) {
  const response = await callKnowledgeService("/search", 60_000, input);
  if (!response.ok)
    throw new Error(`Search failed with status ${response.status}`);
  return searchResponseSchema.parse(await response.json()).results;
}
