import type { LanguageModelMiddleware } from "ai";

export type ReasoningOff = "none" | "low" | undefined;

type CallParams = Parameters<
  NonNullable<LanguageModelMiddleware["transformParams"]>
>[0]["params"];

// Groq only takes "none" for some models and rejects any effort on others, so the
// caller's `reasoning: "none"` is turned into what each model accepts.
export function applyReasoningOff(
  params: CallParams,
  whenOff: ReasoningOff,
): CallParams {
  if (params.reasoning !== undefined && params.reasoning !== "none")
    return params;
  const rest = { ...params, reasoning: undefined };
  if (whenOff === undefined) return rest;
  return {
    ...rest,
    providerOptions: {
      ...params.providerOptions,
      groq: { ...params.providerOptions?.groq, reasoningEffort: whenOff },
    },
  };
}
