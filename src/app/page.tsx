import Link from "next/link";

import { AppFrame } from "@/components/app-frame";
import { AnalyzeWorkbench } from "@/components/analyze-workbench";

export default function Home() {
  return (
    <AppFrame active="home">
      <section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="panel relative overflow-hidden p-6 sm:p-8">
          <div className="absolute right-5 top-5 rotate-3 rounded-full border-2 border-[var(--border)] bg-[var(--acid)] px-4 py-2 text-xs font-black uppercase tracking-[0.18em]">
            Public Roast Machine
          </div>

          <div className="max-w-3xl">
            <div className="text-xs font-black uppercase tracking-[0.2em] text-[var(--muted)]">
              幽默搞怪的履历审判台
            </div>
            <h1 className="display-type mt-4 text-[clamp(3.4rem,9vw,8.2rem)] leading-[0.92]">
              PK
              <span className="ml-3 inline-block rounded-[1.6rem] border-3 border-[var(--border)] bg-[var(--hot)] px-4 py-2 text-white">
                YOUR
              </span>
              <br />
              CV
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-9 text-[var(--muted)]">
              用户在 UI 里直接上传主页 URL 或 PDF 简历，模型先抽文字，再用刻薄但不下三路的大厂
              HR 口吻给点评。你还可以把两份履历拉上擂台，现场决出谁更像 offer 候选人，谁更像事故现场。
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-[1.8rem] border-3 border-[var(--border)] bg-[var(--leaf)] p-5">
              <div className="text-xs font-black uppercase tracking-[0.16em] text-[var(--muted)]">
                单人审判
              </div>
              <p className="mt-3 text-base font-bold leading-8">
                输出大厂生还率、抽象值、致命硬伤和三条抢救建议。
              </p>
            </div>
            <div className="rounded-[1.8rem] border-3 border-[var(--border)] bg-[var(--sky)] p-5">
              <div className="text-xs font-black uppercase tracking-[0.16em] text-[var(--muted)]">
                简历 PK
              </div>
              <p className="mt-3 text-base font-bold leading-8">
                先各自分析，再决定谁更强、谁更拉，最后给综艺解说词。
              </p>
            </div>
            <div className="rounded-[1.8rem] border-3 border-[var(--border)] bg-[var(--peach)] p-5">
              <div className="text-xs font-black uppercase tracking-[0.16em] text-[var(--muted)]">
                匿名榜单
              </div>
              <p className="mt-3 text-base font-bold leading-8">
                只公开分数和毒评，不公开原始主页和 PDF 内容。
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/duel"
              className="display-type inline-flex items-center justify-center rounded-full border-3 border-[var(--border)] bg-[var(--acid)] px-6 py-4 text-xl uppercase tracking-[0.14em] text-[var(--ink)] shadow-[7px_7px_0_var(--border)] transition hover:-translate-y-1 hover:bg-[var(--hot)] hover:text-[var(--paper)] focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-[var(--hot)]"
            >
              去打擂台
            </Link>
            <Link
              href="/leaderboard"
              className="rounded-full border-3 border-[var(--border)] bg-white px-6 py-4 text-sm font-black uppercase tracking-[0.18em] shadow-[7px_7px_0_var(--border)]"
            >
              看排行榜
            </Link>
          </div>
        </div>

        <div className="grid gap-5">
          <div className="panel p-5 sm:p-6">
            <div className="text-xs font-black uppercase tracking-[0.18em] text-[var(--muted)]">
              风格说明
            </div>
            <p className="mt-3 text-base leading-8 text-[var(--ink)]">
              这里不是正经 ATS，也不是职业顾问。它更像一档黑色喜剧综艺：用结构化打分保证结果稳定，再让模型把坏话说得足够好笑。
            </p>
          </div>
          <div className="panel p-5 sm:p-6">
            <div className="text-xs font-black uppercase tracking-[0.18em] text-[var(--muted)]">
              模型接入
            </div>
            <p className="mt-3 text-base leading-8 text-[var(--ink)]">
              只要求 OpenAI 兼容接口，支持自定义 API Key、Base URL、Model 名称，适配自部署
              vLLM 之类的后端。
            </p>
          </div>
          <div className="panel p-5 sm:p-6">
            <div className="text-xs font-black uppercase tracking-[0.18em] text-[var(--muted)]">
              输入范围
            </div>
            <p className="mt-3 text-base leading-8 text-[var(--ink)]">
              当前 MVP 只吃两种东西：主页 URL，或者 PDF 简历。图片、OCR、Word 文档暂时不接。
            </p>
          </div>
        </div>
      </section>

      <AnalyzeWorkbench />
    </AppFrame>
  );
}
