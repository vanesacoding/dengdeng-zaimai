"use client";

import Link from "next/link";
import { ChevronRight, ClipboardCheck, Clock3, Plus, Scale } from "lucide-react";
import { Card } from "@/components/ui/card";
import { demoRequests } from "@/lib/mock-data";
import { formatMoney } from "@/lib/utils";
import { statusLabel } from "@/lib/domain";
import { useLocalUser } from "@/lib/use-local-user";

export default function ApprovalHome() {
  const nickname = useLocalUser();
  const waiting = demoRequests.find(item => item.status === "PENDING_APPROVAL");
  const cooling = demoRequests.find(item => item.status === "COOLING_OFF");

  return <>
    <header>
      <p className="text-xs text-[var(--muted)]">嗨，{nickname}</p>
      <h1 className="mt-1 font-black">购物审批</h1>
      <p className="mt-1.5 text-[13px] text-[var(--muted)]">想买就先说一声，帮彼此多想一下。</p>
    </header>

    <div className="mt-5 grid grid-cols-2 gap-3">
      <Link href="/app/new" className="flex min-h-28 flex-col justify-between rounded-2xl bg-[var(--forest)] p-4 text-white shadow-[0_8px_20px_rgba(79,117,89,.18)]">
        <span className="grid size-8 place-items-center rounded-xl bg-white/15"><Plus size={19}/></span>
        <div><b className="text-[15px]">发起审批</b><p className="mt-0.5 text-xs text-white/70">我有东西想买</p></div>
      </Link>
      <Link href="/app/review" className="flex min-h-28 flex-col justify-between rounded-2xl bg-[var(--lemon-soft)] p-4 text-[var(--ink)]">
        <span className="grid size-8 place-items-center rounded-xl bg-white/70 text-[var(--orange-deep)]"><ClipboardCheck size={18}/></span>
        <div><b className="text-[15px]">等我审批</b><p className="mt-0.5 text-xs text-[var(--muted)]">帮闺蜜看看</p></div>
      </Link>
    </div>

    <section className="mt-6">
      <div className="mb-2.5 flex items-center justify-between"><h2 className="font-bold">审批进度</h2><Link href="/app/requests" className="text-xs text-[var(--forest)]">全部记录</Link></div>
      <div className="space-y-2.5">
        {waiting && <Link href={`/app/requests/${waiting.id}`}><Card className="flex items-center gap-3 p-3.5"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--sage-soft)]">🎧</span><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-3"><b className="truncate text-[13px]">{waiting.itemName}</b><b className="text-[13px]">{formatMoney(waiting.priceCents)}</b></div><p className="mt-1 text-xs text-[var(--forest)]">{statusLabel[waiting.status]}</p></div><ChevronRight size={16} className="text-[var(--muted)]"/></Card></Link>}
        {cooling && <Link href={`/app/requests/${cooling.id}`}><Card className="flex items-center gap-3 p-3.5"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--orange-soft)]"><Clock3 size={18} className="text-[var(--orange-deep)]"/></span><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-3"><b className="truncate text-[13px]">{cooling.itemName}</b><b className="text-[13px]">{formatMoney(cooling.priceCents)}</b></div><p className="mt-1 text-xs text-[var(--muted)]">冷静中 · 还剩 18 小时</p></div><ChevronRight size={16} className="text-[var(--muted)]"/></Card></Link>}
      </div>
    </section>

    <section className="mt-6">
      <h2 className="mb-2.5 font-bold">最近结果</h2>
      <Card className="flex items-center gap-3 p-3.5"><span className="grid size-10 place-items-center rounded-xl bg-[var(--blue-soft)]">☕</span><div className="flex-1"><b className="text-[13px]">手冲咖啡套装</b><p className="mt-1 text-xs text-[var(--muted)]">最后没买，成功拔草</p></div><span className="text-xs font-semibold text-[var(--forest)]">已结案</span></Card>
    </section>

    <Link href="/app/explore" className="mt-6 flex min-h-14 items-center gap-3 rounded-2xl border border-[var(--lemon)] bg-[var(--lemon-soft)] px-4"><Scale size={19} className="text-[var(--orange-deep)]"/><div className="min-w-0 flex-1"><b className="text-[13px]">去等等法庭评审</b><p className="mt-0.5 truncate text-xs text-[var(--muted)]">看看大家今天又想买什么</p></div><ChevronRight size={16}/></Link>
  </>;
}
