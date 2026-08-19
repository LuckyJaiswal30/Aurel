import { describe, expect, test } from "vitest";
import { detectStudyFile } from "./detect-study-file";

const encoder = new TextEncoder();

describe("detectStudyFile", () => {
  test("recognises a PDF by its bytes, not its name", async () => {
    const pdf = encoder.encode("%PDF-1.7\n1 0 obj\n<<>>\nendobj\n");
    expect(await detectStudyFile(pdf, "notes.txt")).toEqual({
      mimeType: "application/pdf",
      extension: "pdf",
    });
  });

  test("accepts plain text and Markdown files", async () => {
    expect(
      (await detectStudyFile(encoder.encode("Unit 1: Agents"), "unit1.md"))
        ?.mimeType,
    ).toBe("text/markdown");
    expect(
      (await detectStudyFile(encoder.encode("Gradient descent"), "ml.txt"))
        ?.mimeType,
    ).toBe("text/plain");
  });

  test("rejects a zip disguised as a PDF", async () => {
    const zip = new Uint8Array([
      0x50,
      0x4b,
      0x03,
      0x04,
      ...new Array(60).fill(0),
    ]);
    expect(await detectStudyFile(zip, "notes.pdf")).toBeNull();
  });

  test("rejects binary data with a text extension", async () => {
    expect(
      await detectStudyFile(new Uint8Array([0, 1, 2, 3, 255]), "notes.txt"),
    ).toBeNull();
  });

  test("rejects executables and source code archives", async () => {
    const executable = new Uint8Array([
      0x4d,
      0x5a,
      0x90,
      0x00,
      ...new Array(60).fill(0),
    ]);
    expect(await detectStudyFile(executable, "notes.pdf")).toBeNull();
  });
});
