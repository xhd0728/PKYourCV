"use client";

import { useState, useTransition } from "react";

import { AnalysisCard } from "@/components/analysis-card";
import { withBasePath } from "@/lib/base-path";
import type { DuelResult, SourceType } from "@/lib/types";

type ContenderState = {
  nickname: string;
  mode: SourceType;
  url: string;
  pdf: File | null;
};

const inputClass =
  "w-full rounded-[1.4rem] border-2 border-[var(--border)] bg-white px-4 py-3 text-base font-bold text-[var(--ink)] outline-none transition placeholder:text-black/35 focus:-translate-y-0.5 focus:bg-[var(--paper)]";

function readError(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "PK 现场出了点事故。";
}

function ContenderPanel({
  title,
  accent,
  state,
  onChange,
}: {
  title: string;
  accent: string;
  state: ContenderState;
  onChange: (next: ContenderState) => void;
}) {
  return (
    <div className={`rounded-[2rem] border-3 border-[var(--border)] ${accent} p-5`}>
      <div className="text-xs font-black uppercase tracking-[0.18em] text-[var(--muted)]">
        {title}
      </div>
      <div className="mt-4 grid gap-4">
        <label className="grid gap-2">
          <span className="text-sm font-black uppercase tracking-[0.16em] text-[var(--muted)]">
            昵称
          </span>
          <input
            className={inputClass}
            placeholder="卷王 / 摆子 / 整活冠军"
            value={state.nickname}
            onChange={(event) => onChange({ ...state, nickname: event.target.value })}
          />
        </label>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className={`rounded-full border-2 border-[var(--border)] px-4 py-2 text-sm font-black uppercase tracking-[0.16em] ${
              state.mode === "url" ? "bg-white shadow-[4px_4px_0_var(--border)]" : "bg-transparent"
            }`}
            onClick={() => onChange({ ...state, mode: "url", pdf: null })}
          >
            主页 URL
          </button>
          <button
            type="button"
            className={`rounded-full border-2 border-[var(--border)] px-4 py-2 text-sm font-black uppercase tracking-[0.16em] ${
              state.mode === "pdf" ? "bg-white shadow-[4px_4px_0_var(--border)]" : "bg-transparent"
            }`}
            onClick={() => onChange({ ...state, mode: "pdf", url: "" })}
          >
            PDF 简历
          </button>
        </div>

        {state.mode === "url" ? (
          <input
            key={`${title}-url`}
            className={inputClass}
            inputMode="url"
            placeholder="https://portfolio.example"
            value={state.url}
            onChange={(event) => onChange({ ...state, url: event.target.value })}
          />
        ) : (
          <input
            key={`${title}-pdf`}
            className={`${inputClass} file:mr-4 file:rounded-full file:border-0 file:bg-[var(--ink)] file:px-4 file:py-2 file:font-black file:text-white`}
            type="file"
            accept="application/pdf,.pdf"
            onChange={(event) => onChange({ ...state, pdf: event.target.files?.[0] ?? null })}
          />
        )}
      </div>
    </div>
  );
}

