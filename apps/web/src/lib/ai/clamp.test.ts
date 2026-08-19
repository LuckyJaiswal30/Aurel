import { describe, expect, it } from "vitest";
import { z } from "zod";
import { clampedList, clampedText } from "@/lib/ai/clamp";

describe("clamping model replies", () => {
  it("shortens long text instead of rejecting it", () => {
    expect(clampedText(5).parse("abcdefgh")).toBe("abcde");
  });

  it("keeps only the first items of a long list", () => {
    expect(clampedList(clampedText(3), 2).parse(["aaaa", "bb", "c"])).toEqual([
      "aaa",
      "bb",
    ]);
  });

  it("leaves no length limits in the JSON schema", () => {
    const schema = z.toJSONSchema(
      z.object({ text: clampedText(5), list: clampedList(z.string(), 2) }),
    );
    expect(JSON.stringify(schema)).not.toMatch(/maxLength|maxItems/);
  });
});
