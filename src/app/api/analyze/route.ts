import { NextResponse } from "next/server";

import { runCandidateAnalysis } from "@/lib/analysis";
import { parseAnalyzeFormData } from "@/lib/api/forms";
import { handleRouteError, jsonError } from "@/lib/api/http";
import { getClientIdentifier, checkRateLimit } from "@/lib/rate-limit";
import { saveLeaderboardEntry } from "@/lib/leaderboard";
import { extractPdfSource, extractWebsiteSource } from "@/lib/source";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const rateLimit = checkRateLimit(getClientIdentifier(request));

    if (!rateLimit.success) {
      return jsonError("喷人频率太高了，HR 也得喘口气。", 429);
    }

    const formData = await request.formData();
    const input = parseAnalyzeFormData(formData);
    const source = input.url
      ? await extractWebsiteSource(input.url)
      : await extractPdfSource(input.pdf as File);
    const analysis = await runCandidateAnalysis({
      nickname: input.nickname,
      source,
    });
    const saved = await saveLeaderboardEntry({
      analysis,
      source_hash: source.source_hash,
    });

    return NextResponse.json(saved);
  } catch (error) {
    return handleRouteError(error);
  }
}
