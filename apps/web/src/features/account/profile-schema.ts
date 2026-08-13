import { z } from "zod";

export const displayNameSchema = z
  .string()
  .trim()
  .min(1, { error: "Tell us what to call you." })
  .max(80, { error: "Keep your name under 80 characters." });

export const studyProfileSchema = z.object({
  course: z
    .string()
    .trim()
    .max(80, { error: "Keep the course under 80 characters." })
    .transform((value) => (value === "" ? null : value)),
  studyYear: z
    .union([z.literal(""), z.coerce.number().int().min(1).max(8)], {
      error: "Pick a year from 1 to 8.",
    })
    .transform((value) => (value === "" ? null : value)),
  preferredLanguage: z.enum(["english", "hindi", "hinglish"], {
    error: "Pick a language.",
  }),
  explanationLevel: z.enum(["simpler", "standard", "deeper"], {
    error: "Pick a level.",
  }),
});
