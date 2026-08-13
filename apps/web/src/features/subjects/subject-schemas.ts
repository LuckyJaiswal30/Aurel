import { z } from "zod";
import { todayInIndia } from "@/lib/dates/days-until";

export const subjectIdSchema = z.uuid({ error: "That subject doesn't exist." });

export const subjectNameSchema = z
  .string()
  .trim()
  .min(1, { error: "Give the subject a name." })
  .max(80, { error: "Keep the name under 80 characters." });

export const examDateSchema = z
  .union([z.literal(""), z.iso.date({ error: "Pick a real date." })])
  .transform((value) => (value === "" ? null : value))
  .refine((value) => value === null || value >= todayInIndia(), {
    error: "Pick today or a date after it.",
  })
  .refine((value) => value === null || value <= "2100-12-31", {
    error: "Pick a date before 2101.",
  });

export const newSubjectSchema = z.object({
  name: subjectNameSchema,
  examDate: examDateSchema.optional().transform((value) => value ?? null),
});