export function DuelArena() {
  const [left, setLeft] = useState<ContenderState>({
    nickname: "",
    mode: "url",
    url: "",
    pdf: null,
  });
  const [right, setRight] = useState<ContenderState>({
    nickname: "",
    mode: "url",
    url: "",
    pdf: null,
  });
  const [result, setResult] = useState<DuelResult | null>(null);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("left_nickname", left.nickname);
        formData.append("right_nickname", right.nickname);

        if (left.mode === "url") {
          formData.append("left_url", left.url);
        } else if (left.pdf) {
          formData.append("left_pdf", left.pdf);
        }

        if (right.mode === "url") {
          formData.append("right_url", right.url);
        } else if (right.pdf) {
          formData.append("right_pdf", right.pdf);
        }

        const response = await fetch(withBasePath("/api/duel"), {
          method: "POST",
          body: formData,
        });
        const payload = (await response.json()) as DuelResult | { error: string };

        if (!response.ok || "error" in payload) {
          throw new Error("error" in payload ? payload.error : "PK 失败。");
        }

        setResult(payload);
      } catch (submitError) {
        setError(readError(submitError));
      }
    });
  };

  return (
    <div className="grid gap-5">
      <form onSubmit={submit} className="panel overflow-hidden p-5 sm:p-6">
        <div className="grid gap-5 lg:grid-cols-[1fr_auto_1fr] lg:items-start">
          <ContenderPanel title="左边选手" accent="bg-[var(--sky)]/75" state={left} onChange={setLeft} />

          <div className="mx-auto flex h-full min-h-[8rem] items-center justify-center">
            <div className="display-type rotate-[-4deg] rounded-[2rem] border-3 border-[var(--border)] bg-[var(--acid)] px-8 py-5 text-5xl leading-none shadow-[10px_10px_0_var(--border)]">
              VS
            </div>
          </div>

          <ContenderPanel
            title="右边选手"
            accent="bg-[var(--peach)]/85"
            state={right}
            onChange={setRight}
          />
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            className="display-type rounded-full border-3 border-[var(--border)] bg-[var(--hot)] px-7 py-4 text-xl uppercase tracking-[0.14em] text-white shadow-[7px_7px_0_var(--border)] transition hover:-translate-y-1 disabled:translate-y-0 disabled:opacity-60"
            disabled={isPending}
          >
            {isPending ? "互喷中…" : "开始 PK"}
          </button>
          <span className="rounded-full border-2 border-[var(--border)] bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[var(--muted)]">
            先结构化分析，再决定输赢
          </span>
        </div>

        {error ? (
          <div className="mt-5 rounded-[1.4rem] border-2 border-[var(--border)] bg-[var(--peach)] px-4 py-3 text-sm font-black text-[var(--ink)]">
            {error}
          </div>
        ) : null}
      </form>

      {result ? (
        <>
          <section className="panel grid gap-4 p-5 sm:p-6 lg:grid-cols-[0.85fr_1.15fr]">
            <div className="grid gap-4">
              <div className="rounded-[1.8rem] border-3 border-[var(--border)] bg-[var(--acid)] p-5">
                <div className="text-xs font-black uppercase tracking-[0.18em] text-[var(--muted)]">
                  官方结论
                </div>
                <div className="mt-3 grid gap-3">
                  <div className="rounded-2xl border-2 border-[var(--border)] bg-white/85 px-4 py-4">
                    <div className="text-xs font-black uppercase tracking-[0.16em] text-[var(--muted)]">
                      更能进厂
                    </div>
                    <div className="display-type mt-2 text-4xl leading-none">
                      {result.winner === "left" ? result.left.nickname : result.right.nickname}
                    </div>
                  </div>
                  <div className="rounded-2xl border-2 border-[var(--border)] bg-white/85 px-4 py-4">
                    <div className="text-xs font-black uppercase tracking-[0.16em] text-[var(--muted)]">
                      更像事故现场
                    </div>
                    <div className="display-type mt-2 text-4xl leading-none">
                      {result.disaster === "left" ? result.left.nickname : result.right.nickname}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[1.8rem] border-2 border-[var(--border)] bg-white/90 p-5">
              <div className="text-xs font-black uppercase tracking-[0.18em] text-[var(--muted)]">
                对战解说
              </div>
              <p className="mt-3 text-lg font-bold leading-9 text-[var(--ink)]">
                {result.decision_summary}
              </p>
              <p className="mt-4 text-base leading-8 text-[var(--ink)]">{result.commentary}</p>
            </div>
          </section>

          <div className="grid gap-5 xl:grid-cols-2">
            <AnalysisCard
              analysis={result.left}
              sticker={result.winner === "left" ? "胜者席位" : "被点菜席位"}
            />
            <AnalysisCard
              analysis={result.right}
              sticker={result.winner === "right" ? "胜者席位" : "被点菜席位"}
            />
          </div>
        </>
      ) : null}
    </div>
  );
}
