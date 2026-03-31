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
  runDuel: vi.fn(),
}));

import { POST } from "@/app/api/duel/route";
import { runCandidateAnalysis, runDuel } from "@/lib/analysis";
import { extractWebsiteSource } from "@/lib/source";

describe("POST /api/duel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("analyzes both contenders and returns a duel verdict", async () => {
    vi.mocked(extractWebsiteSource).mockResolvedValue({
      source_type: "url",
      source_label: "example.com",
      source_hash: "hash",
      extracted_text: "profile text",
      preview_text: "profile text",
    });
    vi.mocked(runCandidateAnalysis)
      .mockResolvedValueOnce({
        nickname: "左边",
        source_type: "url",
        hireability_score: 84,
        chaos_score: 23,
        summary: "左边总结",
        fatal_flaw: "左边硬伤",
        fixes: ["1", "2", "3"],
        roast_copy: "左边吐槽",
        share_line: "左边分享",
        score_breakdown: {
          clarity: 84,
          impact: 84,
          focus: 84,
          craftsmanship: 84,
          signal: 84,
          chaos: 23,
        },
      })
      .mockResolvedValueOnce({
        nickname: "右边",
        source_type: "url",
        hireability_score: 55,
        chaos_score: 78,
        summary: "右边总结",
        fatal_flaw: "右边硬伤",
        fixes: ["1", "2", "3"],
        roast_copy: "右边吐槽",
        share_line: "右边分享",
        score_breakdown: {
          clarity: 55,
          impact: 55,
          focus: 55,
          craftsmanship: 55,
          signal: 55,
          chaos: 78,
        },
      });
    vi.mocked(runDuel).mockResolvedValue({
      winner: "left",
      disaster: "right",
      commentary: "右边像是在简历里打醉拳。",
      decision_summary: "左边更像能被捞的人，右边更像事故现场。",
      left: {
        nickname: "左边",
        source_type: "url",
        hireability_score: 84,
        chaos_score: 23,
        summary: "左边总结",
        fatal_flaw: "左边硬伤",
        fixes: ["1", "2", "3"],
        roast_copy: "左边吐槽",
        share_line: "左边分享",
        score_breakdown: {
          clarity: 84,
          impact: 84,
          focus: 84,
          craftsmanship: 84,
          signal: 84,
          chaos: 23,
        },
      },
      right: {
        nickname: "右边",
        source_type: "url",
        hireability_score: 55,
        chaos_score: 78,
        summary: "右边总结",
        fatal_flaw: "右边硬伤",
        fixes: ["1", "2", "3"],
        roast_copy: "右边吐槽",
        share_line: "右边分享",
        score_breakdown: {
          clarity: 55,
          impact: 55,
          focus: 55,
          craftsmanship: 55,
          signal: 55,
          chaos: 78,
        },
      },
    });

    const formData = new FormData();
    formData.append("left_nickname", "左边");
    formData.append("left_url", "https://left.example");
    formData.append("right_nickname", "右边");
    formData.append("right_url", "https://right.example");

    const response = await POST(
      new Request("http://localhost/api/duel", {
        method: "POST",
        body: formData,
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      winner: "left",
      disaster: "right",
    });
  });
});
