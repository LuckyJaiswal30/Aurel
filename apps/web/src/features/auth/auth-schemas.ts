import { z } from "zod";

const email = z
  .string()
  .trim()
  .toLowerCase()
  .max(254, { error: "Enter a valid email address." })
  .pipe(z.email({ error: "Enter a valid email address." }));

export const signInSchema = z.object({
  email,
  password: z.string().min(1, { error: "Enter your password." }).max(128),
});

export const signUpSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(1, { error: "Tell us what to call you." })
    .max(80, { error: "Keep your name under 80 characters." }),
  email,
  password: z
    .string()
    .min(10, { error: "Use at least 10 characters." })
    .max(128, { error: "Keep it under 128 characters." })
    .regex(/[A-Za-z]/, { error: "Include at least one letter." })
    .regex(/[0-9]/, { error: "Include at least one number." }),
  consent: z.literal("on", {
    error: "Agree to this so Aurel can store your notes.",
  }),
});
