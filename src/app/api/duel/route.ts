import { NextResponse } from "next/server";

import { runCandidateAnalysis, runDuel } from "@/lib/analysis";
import { parseDuelFormData } from "@/lib/api/forms";
import { handleRouteError, jsonError } from "@/lib/api/http";
import { getClientIdentifier, checkRateLimit } from "@/lib/rate-limit";
import { extractPdfSource, extractWebsiteSource } from "@/lib/source";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const rateLimit = checkRateLimit(getClientIdentifier(request));

    if (!rateLimit.success) {
      return jsonError("PK 打太快了，先让 HR 喝口冰美式。", 429);
    }

    const formData = await request.formData();
    const input = parseDuelFormData(formData);

    const [leftSource, rightSource] = await Promise.all([
      input.left.url
        ? extractWebsiteSource(input.left.url)
        : extractPdfSource(input.left.pdf as File),
      input.right.url
        ? extractWebsiteSource(input.right.url)
        : extractPdfSource(input.right.pdf as File),
    ]);

    const [left, right] = await Promise.all([
      runCandidateAnalysis({
        nickname: input.left.nickname,
        source: leftSource,
      }),
      runCandidateAnalysis({
        nickname: input.right.nickname,
        source: rightSource,
      }),
    ]);

    const result = await runDuel({ left, right });

    return NextResponse.json(result);
  } catch (error) {
    return handleRouteError(error);
  }
}
