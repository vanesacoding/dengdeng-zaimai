"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight, Check, Clock3, HeartHandshake, Pencil,
  Sparkles, X, type LucideIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";

type Slide = {
  icon: LucideIcon;
  title: string;
  desc: string;
  bg: string;
  mock: React.ReactNode;
};

export default function Demo() {
  const [step, setStep] = useState(0);
  const router = useRouter();

  const slides: Slide[] = [
    {
      icon: Pencil,
      title: "写下你想买的东西",
      desc: "物品名称、价格、购买理由——写得越具体，越能看清真实需求",
      bg: "var(--sage-soft)",
      mock: <DemoFormCard/>,
    },
    {
      icon: HeartHandshake,
      title: "请信任的朋友帮你看一眼",
      desc: "朋友会收到你的申请，给出多一个视角的建议",
      bg: "var(--orange-soft)",
      mock: <DemoReviewCard/>,
    },
    {
      icon: Clock3,
      title: "给自己一个冷静期",
      desc: "提交后进入冷静倒计时，让冲动有时间消退",
      bg: "var(--sage-soft)",
      mock: <DemoCoolingCard/>,
    },
    {
      icon: Check,
      title: "做决定——买或不买",
      desc: "冷静期结束后，记录最终决定。守住也是一种成就",
      bg: "var(--orange-soft)",
      mock: <DemoDecisionCard/>,
    },
  ];

  const isLast = step === slides.length - 1;
  const Icon = slides[step].icon;

  return (
    <main className="flex min-h-dvh flex-col bg-[var(--cream)]">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-sm text-[var(--forest)]"
        >
          <X size={18}/> 跳过
        </button>
        <div className="flex gap-1.5">
          {slides.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === step ? "w-6 bg-[var(--forest)]" : "w-1.5 bg-[var(--line)]"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Slide content */}
      <div className="flex flex-1 flex-col items-center justify-center px-6">
        <div key={step} className="flex w-full max-w-sm flex-col items-center text-center">
          <span
            className="grid size-16 place-items-center rounded-3xl"
            style={{ background: slides[step].bg }}
          >
            <Icon size={32} className="text-[var(--forest)]"/>
          </span>
          <h2 className="mt-6 text-2xl font-bold">{slides[step].title}</h2>
          <p className="mt-3 leading-7 text-[var(--muted)]">{slides[step].desc}</p>

          {/* Mini visual mock */}
          <div className="mt-8 w-full">{slides[step].mock}</div>
        </div>
      </div>

      {/* Bottom actions */}
      <div className="px-6 pb-10">
        {isLast ? (
          <div className="space-y-3">
            <p className="text-center text-sm text-[var(--muted)]">
              准备好和朋友一起理性消费了吗？
            </p>
            <Button asChild className="h-14 w-full">
              <Link href="/login">
                <Sparkles/> 开始使用 <ArrowRight size={17}/>
              </Link>
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => router.push("/app")}>
              先随便看看
            </Button>
          </div>
        ) : (
          <Button
            className="h-14 w-full"
            onClick={() => setStep(step + 1)}
          >
            下一步 <ArrowRight size={17}/>
          </Button>
        )}
      </div>
    </main>
  );
}

/* --- Mini visual mocks for each slide --- */

function DemoFormCard() {
  return (
    <div className="rounded-3xl border border-[var(--line)] bg-[var(--paper)] p-5 text-left shadow-sm">
      <div className="space-y-3">
        <div>
          <p className="text-xs text-[var(--muted)]">物品名称</p>
          <p className="font-semibold">降噪耳机</p>
        </div>
        <div className="flex gap-3">
          <div>
            <p className="text-xs text-[var(--muted)]">价格</p>
            <p className="font-semibold">¥899</p>
          </div>
          <div>
            <p className="text-xs text-[var(--muted)]">分类</p>
            <p className="font-semibold">数码</p>
          </div>
        </div>
        <div className="rounded-2xl bg-[var(--cream)] p-3 text-sm text-[var(--muted)]">
          通勤时想安静听播客，但家里已有一副普通耳机……
        </div>
      </div>
    </div>
  );
}

function DemoReviewCard() {
  return (
    <div className="rounded-3xl border border-[var(--line)] bg-[var(--paper)] p-5 text-left shadow-sm">
      <div className="flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-full bg-[var(--forest)] text-white text-sm font-bold">搭</span>
        <div>
          <p className="text-sm font-semibold">搭子的建议</p>
          <p className="text-xs text-[var(--muted)]">2 分钟前</p>
        </div>
      </div>
      <div className="mt-3 rounded-2xl bg-[var(--cream)] p-3 text-sm leading-6 text-[var(--muted)]">
        预算够，但建议等两天再决定。你已经有一副耳机，可以想想降噪功能会不会经常用到。
      </div>
      <div className="mt-3 flex gap-2">
        <span className="rounded-full bg-[var(--sage-soft)] px-3 py-1 text-xs text-[var(--forest)]">通过</span>
        <span className="rounded-full bg-white px-3 py-1 text-xs text-[var(--muted)]">建议等等</span>
      </div>
    </div>
  );
}

function DemoCoolingCard() {
  return (
    <div className="rounded-3xl border border-[var(--line)] bg-[var(--paper)] p-5 text-center shadow-sm">
      <Clock3 size={36} className="mx-auto text-[var(--orange)]"/>
      <p className="mt-3 text-3xl font-bold tabular-nums">23:59:58</p>
      <p className="mt-1 text-sm text-[var(--muted)]">冷静期倒计时中</p>
      <div className="mt-4 h-1.5 rounded-full bg-[var(--line)]">
        <div className="h-1.5 w-2/3 rounded-full bg-[var(--orange)]"/>
      </div>
    </div>
  );
}

function DemoDecisionCard() {
  return (
    <div className="rounded-3xl border border-[var(--line)] bg-[var(--paper)] p-5 text-center shadow-sm">
      <p className="text-sm text-[var(--muted)]">冷静期结束，你的决定是？</p>
      <div className="mt-4 flex gap-3">
        <div className="flex-1 rounded-2xl border-2 border-[var(--forest)] bg-[var(--sage-soft)] p-3">
          <Check className="mx-auto text-[var(--forest)]"/>
          <p className="mt-1 text-sm font-semibold text-[var(--forest)]">成功拔草</p>
          <p className="text-xs text-[var(--muted)]">¥899 留在了口袋里</p>
        </div>
        <div className="flex-1 rounded-2xl border border-[var(--line)] bg-white p-3">
          <p className="mt-1 text-sm font-semibold text-[var(--muted)]">已购买</p>
          <p className="text-xs text-[var(--muted)]">实际 ¥820</p>
        </div>
      </div>
    </div>
  );
}
