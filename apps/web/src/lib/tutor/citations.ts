import type { Passage } from "./passages";

export type Citation = {
  number: number;
  chunkId: string;
  documentId: string;
  fileName: string;
  pageNumber: number;
  heading: string | null;
  kind: "notes" | "wikipedia";
  url: string | null;
};

const citationMark = /\[(\d{1,2}(?:\s*,\s*\d{1,2})*)\]/g;
const codePart = /(```[\s\S]*?```|`[^`\n]*`)/;

export function readCitations(
  answer: string,
  passages: Passage[],
): { answer: string; citations: Citation[] } {
  const used = new Map<number, Citation>();
  const replaceMarks = (text: string) =>
    text.replace(citationMark, (_mark, numbers: string) => {
      const valid = numbers
        .split(",")
        .map((value) => Number(value.trim()))
        .filter((number) => passages[number - 1] !== undefined);
      for (const number of valid) {
        const passage = passages[number - 1];
        if (passage && !used.has(number))
          used.set(number, {
            number,
            chunkId: passage.chunkId,
            documentId: passage.documentId,
            fileName: passage.fileName,
            pageNumber: passage.pageNumber,
            heading: passage.heading,
            kind: passage.kind,
            url: passage.url,
          });
      }
      return valid.length > 0 ? `[${valid.join(", ")}]` : "";
    });
  const cleaned = answer
    .split(codePart)
    .map((part, index) =>
      index % 2 === 1 ? part : replaceMarks(part).replace(/ +([.,;:])/g, "$1"),
    )
    .join("");
  return {
    answer: cleaned,
    citations: [...used.values()].sort((a, b) => a.number - b.number),
  };
}
