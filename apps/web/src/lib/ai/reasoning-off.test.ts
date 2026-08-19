import { describe, expect, it } from "vitest";
import { applyReasoningOff } from "@/lib/ai/reasoning-off";

describe("applyReasoningOff", () => {
  it("keeps a real reasoning level untouched", () => {
    const params = { prompt: [], reasoning: "medium" as const };
    expect(applyReasoningOff(params, "none")).toBe(params);
  });

  it("turns reasoning none into the effort the model accepts", () => {
    const result = applyReasoningOff({ prompt: [], reasoning: "none" }, "low");
    expect(result.reasoning).toBeUndefined();
    expect(result.providerOptions).toEqual({
      groq: { reasoningEffort: "low" },
    });
  });

  it("sends no effort to models that reject it", () => {
    const result = applyReasoningOff(
      { prompt: [], reasoning: "none" },
      undefined,
    );
    expect(result.reasoning).toBeUndefined();
    expect(result.providerOptions).toBeUndefined();
  });

  it("keeps other provider options", () => {
    const result = applyReasoningOff(
      { prompt: [], providerOptions: { groq: { user: "a" }, other: { x: 1 } } },
      "none",
    );
    expect(result.providerOptions).toEqual({
      groq: { user: "a", reasoningEffort: "none" },
      other: { x: 1 },
    });
  });
});
