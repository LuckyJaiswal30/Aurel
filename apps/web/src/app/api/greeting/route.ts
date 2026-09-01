import { z } from "zod";
import { collectGreetingFacts } from "@/features/chat/collect-greeting-facts";
import { greetStudent } from "@/features/chat/greet-student";
import { findCurrentStudent } from "@/lib/auth/current-student";
import { consumeUsage } from "@/lib/db/usage";

const greetingRequestSchema = z.object({
  hour: z.int().min(0).max(23),
  weekday: z.int().min(0).max(6),
});

export async function POST(request: Request) {
  const student = await findCurrentStudent();
  if (!student)
    return Response.json({ message: "Sign in first." }, { status: 401 });
  const body = greetingRequestSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!body.success)
    return Response.json({ message: "Send the local time." }, { status: 400 });

  const usage = await consumeUsage(
    `user:${student.id}`,
    "greeting",
    3600,
    1,
    30,
  );
  if (!usage.isAllowed)
    return Response.json({
      text: `What are we studying today, ${student.displayName.split(" ")[0]}?`,
    });
  const facts = await collectGreetingFacts(student, body.data);
  const text = await greetStudent(student.id, facts);
  return Response.json({ text });
}
