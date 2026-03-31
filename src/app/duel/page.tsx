import { AppFrame } from "@/components/app-frame";
import { DuelArena } from "@/components/duel-arena";

export default function DuelPage() {
  return (
    <AppFrame active="duel">
      <section className="panel overflow-hidden p-6 sm:p-8">
        <div className="max-w-4xl">
          <div className="text-xs font-black uppercase tracking-[0.18em] text-[var(--muted)]">
            简历 PK 模式
          </div>
          <h1 className="display-type mt-4 text-[clamp(3rem,8vw,6.4rem)] leading-[0.94]">
            WHO GETS THE OFFER,
            <br />
            WHO GETS ROASTED
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-9 text-[var(--muted)]">
            上传两份主页或两份 PDF，或者左右混搭。系统会先各自做结构化分析，再决定谁更有大厂信号，谁更像履历事故。
          </p>
        </div>
      </section>

      <DuelArena />
    </AppFrame>
  );
}
