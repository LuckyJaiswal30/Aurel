import { z } from "zod";

const serverEnvSchema = z
  .object({
    supabaseSecretKey: z.string().min(20),
    knowledgeServiceUrl: z.url(),
    knowledgeServiceToken: z.string().min(32),
    modelProvider: z.enum(["ollama", "groq"]),
    ollamaBaseUrl: z.url().optional(),
    groqApiKey: z.string().min(20).optional(),
    ipHashSecret: z.string().min(32),
  })
  .superRefine((env, context) => {
    if (env.modelProvider === "ollama" && !env.ollamaBaseUrl)
      context.addIssue({
        code: "custom",
        path: ["ollamaBaseUrl"],
        message: "OLLAMA_BASE_URL is needed when MODEL_PROVIDER is ollama",
      });
    if (env.modelProvider === "groq" && !env.groqApiKey)
      context.addIssue({
        code: "custom",
        path: ["groqApiKey"],
        message: "GROQ_API_KEY is needed when MODEL_PROVIDER is groq",
      });
  });

let cachedServerEnv: z.infer<typeof serverEnvSchema> | undefined;

export function readServerEnv() {
  if (typeof window !== "undefined")
    throw new Error("Server settings are not available in the browser");
  cachedServerEnv ??= serverEnvSchema.parse({
    supabaseSecretKey: process.env.SUPABASE_SECRET_KEY,
    knowledgeServiceUrl: process.env.KNOWLEDGE_SERVICE_URL,
    knowledgeServiceToken: process.env.KNOWLEDGE_SERVICE_TOKEN,
    modelProvider: process.env.MODEL_PROVIDER || "ollama",
    ollamaBaseUrl: process.env.OLLAMA_BASE_URL || undefined,
    groqApiKey: process.env.GROQ_API_KEY || undefined,
    ipHashSecret: process.env.IP_HASH_SECRET,
  });
  return cachedServerEnv;
}
