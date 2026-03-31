import Link from "next/link";
import type { ReactNode } from "react";

type ActivePage = "home" | "duel" | "leaderboard";

const navItems: Array<{ href: string; label: string; key: ActivePage }> = [
  { href: "/", label: "单人审判", key: "home" },
  { href: "/duel", label: "简历 PK", key: "duel" },
  { href: "/leaderboard", label: "排行榜", key: "leaderboard" },
];

function navClass(active: boolean) {
  return [
    "rounded-full border-2 border-[var(--border)] px-4 py-2 text-sm font-black uppercase tracking-[0.16em] transition",
    active
      ? "bg-[var(--acid)] text-[var(--ink)] shadow-[4px_4px_0_var(--border)]"
      : "bg-white/75 text-[var(--ink)] hover:-translate-y-0.5 hover:bg-[var(--sky)]",
  ].join(" ");
}

export function AppFrame({
  active,
  children,
}: {
  active: ActivePage;
  children: ReactNode;
}) {
  return (
    <div className="relative isolate min-h-screen overflow-hidden pb-10">
      <div className="pointer-events-none absolute inset-0 opacity-90">
        <div className="absolute left-[-12rem] top-[-10rem] h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,rgba(255,91,73,0.35),transparent_65%)]" />
        <div className="absolute right-[-8rem] top-[8rem] h-[24rem] w-[24rem] rounded-full bg-[radial-gradient(circle,rgba(125,215,255,0.4),transparent_65%)]" />
        <div className="absolute bottom-[-8rem] left-[20%] h-[20rem] w-[20rem] rounded-full bg-[radial-gradient(circle,rgba(245,255,79,0.35),transparent_65%)]" />
      </div>

      <header className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
        <Link href="/" className="panel flex items-center gap-3 px-4 py-3">
          <div className="display-type rounded-2xl bg-[var(--hot)] px-3 py-2 text-lg leading-none text-white">
            PK
          </div>
          <div>
            <div className="display-type text-xl uppercase leading-none tracking-[0.18em]">
              Your CV
            </div>
            <div className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--muted)]">
              Toxic HR Theater
            </div>
          </div>
        </Link>

        <nav className="flex flex-wrap items-center justify-end gap-2">
          {navItems.map((item) => (
            <Link key={item.key} href={item.href} className={navClass(active === item.key)}>
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 sm:px-6 lg:px-8">
        {children}
      </main>

      <footer className="relative z-10 mx-auto mt-10 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="panel flex flex-col gap-3 px-5 py-4 text-sm text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between">
          <p>
            只分析文本内容，默认匿名展示衍生结果。OpenAI-compatible 接口可用，vLLM
            这类兼容后端也能接。
          </p>
          <p className="font-mono text-xs uppercase tracking-[0.18em]">
            Roast the resume, not the human.
          </p>
        </div>
      </footer>
    </div>
  );
}
