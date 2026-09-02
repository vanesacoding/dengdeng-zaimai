import Link from "next/link";
import { ArrowRight, Check, Clock3, HeartHandshake, Pencil, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

const steps: { icon: LucideIcon; title: string; desc: string; bg: string }[] = [
  { icon: Pencil, title: "写下想买的", desc: "物品、价格、理由——越具体越清醒", bg: "var(--sage-soft)" },
  { icon: HeartHandshake, title: "朋友帮看一眼", desc: "信任的人给你多一个视角", bg: "var(--orange-soft)" },
  { icon: Clock3, title: "冷静一下", desc: "给冲动一个等待的窗口", bg: "var(--sage-soft)" },
  { icon: Check, title: "做决定", desc: "买或不买，最终属于你", bg: "var(--orange-soft)" },
];

export default function Landing() {
  return (
    <main className="min-h-dvh overflow-hidden bg-[var(--cream)]">
      <section className="mx-auto flex min-h-dvh max-w-5xl flex-col px-6 py-6 md:flex-row md:items-center md:gap-16">
        {/* Left: brand + tagline + CTAs */}
        <div className="max-w-xl flex-1 py-12">
          <div className="mb-12 flex items-center gap-3 text-lg font-bold text-[var(--forest-deep)]">
            <span className="grid size-10 place-items-center rounded-2xl bg-[var(--forest)] text-white">等</span>
            等等再买
          </div>
          <p className="mb-3 text-sm font-semibold tracking-[.2em] text-[var(--orange)]">给冲动一个温柔的暂停键</p>
          <h1 className="text-5xl font-bold leading-[1.12] tracking-tight md:text-7xl">
            喜欢可以，<br/>
            <span className="text-[var(--forest)]">先等等再买。</span>
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-[var(--muted)]">
            写下为什么想买，请信任的朋友帮你看一眼。不是管住你，而是陪你做一个更清醒的决定。
          </p>
          <div className="mt-9 flex gap-3">
            <Button asChild><Link href="/app">体验演示 <ArrowRight size={17}/></Link></Button>
            <Button variant="outline" asChild><Link href="/login">登录</Link></Button>
          </div>
          <div className="mt-10 flex flex-wrap gap-5 text-sm text-[var(--muted)]">
            <span className="flex items-center gap-2"><Clock3 size={18}/>冷静一下</span>
            <span className="flex items-center gap-2"><HeartHandshake size={18}/>朋友建议</span>
            <span className="flex items-center gap-2"><Check size={18}/>决定仍在你</span>
          </div>
        </div>

        {/* Right: sequential illustration cards */}
        <div className="flex flex-1 flex-col gap-0 py-8">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={i}>
                <div className="flex items-center gap-4 rounded-3xl border border-[var(--line)] bg-[var(--paper)] p-5 shadow-sm">
                  <span className="grid size-12 shrink-0 place-items-center rounded-2xl" style={{ background: step.bg }}>
                    <Icon size={24} className="text-[var(--forest)]"/>
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[var(--muted)]">{String(i + 1).padStart(2, "0")}</span>
                      <b className="text-lg">{step.title}</b>
                    </div>
                    <p className="mt-1 text-sm text-[var(--muted)]">{step.desc}</p>
                  </div>
                </div>
                {i < steps.length - 1 && (
                  <div className="ml-10 flex justify-center py-1.5">
                    <div className="h-5 w-px bg-[var(--line)]"/>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
