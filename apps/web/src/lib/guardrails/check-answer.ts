export const maxCodeLines = 25;

const codeFence = /```[^\n]*\n([\s\S]*?)```/g;
const personalDetailPatterns = [
  /[\w.+-]+@[\w-]+\.[\w.]{2,}/,
  /(?<![\d.,])(?:\+91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}(?![\d.,]?\d)/,
  /(?<![\d.,])[2-9]\d{3}[\s-]?\d{4}[\s-]?\d{4}(?![\d.,]?\d)/,
  /\b[A-Z]{5}\d{4}[A-Z]\b/,
];

export function measureCode(answer: string) {
  const blocks = [...answer.matchAll(codeFence)].map((match) => match[1] ?? "");
  const lines = blocks.reduce(
    (total, block) =>
      total + block.split("\n").filter((line) => line.trim() !== "").length,
    0,
  );
  return { blocks: blocks.length, lines };
}

export function isWithinCodeLimit(answer: string) {
  const { blocks, lines } = measureCode(answer);
  return blocks <= 1 && lines <= maxCodeLines;
}

export function leaksCanary(answer: string, canaryWord: string) {
  const squashed = answer.toLowerCase().replace(/[^a-z0-9]/g, "");
  return squashed.includes(canaryWord.toLowerCase().replace(/[^a-z0-9]/g, ""));
}

export function findUnknownCitations(
  citedChunkIds: string[],
  retrievedChunkIds: string[],
) {
  const known = new Set(retrievedChunkIds);
  return citedChunkIds.filter((chunkId) => !known.has(chunkId));
}

export function containsPersonalDetails(answer: string) {
  return personalDetailPatterns.some((pattern) => pattern.test(answer));
}

export function hidePersonalDetails(text: string) {
  return personalDetailPatterns.reduce(
    (current, pattern) =>
      current.replace(new RegExp(pattern.source, "g"), "[hidden]"),
    text,
  );
}
