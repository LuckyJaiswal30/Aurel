import { z } from "zod";
import { askTutor, type ChatEvent } from "@/features/chat/ask-tutor";
import { finishAnswer, startAnswer } from "@/features/chat/stop-registry";
import { findCurrentStudent } from "@/lib/auth/current-student";
import { findSubject, listSubjects } from "@/lib/db/subjects";
import { readClientIp } from "@/lib/guardrails/hash-ip";

const chatRequestSchema = z.object({
  subjectId: z.uuid().nullable(),
  conversationId: z.uuid().nullable(),
  question: z.string().trim().min(1).max(4000),
  editMessageId: z.uuid().nullable().default(null),
  requestId: z.uuid(),
});

const failureMessage =
  "Something went wrong while answering. Your question is saved; try asking again.";

export async function POST(request: Request) {
  const student = await findCurrentStudent();
  if (!student)
    return Response.json(
      { message: "Sign in to ask questions." },
      { status: 401 },
    );
  const body = chatRequestSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!body.success)
    return Response.json(
      { message: "Ask a question of up to 4,000 characters." },
      { status: 400 },
    );
  const [subject, subjects] = await Promise.all([
    body.data.subjectId ? findSubject(body.data.subjectId) : null,
    listSubjects(),
  ]);
  if (body.data.subjectId && !subject)
    return Response.json(
      { message: "That subject doesn't exist." },
      { status: 404 },
    );

  const signal = startAnswer(body.data.requestId, student.id);
  const encoder = new TextEncoder();
  let isClosed = false;
  const stream = new ReadableStream<Uint8Array>({
    cancel() {
      isClosed = true;
    },
    async start(controller) {
      const emit = (event: ChatEvent) => {
        if (isClosed) return;
        try {
          controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
        } catch {
          isClosed = true;
        }
      };
      try {
        await askTutor(
          {
            studentId: student.id,
            ipAddress: readClientIp(request.headers),
            profile: student.profile,
            subject,
            subjectNames: subjects.map((item) => item.name),
            conversationId: body.data.conversationId,
            question: body.data.question,
            editMessageId: body.data.editMessageId,
            signal,
          },
          emit,
        );
      } catch (error) {
        console.error("Chat answer failed", error);
        emit({ type: "failed", message: failureMessage });
      } finally {
        finishAnswer(body.data.requestId);
        if (!isClosed) controller.close();
      }
    },
  });
  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
