import { generateText, Output, type ModelMessage } from "ai";
import { guardSettings } from "@/lib/ai/models";
import { guardVerdictSchema } from "@/lib/ai/guard-policy";

export type HarmVerdict = "safe" | "care" | "harmful";

const nonBlockingCategories = new Set(["S5", "S6", "S7", "S8", "S13"]);

export function readGuardReply(reply: string): HarmVerdict {
  const [label, codeLine = ""] = reply.trim().split("\n");
  if (label?.trim().toLowerCase() !== "unsafe") return "safe";
  const codes = codeLine
    .split(",")
    .map((code) => code.trim().toUpperCase())
    .filter(Boolean);
  if (codes.length === 0) return "harmful";
  if (codes.includes("S11")) return "care";
  return codes.every((code) => nonBlockingCategories.has(code))
    ? "safe"
    : "harmful";
}

async function askGuard(messages: ModelMessage[]) {
  const { replyKind, ...settings } = guardSettings();
  const call = {
    ...settings,
    messages,
    temperature: 0,
    maxRetries: 1,
    timeout: 60_000,
  };
  if (replyKind === "text") {
    const { text } = await generateText(call);
    return readGuardReply(text);
  }
  const { output } = await generateText({
    ...call,
    output: Output.object({ schema: guardVerdictSchema }),
  });
  return readGuardReply(
    output.verdict === "unsafe"
      ? `unsafe\n${output.categories.join(",")}`
      : "safe",
  );
}

export function checkQuestionHarm(question: string) {
  return askGuard([{ role: "user", content: question }]);
}

export function checkAnswerHarm(question: string, answer: string) {
  return askGuard([
    { role: "user", content: question },
    { role: "assistant", content: answer },
  ]);
}
