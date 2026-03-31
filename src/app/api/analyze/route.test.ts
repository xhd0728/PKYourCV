import { NextResponse } from "next/server";

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: vi.fn(() => ({ success: true, remaining: 10, reset_at: Date.now() })),
  getClientIdentifier: vi.fn(() => "test-ip"),
}));

vi.mock("@/lib/source", () => ({
  extractPdfSource: vi.fn(),
  extractWebsiteSource: vi.fn(),
}));

vi.mock("@/lib/analysis", () => ({
  runCandidateAnalysis: vi.fn(),
}));

vi.mock("@/lib/leaderboard", () => ({
  saveLeaderboardEntry: vi.fn(),
}));

import { POST } from "@/app/api/analyze/route";
import { runCandidateAnalysis } from "@/lib/analysis";
import { saveLeaderboardEntry } from "@/lib/leaderboard";
import { checkRateLimit } from "@/lib/rate-limit";
import { extractWebsiteSource } from "@/lib/source";

describe("POST /api/analyze", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("analyzes a URL and returns a persisted leaderboard entry", async () => {
    vi.mocked(extractWebsiteSource).mockResolvedValue({
      source_type: "url",
      source_label: "example.com",
      source_hash: "hash-1",
      extracted_text: "profile text",
      preview_text: "profile text",
    });
    vi.mocked(runCandidateAnalysis).mockResolvedValue({
      nickname: "阿强",
      source_type: "url",
      hireability_score: 81,
      chaos_score: 27,
      summary: "总结",
      fatal_flaw: "硬伤",
      fixes: ["1", "2", "3"],
      roast_copy: "开喷文案",
      share_line: "分享句",
      score_breakdown: {
        clarity: 80,
        impact: 80,
        focus: 80,
        craftsmanship: 80,
        signal: 85,
        chaos: 27,
      },
    });
    vi.mocked(saveLeaderboardEntry).mockResolvedValue({
      id: 99,
      nickname: "阿强",
      source_type: "url",
      hireability_score: 81,
      chaos_score: 27,
      summary: "总结",
      fatal_flaw: "硬伤",
      fixes: ["1", "2", "3"],
      roast_copy: "开喷文案",
      share_line: "分享句",
      score_breakdown: {
        clarity: 80,
        impact: 80,
        focus: 80,
        craftsmanship: 80,
        signal: 85,
        chaos: 27,
      },
      created_at: "2026-03-31T00:00:00.000Z",
    });

    const formData = new FormData();
    formData.append("nickname", "阿强");
    formData.append("url", "https://example.com");

    const response = await POST(
      new Request("http://localhost/api/analyze", {
        method: "POST",
        body: formData,
      }),
    );

    expect(response).toBeInstanceOf(NextResponse);
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      id: 99,
      nickname: "阿强",
    });
  });

  it("returns 429 when rate limited", async () => {
    vi.mocked(checkRateLimit).mockReturnValueOnce({
      success: false,
      remaining: 0,
      reset_at: Date.now(),
    });

    const response = await POST(
      new Request("http://localhost/api/analyze", {
        method: "POST",
        body: new FormData(),
      }),
    );

    expect(response.status).toBe(429);
  });
});
