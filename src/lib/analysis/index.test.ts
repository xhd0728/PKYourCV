import {
  calculateChaosScore,
  calculateHireabilityScore,
  normalizeScoreBreakdown,
  runCandidateAnalysis,
} from "@/lib/analysis";

describe("analysis scoring", () => {
  it("clamps breakdown scores into the expected range", () => {
    const normalized = normalizeScoreBreakdown({
      clarity: 123,
      impact: 68.4,
      focus: -10,
      craftsmanship: 81,
      signal: 47,
      chaos: 201,
    });

    expect(normalized).toEqual({
      clarity: 100,
      impact: 68,
      focus: 0,
      craftsmanship: 81,
      signal: 47,
      chaos: 100,
    });
  });

  it("derives overall scores from the normalized breakdown", () => {
    const breakdown = {
      clarity: 90,
      impact: 70,
      focus: 80,
      craftsmanship: 60,
      signal: 50,
      chaos: 35,
    };

    expect(calculateHireabilityScore(breakdown)).toBe(70);
    expect(calculateChaosScore(breakdown)).toBe(35);
  });

  it("retries when the model tries to attack chronology topics", async () => {
    const responder = vi
      .fn()
      .mockResolvedValueOnce(`{
        "summary": "你这简历像从2026年穿回来开会。",
        "fatal_flaw": "最大问题是时间线像平行宇宙。",
        "fixes": ["把2026删掉。", "改时间线。", "别从未来回来。"],
        "score_breakdown": {
          "clarity": 60,
          "impact": 88,
          "focus": 70,
          "craftsmanship": 62,
          "signal": 84,
          "chaos": 35
        }
      }`)
      .mockResolvedValueOnce(`{
        "summary": "料很硬，但写法像把主菜塞进了仓库角落。",
        "fatal_flaw": "没有致命硬伤，真正拖后腿的是成果归因写得像集体署名。",
        "fixes": ["把最强成果顶到第一页。", "给每个项目补上你的具体职责。", "把结果指标写成一句人话。"],
        "score_breakdown": {
          "clarity": 74,
          "impact": 88,
          "focus": 79,
          "craftsmanship": 71,
          "signal": 90,
          "chaos": 22
        }
      }`)
      .mockResolvedValueOnce(`{
        "roast_copy": "这份材料像从2026年空投回来的战报。",
        "share_line": "HR怀疑你来自未来"
      }`)
      .mockResolvedValueOnce(`{
        "roast_copy": "东西是真有，写法也是真会藏，像把主菜锁进了储物柜再让 HR 猜密码。好在信号够硬，不然这份材料很容易被当成高配版信息迷宫。",
        "share_line": "货是硬的，写法像在给重点套迷彩。"
      }`);

    const result = await runCandidateAnalysis({
      nickname: "海东",
      source: {
        source_type: "url",
        source_label: "xinhaidong.top",
        source_hash: "hash",
        extracted_text: "papers projects citations systems",
        preview_text: "preview",
      },
      responder,
    });

    expect(responder).toHaveBeenCalledTimes(4);
    expect(result.summary).toContain("主菜");
    expect(result.fatal_flaw).not.toMatch(/2026|时间|未来|穿越|平行宇宙/i);
    expect(result.roast_copy).not.toMatch(/2026|时间|未来|穿越|平行宇宙/i);
    expect(result.share_line).not.toMatch(/2026|时间|未来|穿越|平行宇宙/i);
  });
});
