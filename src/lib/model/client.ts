import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import type { ChatCompletionCreateParamsNonStreaming } from "openai/resources/chat";
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
  response_format?: ChatCompletionCreateParamsNonStreaming["response_format"];
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

function buildStructuredResponseFormatName(schemaLabel: string): string {
  const normalized = schemaLabel
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "_")
    .replace(/^_+|_+$/g, "");

  return normalized || "structured_output";
}

export function createOpenAIResponder(): ChatResponder {
  return async ({ messages, temperature = 0.4, max_tokens = 900, response_format }) => {
    const config = getModelConfig();
    const client = getOpenAIClient();
    const response = await client.chat.completions.create({
      model: config.OPENAI_MODEL,
      messages,
      temperature,
      max_tokens,
      response_format,
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
  responder,
  repair_hint,
  response_validator,
  temperature = 0.3,
  max_tokens = 900,
  retries = 1,
}: {
  schema: z.ZodSchema<T>;
  schema_label: string;
  messages: ChatMessage[];
  responder?: ChatResponder;
  repair_hint?: string;
  response_validator?: (value: T) => string | null;
  temperature?: number;
  max_tokens?: number;
  retries?: number;
}): Promise<T> {
  const activeResponder = responder ?? createOpenAIResponder();
  const responseFormat = zodResponseFormat(
    schema,
    buildStructuredResponseFormatName(schema_label),
  );
  let attempt = 0;
  let repairTarget = "";
  let repairMessage = `你上一条回复不是合法 ${schema_label} JSON。请只输出合法 JSON，不要解释，不要 Markdown。
${repair_hint ? `必须严格使用这个 JSON 结构：\n${repair_hint}` : ""}`;

  while (attempt <= retries) {
    const requestMessages =
      attempt === 0
        ? messages
        : [
            ...messages,
            { role: "assistant" as const, content: repairTarget },
            {
              role: "user" as const,
              content: repairMessage,
            },
          ];

    const rawText = await activeResponder({
      messages: requestMessages,
      temperature,
      max_tokens,
      response_format: responseFormat,
    });

    try {
      const parsed = parseModelJson(rawText, schema);
      const validationMessage = response_validator?.(parsed);

      if (!validationMessage) {
        return parsed;
      }

      repairTarget = rawText;
      repairMessage = `你上一条回复虽然是合法 JSON，但违反了输出约束：${validationMessage}
请重写，仍然只输出合法 JSON，不要解释，不要 Markdown。
${repair_hint ? `必须严格使用这个 JSON 结构：\n${repair_hint}` : ""}`;
    } catch (error) {
      repairTarget = rawText;
      repairMessage = `你上一条回复不是合法 ${schema_label} JSON。请只输出合法 JSON，不要解释，不要 Markdown。
${repair_hint ? `必须严格使用这个 JSON 结构：\n${repair_hint}` : ""}`;

      if (attempt === retries) {
        throw new AppError(
          error instanceof Error ? error.message : `模型没有返回合法 ${schema_label} JSON。`,
          502,
        );
      }

      attempt += 1;
      continue;
    }

    if (attempt === retries) {
      throw new AppError(`模型没有返回符合约束的 ${schema_label} JSON。`, 502);
    }

    attempt += 1;
  }

  throw new AppError(`模型没有返回合法 ${schema_label} JSON。`, 502);
}
