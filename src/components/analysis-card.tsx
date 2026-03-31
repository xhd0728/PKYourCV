import type { ReactNode } from "react";

import type { CandidateAnalysis } from "@/lib/types";

const breakdownLabels: Array<{
  key: keyof CandidateAnalysis["score_breakdown"];
  label: string;
  accent: string;
}> = [
  { key: "clarity", label: "清晰度", accent: "bg-[var(--sky)]" },
  { key: "impact", label: "成果感", accent: "bg-[var(--leaf)]" },
  { key: "focus", label: "聚焦度", accent: "bg-[var(--acid)]" },
  { key: "craftsmanship", label: "包装力", accent: "bg-[var(--peach)]" },
  { key: "signal", label: "大厂信号", accent: "bg-[var(--hot)] text-white" },
  { key: "chaos", label: "抽象值", accent: "bg-[var(--ink)] text-white" },
];

function ScoreTile({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: string;
}) {
  return (
    <div className="rounded-[1.4rem] border-2 border-[var(--border)] bg-white/85 p-3">
      <div className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${accent}`}>
        {label}
      </div>
      <div className="mt-3 flex items-end justify-between gap-3">
        <span className="display-type text-4xl leading-none">{value}</span>
        <div className="h-3 flex-1 overflow-hidden rounded-full border-2 border-[var(--border)] bg-white">
          <div
            className={`h-full rounded-full ${accent}`}
            style={{ width: `${Math.max(8, value)}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export function AnalysisCard({
  analysis,
  sticker,
  footer,
}: {
  analysis: CandidateAnalysis;
  sticker?: string;
  footer?: ReactNode;
}) {
  return (
    <article className="panel overflow-hidden p-5 sm:p-6">
      <div className="flex flex-col gap-4 border-b-2 border-dashed border-[var(--border)] pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          {sticker ? (
            <span className="mb-3 inline-flex -rotate-2 rounded-full border-2 border-[var(--border)] bg-[var(--acid)] px-4 py-1 text-xs font-black uppercase tracking-[0.18em]">
              {sticker}
            </span>
          ) : null}
          <h3 className="display-type text-3xl leading-none text-[var(--ink)] sm:text-4xl">
            {analysis.nickname}
          </h3>
          <p className="mt-2 max-w-2xl text-sm font-bold text-[var(--muted)]">
            {analysis.summary}
          </p>
        </div>

        <div className="grid w-full gap-3 sm:max-w-[18rem]">
          <div className="rounded-[1.6rem] border-3 border-[var(--border)] bg-[var(--leaf)] p-4">
            <div className="text-xs font-black uppercase tracking-[0.18em] text-[var(--muted)]">
              大厂生还率
            </div>
            <div className="display-type mt-2 text-6xl leading-none">
              {analysis.hireability_score}
            </div>
          </div>
          <div className="rounded-[1.6rem] border-3 border-[var(--border)] bg-[var(--peach)] p-4">
            <div className="text-xs font-black uppercase tracking-[0.18em] text-[var(--muted)]">
              抽象浓度
            </div>
            <div className="display-type mt-2 text-6xl leading-none">
              {analysis.chaos_score}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="grid gap-5">
          <div className="rounded-[1.8rem] border-2 border-[var(--border)] bg-[var(--paper)] p-5">
            <div className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-[var(--muted)]">
              一段刻薄点评
            </div>
            <p className="text-base leading-8 text-[var(--ink)]">{analysis.roast_copy}</p>
          </div>

          <div className="rounded-[1.8rem] border-2 border-[var(--border)] bg-white/90 p-5">
            <div className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-[var(--muted)]">
              致命硬伤
            </div>
            <p className="text-lg font-bold leading-8 text-[var(--ink)]">
              {analysis.fatal_flaw}
            </p>
          </div>

          <div className="rounded-[1.8rem] border-2 border-[var(--border)] bg-white/90 p-5">
            <div className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-[var(--muted)]">
              三条抢救建议
            </div>
            <ul className="grid gap-3">
              {analysis.fixes.map((fix, index) => (
                <li
                  key={`${fix}-${index}`}
                  className="rounded-2xl border-2 border-[var(--border)] bg-[var(--sky)]/30 px-4 py-3 text-sm font-bold leading-7"
                >
                  {String(index + 1).padStart(2, "0")} / {fix}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="rounded-[1.8rem] border-2 border-[var(--border)] bg-white/85 p-4">
            <div className="mb-4 text-xs font-black uppercase tracking-[0.18em] text-[var(--muted)]">
              维度打分
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {breakdownLabels.map((item) => (
                <ScoreTile
                  key={item.key}
                  label={item.label}
                  value={analysis.score_breakdown[item.key]}
                  accent={item.accent}
                />
              ))}
            </div>
          </div>

          <div className="rounded-[1.8rem] border-2 border-[var(--border)] bg-[var(--acid)] p-4">
            <div className="text-xs font-black uppercase tracking-[0.18em] text-[var(--muted)]">
              分享短句
            </div>
            <p className="mt-2 text-base font-black leading-7 text-[var(--ink)]">
              {analysis.share_line}
            </p>
          </div>

          {footer}
        </div>
      </div>
    </article>
  );
}
