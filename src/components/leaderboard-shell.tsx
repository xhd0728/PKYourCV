"use client";

import { useEffect, useEffectEvent, useRef, useState, useTransition } from "react";

import type { BoardType, LeaderboardEntry, LeaderboardResponse, SourceType } from "@/lib/types";

function sourceLabel(value: SourceType) {
  return value === "url" ? "主页" : "PDF";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function EntryCard({ entry, rank, board }: { entry: LeaderboardEntry; rank: number; board: BoardType }) {
  return (
    <article className="panel p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="display-type rounded-[1.4rem] border-3 border-[var(--border)] bg-[var(--acid)] px-4 py-3 text-4xl leading-none">
            {String(rank).padStart(2, "0")}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="display-type text-3xl leading-none">{entry.nickname}</h3>
              <span className="rounded-full border-2 border-[var(--border)] bg-white px-3 py-1 text-xs font-black uppercase tracking-[0.16em]">
                {sourceLabel(entry.source_type)}
              </span>
            </div>
            <p className="mt-2 max-w-2xl text-sm font-bold leading-7 text-[var(--muted)]">
              {entry.summary}
            </p>
          </div>
        </div>

        <div className="grid min-w-[14rem] gap-3 sm:grid-cols-2">
          <div className="rounded-[1.4rem] border-2 border-[var(--border)] bg-[var(--leaf)] p-4">
            <div className="text-xs font-black uppercase tracking-[0.16em] text-[var(--muted)]">
              生还率
            </div>
            <div className="display-type mt-1 text-4xl leading-none">{entry.hireability_score}</div>
          </div>
          <div className="rounded-[1.4rem] border-2 border-[var(--border)] bg-[var(--peach)] p-4">
            <div className="text-xs font-black uppercase tracking-[0.16em] text-[var(--muted)]">
              抽象值
            </div>
            <div className="display-type mt-1 text-4xl leading-none">{entry.chaos_score}</div>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[1.6rem] border-2 border-[var(--border)] bg-white/90 p-4">
          <div className="text-xs font-black uppercase tracking-[0.16em] text-[var(--muted)]">
            毒舌摘录
          </div>
          <p className="mt-2 text-base leading-8 text-[var(--ink)]">{entry.roast_copy}</p>
          <p className="mt-4 rounded-2xl border-2 border-[var(--border)] bg-[var(--acid)] px-4 py-3 text-sm font-black leading-7">
            {entry.share_line}
          </p>
        </div>

        <div className="rounded-[1.6rem] border-2 border-[var(--border)] bg-white/90 p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="text-xs font-black uppercase tracking-[0.16em] text-[var(--muted)]">
              榜单信息
            </div>
            <div className="text-xs font-black uppercase tracking-[0.16em] text-[var(--muted)]">
              {formatDate(entry.created_at)}
            </div>
          </div>
          <p className="mt-3 text-sm font-bold leading-7 text-[var(--ink)]">
            {board === "hireable" ? "按更像会被捞走的人排序。" : "按更像事故现场的程度排序。"}
          </p>
          <p className="mt-3 rounded-2xl border-2 border-[var(--border)] bg-[var(--sky)]/30 px-4 py-3 text-sm font-black leading-7">
            致命硬伤：{entry.fatal_flaw}
          </p>
        </div>
      </div>
    </article>
  );
}

export function LeaderboardShell({ initialData }: { initialData: LeaderboardResponse }) {
  const [data, setData] = useState(initialData);
  const [board, setBoard] = useState<BoardType>(initialData.board);
  const [source, setSource] = useState<SourceType | "all">(initialData.source_type);
  const [page, setPage] = useState(initialData.page);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const didMount = useRef(false);

  const fetchBoard = useEffectEvent(async (nextBoard: BoardType, nextSource: SourceType | "all", nextPage: number) => {
    const params = new URLSearchParams({
      board: nextBoard,
      source: nextSource,
      page: String(nextPage),
      page_size: String(data.page_size),
    });
    const response = await fetch(`/api/leaderboard?${params.toString()}`, {
      cache: "no-store",
    });
    const payload = (await response.json()) as LeaderboardResponse | { error: string };

    if (!response.ok || "error" in payload) {
      throw new Error("error" in payload ? payload.error : "排行榜加载失败。");
    }

    setError("");
    setData(payload);
  });

  useEffect(() => {
    if (!didMount.current) {
      didMount.current = true;
      return;
    }

    startTransition(async () => {
      try {
        await fetchBoard(board, source, page);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "排行榜加载失败。");
      }
    });
  }, [board, source, page]);

  const totalPages = Math.max(1, Math.ceil(data.total / data.page_size));

  return (
    <div className="grid gap-5">
      <section className="panel overflow-hidden p-5 sm:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.18em] text-[var(--muted)]">
              匿名排行榜
            </div>
            <h2 className="display-type mt-3 text-4xl leading-none sm:text-5xl">
              一边看谁更像 offer 磁铁，
              <br />
              一边看谁像履历事故现场。
            </h2>
            <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--muted)]">
              这里只展示昵称、分数和毒评摘要，不公开原始 PDF 与完整主页内容。
            </p>
          </div>

          <div className="rounded-[1.6rem] border-2 border-[var(--border)] bg-[var(--ink)] px-5 py-4 text-white">
            <div className="text-xs font-black uppercase tracking-[0.16em] text-white/60">
              总记录
            </div>
            <div className="display-type mt-2 text-5xl leading-none">{data.total}</div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_auto]">
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className={`rounded-full border-2 border-[var(--border)] px-4 py-2 text-sm font-black uppercase tracking-[0.16em] ${
                board === "hireable" ? "bg-[var(--leaf)] shadow-[4px_4px_0_var(--border)]" : "bg-white"
              }`}
              onClick={() => {
                setBoard("hireable");
                setPage(1);
              }}
            >
              最能进厂榜
            </button>
            <button
              type="button"
              className={`rounded-full border-2 border-[var(--border)] px-4 py-2 text-sm font-black uppercase tracking-[0.16em] ${
                board === "chaos" ? "bg-[var(--peach)] shadow-[4px_4px_0_var(--border)]" : "bg-white"
              }`}
              onClick={() => {
                setBoard("chaos");
                setPage(1);
              }}
            >
              最离谱简历榜
            </button>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className={`rounded-full border-2 border-[var(--border)] px-4 py-2 text-sm font-black uppercase tracking-[0.16em] ${
                source === "all" ? "bg-[var(--acid)] shadow-[4px_4px_0_var(--border)]" : "bg-white"
              }`}
              onClick={() => {
                setSource("all");
                setPage(1);
              }}
            >
              全部来源
            </button>
            <button
              type="button"
              className={`rounded-full border-2 border-[var(--border)] px-4 py-2 text-sm font-black uppercase tracking-[0.16em] ${
                source === "url" ? "bg-[var(--sky)] shadow-[4px_4px_0_var(--border)]" : "bg-white"
              }`}
              onClick={() => {
                setSource("url");
                setPage(1);
              }}
            >
              只看主页
            </button>
            <button
              type="button"
              className={`rounded-full border-2 border-[var(--border)] px-4 py-2 text-sm font-black uppercase tracking-[0.16em] ${
                source === "pdf" ? "bg-[var(--peach)] shadow-[4px_4px_0_var(--border)]" : "bg-white"
              }`}
              onClick={() => {
                setSource("pdf");
                setPage(1);
              }}
            >
              只看 PDF
            </button>
          </div>
        </div>

        {isPending ? (
          <div className="mt-5 rounded-[1.4rem] border-2 border-[var(--border)] bg-[var(--sky)]/40 px-4 py-3 text-sm font-black">
            正在刷新榜单，HR 在翻简历堆……
          </div>
        ) : null}

        {error ? (
          <div className="mt-5 rounded-[1.4rem] border-2 border-[var(--border)] bg-[var(--peach)] px-4 py-3 text-sm font-black">
            {error}
          </div>
        ) : null}
      </section>

      {data.entries.length ? (
        data.entries.map((entry, index) => (
          <EntryCard
            key={entry.id}
            entry={entry}
            rank={(page - 1) * data.page_size + index + 1}
            board={board}
          />
        ))
      ) : (
        <div className="panel p-8 text-center">
          <div className="display-type text-4xl leading-none">榜单空空如也</div>
          <p className="mt-3 text-base font-bold leading-8 text-[var(--muted)]">
            先去首页扔几份简历进来，再回来围观。
          </p>
        </div>
      )}

      <section className="panel flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm font-bold leading-7 text-[var(--muted)]">
          第 {page} / {totalPages} 页
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className="rounded-full border-2 border-[var(--border)] bg-white px-4 py-2 text-sm font-black uppercase tracking-[0.16em] disabled:opacity-40"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={page <= 1 || isPending}
          >
            上一页
          </button>
          <button
            type="button"
            className="rounded-full border-2 border-[var(--border)] bg-[var(--acid)] px-4 py-2 text-sm font-black uppercase tracking-[0.16em] disabled:opacity-40"
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            disabled={page >= totalPages || isPending}
          >
            下一页
          </button>
        </div>
      </section>
    </div>
  );
}
