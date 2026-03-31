import { NextResponse } from "next/server";

import { AppError } from "@/lib/utils";

export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export function handleRouteError(error: unknown) {
  if (error instanceof AppError) {
    return jsonError(error.message, error.status);
  }

  if (error instanceof Error) {
    return jsonError(error.message, 500);
  }

  return jsonError("Unknown server error.", 500);
}
