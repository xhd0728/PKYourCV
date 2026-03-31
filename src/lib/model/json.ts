import type { z } from "zod";

import { AppError } from "@/lib/utils";

function stripMarkdownFence(value: string): string {
  return value
    .trim()
    .replace(/^```json/i, "")
    .replace(/^```/i, "")
    .replace(/```$/i, "")
    .trim();
}

export function extractJsonObject(rawValue: string): string {
  const value = stripMarkdownFence(rawValue);
  const firstBrace = value.indexOf("{");

  if (firstBrace === -1) {
    throw new AppError("模型没有返回 JSON 对象。", 502);
  }

  let depth = 0;
  let inString = false;
  let isEscaped = false;

  for (let index = firstBrace; index < value.length; index += 1) {
    const char = value[index];

    if (inString) {
      if (isEscaped) {
        isEscaped = false;
        continue;
      }

      if (char === "\\") {
        isEscaped = true;
        continue;
      }

      if (char === '"') {
        inString = false;
      }

      continue;
    }

    if (char === '"') {
      inString = true;
      continue;
    }

    if (char === "{") {
      depth += 1;
      continue;
    }

    if (char === "}") {
      depth -= 1;

      if (depth === 0) {
        return value.slice(firstBrace, index + 1);
      }
    }
  }

  throw new AppError("模型给的 JSON 没收尾。", 502);
}

export function parseModelJson<T>(rawValue: string, schema: z.ZodSchema<T>): T {
  const jsonObject = extractJsonObject(rawValue);
  const parsed = schema.safeParse(JSON.parse(jsonObject));

  if (!parsed.success) {
    throw new AppError(`模型 JSON 不符合预期: ${parsed.error.message}`, 502);
  }

  return parsed.data;
}
