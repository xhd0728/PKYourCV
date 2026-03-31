"use client";

import { useState, useTransition } from "react";

import { AnalysisCard } from "@/components/analysis-card";
import type { LeaderboardEntry, SourceType } from "@/lib/types";

const inputClass =
  "w-full rounded-[1.4rem] border-2 border-[var(--border)] bg-white px-4 py-3 text-base font-bold text-[var(--ink)] outline-none transition placeholder:text-black/35 focus:-translate-y-0.5 focus:bg-[var(--paper)]";

function readError(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "接口刚刚发癫了，请稍后再试。";
}

export function AnalyzeWorkbench() {
  const [mode, setMode] = useState<SourceType>("url");
  const [nickname, setNickname] = useState("");
  const [url, setUrl] = useState("");
  const [pdf, setPdf] = useState<File | null>(null);
  const [result, setResult] = useState<LeaderboardEntry | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setCopied(false);

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("nickname", nickname);

        if (mode === "url") {
          formData.append("url", url);
        } else if (pdf) {
          formData.append("pdf", pdf);
        }

        const response = await fetch("/api/analyze", {
          method: "POST",
          body: formData,
        });
        const payload = (await response.json()) as LeaderboardEntry | { error: string };

        if (!response.ok || "error" in payload) {
          throw new Error("error" in payload ? payload.error : "分析失败。");
        }

        setResult(payload);
      } catch (submitError) {
        setError(readError(submitError));
      }
    });
  };

  const copyShareLine = async () => {
    if (!result?.share_line) {
      return;
    }

    await navigator.clipboard.writeText(result.share_line);
    setCopied(true);
  };

  return (
    <div className="grid gap-5">
      <section className="panel relative overflow-hidden p-5 sm:p-6">
        <div className="absolute right-4 top-4 -rotate-3 rounded-full border-2 border-[var(--border)] bg-[var(--acid)] px-4 py-2 text-xs font-black uppercase tracking-[0.18em]">
          Auto Roast
        </div>

        <div className="max-w-2xl">
          <div className="text-xs font-black uppercase tracking-[0.18em] text-[var(--muted)]">
            单人审判
          </div>
          <h2 className="display-type mt-3 text-4xl leading-none sm:text-5xl">
            把主页或 PDF 扔进来，
            <br />
            让大厂 HR 公开阴阳怪气。
          </h2>
          <p className="mt-4 text-base leading-8 text-[var(--muted)]">
            只抽取文字，不看图片，不做 OCR。分析成功后会自动进匿名排行榜。
          </p>
        </div>

        <form className="mt-6 grid gap-5" onSubmit={submit}>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className={`rounded-full border-2 border-[var(--border)] px-4 py-2 text-sm font-black uppercase tracking-[0.16em] ${
                mode === "url" ? "bg-[var(--sky)] shadow-[4px_4px_0_var(--border)]" : "bg-white"
              }`}
              onClick={() => {
                setMode("url");
                setPdf(null);
              }}
            >
              主页 URL
            </button>
            <button
              type="button"
              className={`rounded-full border-2 border-[var(--border)] px-4 py-2 text-sm font-black uppercase tracking-[0.16em] ${
                mode === "pdf" ? "bg-[var(--peach)] shadow-[4px_4px_0_var(--border)]" : "bg-white"
              }`}
              onClick={() => {
                setMode("pdf");
                setUrl("");
              }}
            >
              PDF 简历
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-[0.8fr_1.2fr]">
            <label className="grid gap-2">
              <span className="text-sm font-black uppercase tracking-[0.16em] text-[var(--muted)]">
                展示昵称
              </span>
              <input
                className={inputClass}
                placeholder="匿名倒霉蛋 / 张三 / 抽象战神"
                value={nickname}
                onChange={(event) => setNickname(event.target.value)}
              />
            </label>

            {mode === "url" ? (
              <label className="grid gap-2">
                <span className="text-sm font-black uppercase tracking-[0.16em] text-[var(--muted)]">
                  主页网址
                </span>
                <input
                  className={inputClass}
                  inputMode="url"
                  placeholder="https://your-portfolio.dev"
                  value={url}
                  onChange={(event) => setUrl(event.target.value)}
                />
              </label>
            ) : (
              <label className="grid gap-2">
                <span className="text-sm font-black uppercase tracking-[0.16em] text-[var(--muted)]">
                  PDF 文件
                </span>
                <input
                  className={`${inputClass} file:mr-4 file:rounded-full file:border-0 file:bg-[var(--ink)] file:px-4 file:py-2 file:font-black file:text-white`}
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={(event) => setPdf(event.target.files?.[0] ?? null)}
                />
              </label>
            )}
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-[1.8rem] border-2 border-[var(--border)] bg-white/85 p-4">
              <div className="text-xs font-black uppercase tracking-[0.18em] text-[var(--muted)]">
                输出会长这样
              </div>
              <div className="mt-3 grid gap-3 text-sm font-bold leading-7 text-[var(--ink)]">
                <div className="rounded-2xl border-2 border-[var(--border)] bg-[var(--leaf)]/40 px-4 py-3">
                  大厂生还率 / 抽象浓度
                </div>
                <div className="rounded-2xl border-2 border-[var(--border)] bg-[var(--sky)]/40 px-4 py-3">
                  一句话毒评 / 致命硬伤
                </div>
                <div className="rounded-2xl border-2 border-[var(--border)] bg-[var(--peach)]/40 px-4 py-3">
                  三条抢救建议 / 维度打分
                </div>
              </div>
            </div>

            <div className="rounded-[1.8rem] border-2 border-[var(--border)] bg-[var(--ink)] p-4 text-white">
              <div className="text-xs font-black uppercase tracking-[0.18em] text-white/65">
                使用须知
              </div>
              <ul className="mt-3 grid gap-2 text-sm leading-7 text-white/88">
                <li>只分析文本，不看版式截图。</li>
                <li>网页太短会被要求改传 PDF。</li>
                <li>风格毒舌，但默认不做人身羞辱。</li>
              </ul>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              className="display-type rounded-full border-3 border-[var(--border)] bg-[var(--hot)] px-7 py-4 text-xl uppercase tracking-[0.14em] text-white shadow-[7px_7px_0_var(--border)] transition hover:-translate-y-1 disabled:translate-y-0 disabled:opacity-60"
              disabled={isPending}
            >
              {isPending ? "开喷中…" : "开始审判"}
            </button>
            <span className="rounded-full border-2 border-[var(--border)] bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[var(--muted)]">
              OpenAI-Compatible Only
            </span>
          </div>

          {error ? (
            <div className="rounded-[1.4rem] border-2 border-[var(--border)] bg-[var(--peach)] px-4 py-3 text-sm font-black text-[var(--ink)]">
              {error}
            </div>
          ) : null}
        </form>
      </section>

      {result ? (
        <AnalysisCard
          analysis={result}
          sticker="已自动上榜"
          footer={
            <div className="rounded-[1.8rem] border-2 border-[var(--border)] bg-white/90 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-xs font-black uppercase tracking-[0.18em] text-[var(--muted)]">
                    排行榜状态
                  </div>
                  <p className="mt-1 text-sm font-bold leading-7 text-[var(--ink)]">
                    这份材料已经匿名写进排行榜。想看谁更像事故现场，直接去榜单。
                  </p>
                </div>
                <button
                  type="button"
                  onClick={copyShareLine}
                  className="rounded-full border-2 border-[var(--border)] bg-[var(--acid)] px-4 py-2 text-sm font-black uppercase tracking-[0.16em]"
                >
                  {copied ? "已复制" : "复制分享句"}
                </button>
              </div>
            </div>
          }
        />
      ) : null}
    </div>
  );
}
