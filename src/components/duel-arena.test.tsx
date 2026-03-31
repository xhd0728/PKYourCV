// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";

import { DuelArena } from "@/components/duel-arena";
import type { DuelResult } from "@/lib/types";

const mockResult: DuelResult = {
  winner: "left",
  disaster: "right",
  commentary: "右边这份履历像把项目经历扔进搅拌机后再排版。",
  decision_summary: "左边更有进厂相，右边更像事故现场。",
  left: {
    nickname: "左边",
    source_type: "url",
    hireability_score: 86,
    chaos_score: 29,
    summary: "左边总结",
    fatal_flaw: "左边硬伤",
    fixes: ["1", "2", "3"],
    roast_copy: "左边吐槽",
    share_line: "左边分享",
    score_breakdown: {
      clarity: 86,
      impact: 86,
      focus: 86,
      craftsmanship: 86,
      signal: 86,
      chaos: 29,
    },
  },
  right: {
    nickname: "右边",
    source_type: "url",
    hireability_score: 42,
    chaos_score: 81,
    summary: "右边总结",
    fatal_flaw: "右边硬伤",
    fixes: ["1", "2", "3"],
    roast_copy: "右边吐槽",
    share_line: "右边分享",
    score_breakdown: {
      clarity: 42,
      impact: 42,
      focus: 42,
      craftsmanship: 42,
      signal: 42,
      chaos: 81,
    },
  },
};

describe("DuelArena", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("submits two contenders and shows the duel verdict", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify(mockResult), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    render(<DuelArena />);

    const nicknameInputs = screen.getAllByPlaceholderText("卷王 / 摆子 / 整活冠军");
    fireEvent.change(nicknameInputs[0], { target: { value: "左边" } });
    fireEvent.change(nicknameInputs[1], { target: { value: "右边" } });

    const urlInputs = screen.getAllByPlaceholderText("https://portfolio.example");
    fireEvent.change(urlInputs[0], { target: { value: "https://left.example" } });
    fireEvent.change(urlInputs[1], { target: { value: "https://right.example" } });

    fireEvent.click(screen.getByRole("button", { name: "开始 PK" }));

    await screen.findByText(mockResult.decision_summary);
    expect(screen.getByText("右边这份履历像把项目经历扔进搅拌机后再排版。")).toBeInTheDocument();
  });
});
