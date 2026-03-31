import { NextResponse } from "next/server";

import { handleRouteError } from "@/lib/api/http";
import { getLeaderboard } from "@/lib/leaderboard";
import type { BoardType, SourceType } from "@/lib/types";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const board = searchParams.get("board") === "chaos" ? "chaos" : "hireable";
    const sourceParam = searchParams.get("source");
    const source_type: SourceType | "all" =
      sourceParam === "url" || sourceParam === "pdf" ? sourceParam : "all";
    const page = Math.max(1, Number(searchParams.get("page") || "1"));
    const page_size = Math.min(50, Math.max(1, Number(searchParams.get("page_size") || "10")));
    const payload = await getLeaderboard({
      board: board as BoardType,
      source_type,
      page,
      page_size,
    });

    return NextResponse.json(payload);
  } catch (error) {
    return handleRouteError(error);
  }
}
