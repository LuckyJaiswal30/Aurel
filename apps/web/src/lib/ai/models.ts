import { createGroq } from "@ai-sdk/groq";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { wrapLanguageModel } from "ai";
import { readServerEnv } from "@/lib/server-env";
import { groqGuardPolicy } from "@/lib/ai/guard-policy";
import { applyReasoningOff, type ReasoningOff } from "@/lib/ai/reasoning-off";

function createOllama() {
  return createOpenAICompatible({
    name: "ollama",
    baseURL: readServerEnv().ollamaBaseUrl ?? "http://127.0.0.1:11434/v1",
    supportsStructuredOutputs: true,
  });
}

function groqModel(id: string, whenOff: ReasoningOff) {
  return wrapLanguageModel({
    model: createGroq({ apiKey: readServerEnv().groqApiKey })(id),
    middleware: {
      transformParams: async ({ params }) => applyReasoningOff(params, whenOff),
    },
  });
}

function isGroq() {
  return readServerEnv().modelProvider === "groq";
}

export function fastHelperModel() {
  if (isGroq()) return groqModel("openai/gpt-oss-20b", "low");
  return createOllama()("qwen3.5:2b");
}

export function plannerModel() {
  if (isGroq()) return groqModel("openai/gpt-oss-20b", "low");
  return createOllama()("aurel-tutor");
}

export function tutorModel() {
  if (isGroq()) return groqModel("qwen/qwen3.8-27b", "none");
  return createOllama()("aurel-tutor");
}

export function checkerModel() {
  if (isGroq()) return groqModel("openai/gpt-oss-120b", "low");
  return createOllama()("aurel-checker");
}

export function scopeJudgeModel() {
  if (isGroq()) return groqModel("openai/gpt-oss-20b", "low");
  return createOllama()("aurel-helper");
}

export function quickAnswerModel() {
  if (isGroq()) return groqModel("openai/gpt-oss-20b", "low");
  return createOllama()("aurel-helper");
}

export function guardSettings() {
  if (isGroq())
    return {
      model: groqModel("openai/gpt-oss-safeguard-20b", "low"),
      system: groqGuardPolicy,
      maxOutputTokens: 400,
      replyKind: "json" as const,
    };
  return {
    model: createOllama()("llama-guard3:1b"),
    system: undefined,
    maxOutputTokens: 20,
    replyKind: "text" as const,
  };
}
