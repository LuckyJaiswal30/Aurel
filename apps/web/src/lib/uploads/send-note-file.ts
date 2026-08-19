export type SendNoteResult = { isUploaded: boolean; message: string };

export async function sendNoteFile(
  subjectId: string,
  file: File,
): Promise<SendNoteResult> {
  const body = new FormData();
  body.append("subjectId", subjectId);
  body.append("file", file);
  try {
    const response = await fetch("/api/notes", { method: "POST", body });
    if (response.ok)
      return { isUploaded: true, message: "Uploaded. Checking it now." };
    const result = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;
    return {
      isUploaded: false,
      message: result?.message ?? "Upload failed. Try again.",
    };
  } catch {
    return {
      isUploaded: false,
      message: "Upload failed. Check your connection and try again.",
    };
  }
}
