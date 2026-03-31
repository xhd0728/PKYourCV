import { z } from "zod";

const appConfigSchema = z.object({
  DATABASE_URL: z.string().min(1).default("file:./prisma/dev.db"),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60_000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(12),
  MAX_UPLOAD_MB: z.coerce.number().positive().default(8),
});

const modelConfigSchema = z.object({
  OPENAI_BASE_URL: z.string().url(),
  OPENAI_API_KEY: z.string().min(1),
  OPENAI_MODEL: z.string().min(1),
});

type AppConfig = z.infer<typeof appConfigSchema>;
type ModelConfig = z.infer<typeof modelConfigSchema>;

let cachedAppConfig: AppConfig | null = null;
let cachedModelConfig: ModelConfig | null = null;

export function getAppConfig(): AppConfig {
  if (cachedAppConfig) {
    return cachedAppConfig;
  }

  const parsed = appConfigSchema.safeParse(process.env);

  if (!parsed.success) {
    throw new Error(`Invalid application configuration: ${parsed.error.message}`);
  }

  cachedAppConfig = parsed.data;
  return cachedAppConfig;
}

export function getModelConfig(): ModelConfig {
  if (cachedModelConfig) {
    return cachedModelConfig;
  }

  const parsed = modelConfigSchema.safeParse(process.env);

  if (!parsed.success) {
    throw new Error(
      "Model configuration is incomplete. Set OPENAI_BASE_URL, OPENAI_API_KEY, and OPENAI_MODEL.",
    );
  }

  cachedModelConfig = parsed.data;
  return cachedModelConfig;
}
