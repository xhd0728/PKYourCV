import OpenAI from "openai";
import type { z } from "zod";

import { getModelConfig } from "@/lib/env";
import { parseModelJson } from "@/lib/model/json";
import { AppError } from "@/lib/utils";

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type ChatResponder = (input: {
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
}) => Promise<string>;

const globalForOpenAI = globalThis as typeof globalThis & {
  openaiClient?: OpenAI;
};

function getOpenAIClient() {
  if (globalForOpenAI.openaiClient) {
    return globalForOpenAI.openaiClient;
  }

  const config = getModelConfig();

  globalForOpenAI.openaiClient = new OpenAI({
    apiKey: config.OPENAI_API_KEY,
    baseURL: config.OPENAI_BASE_URL,
  });

  return globalForOpenAI.openaiClient;
}

function readMessageText(content: unknown): string {
  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === "string") {
          return part;
        }

        if (part && typeof part === "object" && "text" in part) {
          const text = part.text;
          return typeof text === "string" ? text : "";
        }

        return "";
      })
      .join("\n")
      .trim();
  }

  return "";
}

export function createOpenAIResponder(): ChatResponder {
  return async ({ messages, temperature = 0.4, max_tokens = 900 }) => {
    const config = getModelConfig();
    const client = getOpenAIClient();
    const response = await client.chat.completions.create({
      model: config.OPENAI_MODEL,
      messages,
      temperature,
      max_tokens,
    });

    const content = readMessageText(response.choices[0]?.message?.content);

    if (!content) {
      throw new AppError("模型没回话，像开会时突然失联。", 502);
    }

    return content;
  };
}

export async function requestStructuredCompletion<T>({
  schema,
  schema_label,
  messages,
  responder = createOpenAIResponder(),
  repair_hint,
  temperature = 0.3,
  max_tokens = 900,
  retries = 1,
}: {
  schema: z.ZodSchema<T>;
  schema_label: string;
  messages: ChatMessage[];
  responder?: ChatResponder;
  repair_hint?: string;
  temperature?: number;
  max_tokens?: number;
  retries?: number;
}): Promise<T> {
  let attempt = 0;
  let repairTarget = "";

  while (attempt <= retries) {
    const requestMessages =
      attempt === 0
        ? messages
        : [
            ...messages,
            { role: "assistant" as const, content: repairTarget },
            {
              role: "user" as const,
              content: `你上一条回复不是合法 ${schema_label} JSON。请只输出合法 JSON，不要解释，不要 Markdown。
${repair_hint ? `必须严格使用这个 JSON 结构：\n${repair_hint}` : ""}`,
            },
          ];

    const rawText = await responder({
      messages: requestMessages,
      temperature,
      max_tokens,
    });

    try {
      return parseModelJson(rawText, schema);
    } catch (error) {
      repairTarget = rawText;

      if (attempt === retries) {
        throw new AppError(
          error instanceof Error ? error.message : `模型没有返回合法 ${schema_label} JSON。`,
          502,
        );
      }
    }

    attempt += 1;
  }

  throw new AppError(`模型没有返回合法 ${schema_label} JSON。`, 502);
}
