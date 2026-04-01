// @vitest-environment jsdom

import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { AnalyzeWorkbench } from "@/components/analyze-workbench";
import type { LeaderboardEntry } from "@/lib/types";

const mockEntry: LeaderboardEntry = {
  id: 1,
  nickname: "阿强",
  source_type: "url",
  hireability_score: 88,
  chaos_score: 31,
  summary: "一句总结",
  fatal_flaw: "一个大硬伤",
  fixes: ["先改标题", "补项目结果", "删掉废话"],
  roast_copy: "这份简历像半夜两点赶出来的 OKR 复盘。",
  share_line: "像能进厂，但需要先把简历从事故车里拖出来。",
  score_breakdown: {
    clarity: 88,
    impact: 88,
    focus: 88,
    craftsmanship: 88,
    signal: 88,
    chaos: 31,
  },
  created_at: "2026-03-31T00:00:00.000Z",
};

describe("AnalyzeWorkbench", () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    vi.stubGlobal("navigator", {
      clipboard: {
        writeText: vi.fn(),
      },
    });
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    consoleErrorSpy.mockRestore();
  });

  it("submits a URL and renders the returned verdict", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify(mockEntry), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    render(<AnalyzeWorkbench />);

    fireEvent.change(screen.getByPlaceholderText("匿名倒霉蛋 / 张三 / 抽象战神"), {
      target: { value: "阿强" },
    });
    fireEvent.change(screen.getByPlaceholderText("https://your-portfolio.dev"), {
      target: { value: "https://example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: "开始审判" }));

    await screen.findByText(mockEntry.roast_copy);
    expect(screen.getByText("已自动上榜")).toBeInTheDocument();
  });

  it("submits a PDF file when PDF mode is selected", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ ...mockEntry, source_type: "pdf" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    render(<AnalyzeWorkbench />);

    fireEvent.click(screen.getByRole("button", { name: "PDF 简历" }));
    fireEvent.change(screen.getByPlaceholderText("匿名倒霉蛋 / 张三 / 抽象战神"), {
      target: { value: "小李" },
    });

    const file = new File(["fake pdf"], "resume.pdf", { type: "application/pdf" });
    const fileInput = screen.getByLabelText("PDF 文件");
    fireEvent.change(fileInput, {
      target: { files: [file] },
    });
    fireEvent.click(screen.getByRole("button", { name: "开始审判" }));

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    const requestInit = vi.mocked(fetch).mock.calls[0][1];
    const body = requestInit?.body as FormData;

    expect(body.get("pdf")).toBe(file);
  });

  it("does not emit a controlled input warning when switching between URL and PDF modes", () => {
    render(<AnalyzeWorkbench />);

    fireEvent.click(screen.getByRole("button", { name: "PDF 简历" }));
    fireEvent.click(screen.getByRole("button", { name: "主页 URL" }));
    fireEvent.click(screen.getByRole("button", { name: "PDF 简历" }));

    expect(consoleErrorSpy).not.toHaveBeenCalledWith(
      expect.stringContaining("A component is changing a controlled input to be uncontrolled"),
    );
  });
});
