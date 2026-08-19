import { NextResponse } from "next/server";
import { uploadNote } from "@/features/notes/upload-note";
import { findStudentId } from "@/lib/auth/current-student";
import { maxNoteBytes, maxNoteSizeLabel } from "@/lib/uploads/note-limits";

export async function POST(request: Request) {
  const studentId = await findStudentId();
  if (!studentId)
    return NextResponse.json(
      { message: "Sign in to upload notes." },
      { status: 401 },
    );

  const declaredLength = Number(request.headers.get("content-length"));
  if (!Number.isInteger(declaredLength) || declaredLength <= 0)
    return NextResponse.json(
      { message: "Upload one file at a time from the notes page." },
      { status: 411 },
    );
  if (declaredLength > maxNoteBytes + 1024 * 1024) {
    return NextResponse.json(
      { message: `Files can be up to ${maxNoteSizeLabel}.` },
      { status: 413 },
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { message: "That upload didn't arrive in one piece. Try again." },
      { status: 400 },
    );
  }

  const outcome = await uploadNote(studentId, formData);
  if (outcome.status === "refused") {
    return NextResponse.json(
      { message: outcome.message },
      { status: outcome.httpStatus },
    );
  }
  return NextResponse.json({ noteId: outcome.noteId }, { status: 201 });
}
