"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight, Check, Clock3, Compass, HeartHandshake,
  Pencil, Sparkles, X, type LucideIcon
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
      title: "晒晒我想买的",
      desc: "商品、价格、一句心情——不用写得很完整，先说出来就好",
      bg: "var(--sage-soft)",
      mock: <DemoFormCard/>,
    },
    {
      icon: HeartHandshake,
      title: "喊闺蜜来参谋",
      desc: "她会收到你的心动，给你一句真心的建议——不替你决定，但陪你想想",
      bg: "var(--orange-soft)",
      mock: <DemoReviewCard/>,
    },
    {
      icon: Clock3,
      title: "放进冷静盒",
      desc: "给冲动一个等待的窗口，明天醒来还心动再说不迟",
      bg: "var(--sage-soft)",
      mock: <DemoCoolingCard/>,
    },
    {
      icon: Check,
      title: "后来怎么样了",
      desc: "买了真香？成功拔草？记录一下这次小小的消费故事",
      bg: "var(--orange-soft)",
      mock: <DemoDecisionCard/>,
    },
    {
      icon: Compass,
      title: "逛逛大家都在纠结什么",
      desc: "在广场围观真实的心动和拔草，也许你并不孤单",
      bg: "var(--blue-soft)",
      mock: <DemoExploreCard/>,
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
              准备好和闺蜜一起，让每一次心动都更有陪伴感了吗？
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
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-[var(--muted)]">商品名称</p>
            <p className="font-semibold">降噪耳机</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-[var(--muted)]">价格</p>
            <p className="font-semibold">¥899</p>
          </div>
        </div>
        <div className="flex gap-2">
          <span className="mood-chip">最近有点压力</span>
          <span className="rounded-full bg-[var(--blue-soft)] px-3 py-1 text-xs text-[var(--forest-deep)]">只给闺蜜看</span>
        </div>
        <div className="rounded-2xl bg-[var(--cream)] p-3 text-sm text-[var(--muted)]">
          通勤时想安静听播客，但家里已有一副普通耳机……
        </div>
        <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
          <Sparkles size={13} className="text-[var(--orange)]"/>
          上头小提示：可能有点上头 · 建议冷静 24 小时
        </div>
      </div>
    </div>
  );
}

function DemoReviewCard() {
  return (
    <div className="rounded-3xl border border-[var(--line)] bg-[var(--paper)] p-5 text-left shadow-sm">
      <div className="flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-full bg-[var(--forest)] text-white text-sm font-bold">满</span>
        <div>
          <p className="text-sm font-semibold">小满说</p>
          <p className="text-xs text-[var(--muted)]">2 分钟前</p>
        </div>
      </div>
      <div className="mt-3 rounded-2xl bg-[var(--cream)] p-3 text-sm leading-6 text-[var(--muted)]">
        不拦你，但答应我多想一天。你不是已经有一副了吗？先试试那副能不能满足通勤需求。
      </div>
      <div className="mt-3 flex gap-2">
        <span className="rounded-full bg-[var(--lemon-soft)] px-3 py-1 text-xs font-semibold text-[#67560f]">先等等</span>
        <span className="rounded-full bg-white px-3 py-1 text-xs text-[var(--muted)]">不替你决定，但我有话说</span>
      </div>
    </div>
  );
}

function DemoCoolingCard() {
  return (
    <div className="rounded-3xl border border-[var(--line)] bg-[var(--paper)] p-5 text-center shadow-sm">
      <Clock3 size={36} className="mx-auto text-[var(--orange)]"/>
      <p className="mt-3 text-3xl font-bold tabular-nums">23:59:58</p>
      <p className="mt-1 text-sm text-[var(--muted)]">冷静盒里，再睡一觉看看</p>
      <div className="mt-4 h-1.5 rounded-full bg-[var(--line)]">
        <div className="h-1.5 w-2/3 rounded-full bg-[var(--orange)]"/>
      </div>
      <p className="mt-3 text-xs text-[var(--muted)]">闺蜜可以看到你在冷静中，随时来关心你</p>
    </div>
  );
}

function DemoDecisionCard() {
  return (
    <div className="rounded-3xl border border-[var(--line)] bg-[var(--paper)] p-5 text-center shadow-sm">
      <p className="text-sm text-[var(--muted)]">冷静期结束啦，后来怎么样了？</p>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border-2 border-[var(--forest)] bg-[var(--sage-soft)] p-3">
          <Check className="mx-auto text-[var(--forest)]"/>
          <p className="mt-1 text-sm font-semibold text-[var(--forest)]">成功拔草</p>
          <p className="text-xs text-[var(--muted)]">¥899 留在了口袋里</p>
        </div>
        <div className="rounded-2xl border border-[var(--line)] bg-white p-3">
          <span className="text-2xl">🥰</span>
          <p className="mt-1 text-sm font-semibold text-[var(--muted)]">买了，真香</p>
          <p className="text-xs text-[var(--muted)]">实际 ¥820</p>
        </div>
      </div>
      <p className="mt-3 text-xs text-[var(--muted)]">记录会同步给帮你参谋的闺蜜，也可以发到广场</p>
    </div>
  );
}

function DemoExploreCard() {
  return (
    <div className="space-y-3">
      <div className="rounded-3xl border border-[var(--line)] bg-[var(--paper)] p-4 text-left shadow-sm">
        <div className="flex items-center gap-3">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-[#f3e9df] text-3xl">📷</span>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <b className="text-sm">便携照片打印机</b>
              <b className="text-sm">¥699</b>
            </div>
            <p className="mt-0.5 text-xs text-[var(--muted)]">晚风 · 纠结 7 天</p>
          </div>
        </div>
        <p className="mt-2 text-xs leading-5 text-[var(--muted)]">想把旅行照片打印出来做手账，但担心买回来吃灰……</p>
        <div className="mt-3 flex gap-3 border-t border-[var(--line)] pt-2 text-xs">
          <span className="flex items-center gap-1 text-[var(--forest)]">👍 值得买 26</span>
          <span className="flex items-center gap-1 text-[var(--muted)]">🤝 我也想买 12</span>
          <span className="flex items-center gap-1 text-[var(--muted)]">💬 8</span>
        </div>
      </div>
      <div className="rounded-3xl border border-[var(--line)] bg-[var(--paper)] p-4 text-left shadow-sm">
        <div className="flex items-center gap-3">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-[var(--blue-soft)] text-3xl">☕</span>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <b className="text-sm">奶油白咖啡机</b>
              <b className="text-sm">¥1299</b>
            </div>
            <p className="mt-0.5 text-xs text-[var(--muted)]">栗子 · 成功拔草</p>
          </div>
        </div>
        <p className="mt-2 text-xs leading-5 text-[var(--muted)]">冷静三天后发现我真正想要的是每天早点睡，不是咖啡机。</p>
        <div className="mt-3 flex gap-3 border-t border-[var(--line)] pt-2 text-xs">
          <span className="flex items-center gap-1 text-[var(--forest)]">🌿 成功拔草 88</span>
          <span className="flex items-center gap-1 text-[var(--muted)]">🤝 我也想买 5</span>
          <span className="flex items-center gap-1 text-[var(--muted)]">💬 20</span>
        </div>
      </div>
    </div>
  );
}
