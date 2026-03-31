import { getAppConfig } from "@/lib/env";

type RateLimitState = {
  hits: number[];
};

type RateLimitResult = {
  success: boolean;
  remaining: number;
  reset_at: number;
};

const state = new Map<string, RateLimitState>();

export function getClientIdentifier(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "anonymous";
  }

  return request.headers.get("x-real-ip") || "anonymous";
}

export function checkRateLimit(identifier: string): RateLimitResult {
  const config = getAppConfig();
  const now = Date.now();
  const windowStart = now - config.RATE_LIMIT_WINDOW_MS;

  const current = state.get(identifier) ?? { hits: [] };
  current.hits = current.hits.filter((timestamp) => timestamp > windowStart);
  current.hits.push(now);
  state.set(identifier, current);

  const success = current.hits.length <= config.RATE_LIMIT_MAX_REQUESTS;
  const oldest = current.hits[0] ?? now;

  return {
    success,
    remaining: Math.max(0, config.RATE_LIMIT_MAX_REQUESTS - current.hits.length),
    reset_at: oldest + config.RATE_LIMIT_WINDOW_MS,
  };
}

export function resetRateLimitState(): void {
  state.clear();
}
