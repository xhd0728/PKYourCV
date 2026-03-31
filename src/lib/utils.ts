import { createHash } from "node:crypto";

export class AppError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "AppError";
    this.status = status;
  }
}

export function clampScore(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(value)));
}

export function normalizeWhitespace(value: string): string {
  return value.replace(/\u0000/g, "").replace(/\s+/g, " ").trim();
}

export function truncate(value: string, maxLength: number): string {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
}

export function average(values: number[]): number {
  if (!values.length) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function createContentHash(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export function sanitizeNickname(value: string | null | undefined): string {
  const fallback = "匿名倒霉蛋";

  if (!value) {
    return fallback;
  }

  const cleaned = normalizeWhitespace(value).replace(/[^\p{L}\p{N}\s._-]/gu, "");

  if (!cleaned) {
    return fallback;
  }

  return truncate(cleaned, 24);
}

export function safeJsonParse<T>(value: string): T {
  return JSON.parse(value) as T;
}
