import type { NotePassageResult } from "@/lib/knowledge/client";
import type { WikipediaArticle } from "@/lib/reference/wikipedia";

export type Passage = NotePassageResult & {
  kind: "notes" | "wikipedia";
  url: string | null;
};

export function fromNotes(results: NotePassageResult[]): Passage[] {
  return results.map((result) => ({ ...result, kind: "notes", url: null }));
}

export function fromWikipedia(articles: WikipediaArticle[]): Passage[] {
  return articles.map((article) => ({
    chunkId: `wikipedia:${article.pageId}`,
    documentId: "wikipedia",
    fileName: "Wikipedia",
    pageNumber: 1,
    heading: article.title,
    content: article.text,
    score: 0,
    sectionId: `wikipedia:${article.pageId}`,
    sectionContent: article.text,
    sectionPageStart: 1,
    sectionPageEnd: 1,
    kind: "wikipedia",
    url: article.url,
  }));
}

export function describePassage(passage: Passage) {
  return passage.kind === "wikipedia"
    ? `Wikipedia: ${passage.heading ?? ""}`
    : `${passage.heading ?? passage.fileName}, page ${passage.pageNumber}`;
}
