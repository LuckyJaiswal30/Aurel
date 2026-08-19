import { fileTypeFromBuffer } from "file-type";

export type StudyFileKind = {
  mimeType: string;
  extension: string;
};

const binaryKinds: Record<string, StudyFileKind> = {
  pdf: { mimeType: "application/pdf", extension: "pdf" },
  docx: {
    mimeType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    extension: "docx",
  },
  pptx: {
    mimeType:
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    extension: "pptx",
  },
  png: { mimeType: "image/png", extension: "png" },
  jpg: { mimeType: "image/jpeg", extension: "jpg" },
  webp: { mimeType: "image/webp", extension: "webp" },
};

function isReadableText(bytes: Uint8Array) {
  if (bytes.includes(0)) return false;
  try {
    new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    return true;
  } catch {
    return false;
  }
}

export async function detectStudyFile(
  bytes: Uint8Array,
  fileName: string,
): Promise<StudyFileKind | null> {
  const detected = await fileTypeFromBuffer(bytes);
  if (detected) return binaryKinds[detected.ext] ?? null;

  const lowerName = fileName.toLowerCase();
  if (!isReadableText(bytes)) return null;
  if (lowerName.endsWith(".md"))
    return { mimeType: "text/markdown", extension: "md" };
  if (lowerName.endsWith(".txt"))
    return { mimeType: "text/plain", extension: "txt" };
  return null;
}
