import {
  buildAnalysisMessages,
  buildDuelMessages,
  buildRoastMessages,
} from "@/lib/model/prompts";

describe("model prompts", () => {
  it("avoids date-based attacks and keeps analysis focused on signal quality", () => {
    const messages = buildAnalysisMessages({
      nickname: "海东",
      source: {
        source_type: "url",
        source_label: "xinhaidong.top",
        source_hash: "hash",
        extracted_text: "NLP, IR, RAG, papers, projects",
        preview_text: "preview",
      },
    });

    expect(messages[0].content).toContain("先识别材料类型");
    expect(messages[0].content).toContain("不要根据年份、时间线");
    expect(messages[0].content).toContain("职业信号硬不硬、成果归因清不清、叙事主线顺不顺、证据密度够不够");
    expect(messages[0].content).toContain("禁止把 2026、2025、某月某日、Last Updated、时间线、未来、穿越、平行宇宙");
    expect(messages[0].content).toContain("如果没有致命硬伤");
    expect(messages[0].content).not.toContain("今天日期");
  });

  it("forces roast copy to stay grounded in the analysis", () => {
    const messages = buildRoastMessages({
      nickname: "海东",
      analysis: {
        nickname: "海东",
        source_type: "url",
        hireability_score: 88,
        chaos_score: 24,
        summary: "强信号很多，但叙事还能更利落。",
        fatal_flaw: "没有致命硬伤，真正拖后腿的是项目归因还不够直给。",
        fixes: [
          "把最强论文和项目放到前面。",
          "给关键项目补上你的具体角色和贡献边界。",
          "把结果指标写得更直接。",
        ],
        score_breakdown: {
          clarity: 78,
          impact: 86,
          focus: 82,
          craftsmanship: 74,
          signal: 92,
          chaos: 24,
        },
      },
    });

    expect(messages[0].content).toContain("不能补充任何新事实");
    expect(messages[0].content).toContain("带着嫉妒的挑刺");
    expect(messages[0].content).toContain("必须与分析数据一致");
    expect(messages[0].content).toContain("允许多写一点抽象怪话");
  });

  it("forces duel commentary to compare only known differences", () => {
    const messages = buildDuelMessages({
      winner: "left",
      disaster: "right",
      left_disaster_index: 28,
      right_disaster_index: 64,
      left: {
        nickname: "左边",
        source_type: "url",
        hireability_score: 90,
        chaos_score: 20,
        summary: "主线清楚，信号够硬。",
        fatal_flaw: "没有致命硬伤，真正问题是项目排序还能更狠。",
        fixes: ["改排序。", "补归因。", "压缩废话。"],
        roast_copy: "略",
        share_line: "略",
        score_breakdown: {
          clarity: 86,
          impact: 90,
          focus: 88,
          craftsmanship: 80,
          signal: 93,
          chaos: 20,
        },
      },
      right: {
        nickname: "右边",
        source_type: "url",
        hireability_score: 62,
        chaos_score: 58,
        summary: "能看出努力，但叙事飘。",
        fatal_flaw: "最大问题是成果很多，归因却不够清楚。",
        fixes: ["砍掉噪音。", "补证据。", "重排结构。"],
        roast_copy: "略",
        share_line: "略",
        score_breakdown: {
          clarity: 60,
          impact: 65,
          focus: 58,
          craftsmanship: 55,
          signal: 66,
          chaos: 58,
        },
      },
    });

    expect(messages[0].content).toContain("不能添加任何新事实");
    expect(messages[0].content).toContain("只放大已知差距");
    expect(messages[0].content).toContain("开场定调 -> 对比 -> 落锤");
    expect(messages[0].content).toContain("一个像能落地的系统，一个像会开组会的烟雾弹");
  });
});
