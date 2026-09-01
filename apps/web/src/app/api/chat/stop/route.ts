import { z } from "zod";
import { stopAnswer } from "@/features/chat/stop-registry";
import { findCurrentStudent } from "@/lib/auth/current-student";

const stopRequestSchema = z.object({ requestId: z.uuid() });

export async function POST(request: Request) {
  const student = await findCurrentStudent();
  if (!student)
    return Response.json({ message: "Sign in first." }, { status: 401 });
  const body = stopRequestSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!body.success)
    return Response.json({ message: "Nothing to stop." }, { status: 400 });
  return Response.json({
    isStopped: stopAnswer(body.data.requestId, student.id),
  });
}
