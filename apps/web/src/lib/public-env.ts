import { z } from "zod";

const publicEnvSchema = z.object({
  supabaseUrl: z.url(),
  supabasePublishableKey: z.string().min(20),
  siteUrl: z.url(),
});

export const publicEnv = publicEnvSchema.parse({
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabasePublishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
});
