"use client";

import Link from "next/link";
import { Bell, ChevronRight, Clock3, Plus, ShieldCheck, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { demoBudget, demoRequests } from "@/lib/mock-data";
import { formatMoney } from "@/lib/utils";
import { statusLabel } from "@/lib/domain";
import { useLocalUser } from "@/lib/use-local-user";

export default function Dashboard() {
  const nickname = useLocalUser();
  const used = Math.round(demoBudget.spentAmount / demoBudget.discretionaryBudget * 100);
  return <>
    <header className="mb-6 flex items-center justify-between">
      <div>
        <p className="text-sm text-[var(--muted)]">8 月 21 日 · 周五</p>
        <h1 className="mt-1 text-2xl font-bold">晚上好，{nickname} 🌿</h1>
      </div>
      <Link href="/app/notifications" className="grid size-11 place-items-center rounded-2xl bg-white shadow-sm">
        <Bell size={20}/>
      </Link>
    </header>
    <Card className="border-0 bg-[var(--forest)] p-6 text-white">
      <div className="flex justify-between">
        <div>
          <p className="text-sm opacity-75">本月剩余预算</p>
          <p className="mt-2 text-4xl font-bold">{formatMoney(demoBudget.remainingAmount)}</p>
        </div>
        <ShieldCheck className="opacity-60"/>
      </div>
      <div className="mt-6 h-2.5 rounded-full bg-white/20">
        <div className="h-full rounded-full bg-[#f0b276]" style={{ width: `${used}%` }}/>
      </div>
      <div className="mt-2 flex justify-between text-xs opacity-75">
        <span>已使用 {used}%</span>
        <span>总预算 {formatMoney(demoBudget.discretionaryBudget)}</span>
      </div>
    </Card>
    <Button asChild className="mt-4 h-16 w-full bg-[var(--orange)] text-base hover:bg-[#dc8245]">
      <Link href="/app/new"><Plus/>我想买东西</Link>
    </Button>
    <div className="mt-6 grid grid-cols-3 gap-3">
      <Card className="p-4"><p className="text-2xl font-bold">1</p><p className="mt-1 text-xs text-[var(--muted)]">等待审批</p></Card>
      <Card className="p-4"><p className="text-2xl font-bold">1</p><p className="mt-1 text-xs text-[var(--muted)]">冷静期</p></Card>
      <Card className="p-4"><p className="text-2xl font-bold text-[var(--forest)]">¥299</p><p className="mt-1 text-xs text-[var(--muted)]">本月守住</p></Card>
    </div>
    <section className="mt-7">
      <div className="mb-3 flex justify-between">
        <h2 className="text-lg font-bold">最近动态</h2>
        <Link href="/app/requests" className="text-sm text-[var(--forest)]">全部记录</Link>
      </div>
      <div className="space-y-3">
        {demoRequests.slice(0, 2).map(r =>
          <Link href={`/app/requests/${r.id}`} key={r.id}>
            <Card className="mb-3 flex items-center gap-4 p-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[var(--sage-soft)]">
                {r.status === "COOLING_OFF" ? <Clock3/> : <Sparkles/>}
              </span>
              <div className="min-w-0 flex-1">
                <b>{r.itemName}</b>
                <p className="truncate text-sm text-[var(--muted)]">{statusLabel[r.status]} · {r.createdAt}</p>
              </div>
              <b>{formatMoney(r.priceCents)}</b>
              <ChevronRight size={18} className="text-[var(--muted)]"/>
            </Card>
          </Link>
        )}
      </div>
    </section>
  </>;
}
