"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, ChevronDown, ChevronRight, Clock3, Flame, Heart, MessageCircle, Plus, Sparkles, WalletCards } from "lucide-react";
import { Card } from "@/components/ui/card";
import { demoBudget, demoRequests } from "@/lib/mock-data";
import { formatMoney } from "@/lib/utils";
import { getGreeting, moodLabel, statusLabel } from "@/lib/domain";
import { useLocalUser } from "@/lib/use-local-user";

// 闺蜜最近发布的想买（演示数据）
const friendPosts = [
  { id: "f1", emoji: "🎨", itemName: "水彩颜料套装", priceCents: 26800, user: "小满", mood: "HAPPY" as const, reason: "想学画水彩，已经看了一周了", createdAt: "1 小时前" },
  { id: "f2", emoji: "🍫", itemName: "手工巧克力礼盒", priceCents: 9900, user: "小满", mood: "REWARD_MYSELF" as const, reason: "这周辛苦了，想奖励自己一小口快乐", createdAt: "3 小时前" },
];

export default function Dashboard() {
  const nickname = useLocalUser();
  const [budgetOpen, setBudgetOpen] = useState(false);
  const used = Math.round(demoBudget.spentAmount / demoBudget.discretionaryBudget * 100);
  const waiting = demoRequests.find(request => request.status === "PENDING_APPROVAL");
  const cooling = demoRequests.find(request => request.status === "COOLING_OFF");
  return <>
    <header className="flex items-center justify-between">
      <div>
        <p className="text-sm text-[var(--muted)]">{getGreeting()}，{nickname} 🌿</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight">今天又被什么击中了？</h1>
      </div>
      <Link href="/app/notifications" aria-label="查看消息" className="grid size-11 place-items-center rounded-2xl border border-[var(--line)] bg-white shadow-sm">
        <Bell size={20}/>
      </Link>
    </header>

    {/* 主按钮：晒晒我想买的 */}
    <Link href="/app/new" className="mt-6 flex min-h-24 items-center justify-between overflow-hidden rounded-[28px] bg-[var(--forest)] px-5 text-white shadow-[0_14px_30px_rgba(79,117,89,.22)]">
      <div>
        <p className="text-sm text-white/75">不用想得很完整</p>
        <p className="mt-1 text-xl font-bold">晒晒我想买的</p>
      </div>
      <span className="grid size-14 place-items-center rounded-full bg-[var(--orange)]">
        <Plus size={28}/>
      </span>
    </Link>

    {/* 数据小卡 */}
    <div className="mt-4 grid grid-cols-2 gap-3">
      <Card className="border-0 bg-[var(--lemon-soft)] p-4">
        <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
          <Heart size={16}/>闺蜜连续在线
        </div>
        <p className="mt-2 text-2xl font-black">7 <small className="text-sm font-medium">天</small></p>
      </Card>
      <Card className="border-0 bg-[var(--blue-soft)] p-4">
        <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
          <Sparkles size={16}/>本月成功拔草
        </div>
        <p className="mt-2 text-2xl font-black text-[var(--forest)]">{formatMoney(29900)}</p>
      </Card>
    </div>

    {/* 等她一句话 */}
    {waiting && (
      <section className="mt-7">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold">等她一句话</h2>
          <span className="rounded-full bg-[var(--orange-soft)] px-3 py-1 text-xs text-[var(--orange-deep)]">1 条待回应</span>
        </div>
        <Link href={`/app/requests/${waiting.id}`}>
          <Card className="flex items-center gap-4 p-4">
            <span className="grid size-14 shrink-0 place-items-center rounded-[20px] bg-[var(--sage-soft)] text-2xl">🎧</span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <b>{waiting.itemName}</b>
                <span className="mood-chip">{waiting.mood ? moodLabel[waiting.mood] : "突然心动"}</span>
              </div>
              <p className="mt-1 truncate text-sm text-[var(--muted)]">{waiting.reason}</p>
              <p className="mt-2 text-xs font-semibold text-[var(--forest)]">{statusLabel[waiting.status]}</p>
            </div>
            <ChevronRight size={18} className="text-[var(--muted)]"/>
          </Card>
        </Link>
      </section>
    )}

    {/* 闺蜜最近想买 */}
    <section className="mt-7">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-bold">闺蜜最近想买</h2>
        <Link href="/app/review" className="text-sm text-[var(--forest)]">帮她参谋</Link>
      </div>
      <div className="-mx-5 flex gap-3 overflow-x-auto px-5 pb-2">
        {friendPosts.map(post => (
          <Link key={post.id} href="/app/review" className="block w-44 shrink-0">
            <Card className="overflow-hidden p-0">
              <div className="grid h-24 place-items-center bg-[var(--sage-soft)] text-4xl">{post.emoji}</div>
              <div className="p-3">
                <div className="flex items-center justify-between">
                  <b className="truncate text-sm">{post.itemName}</b>
                  <b className="text-sm">{formatMoney(post.priceCents)}</b>
                </div>
                <span className="mood-chip mt-1">{moodLabel[post.mood]}</span>
                <p className="mt-1 truncate text-xs text-[var(--muted)]">{post.reason}</p>
                <p className="mt-2 text-xs text-[var(--muted)]">{post.user} · {post.createdAt}</p>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </section>

    {/* 冷静盒 */}
    {cooling && (
      <section className="mt-7">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold">冷静盒</h2>
          <Link href="/app/requests" className="text-sm text-[var(--forest)]">看看全部</Link>
        </div>
        <Link href={`/app/requests/${cooling.id}`}>
          <Card className="border-0 bg-[var(--orange-soft)] p-5">
            <div className="flex items-start gap-3">
              <Clock3 className="mt-0.5 text-[var(--orange)]"/>
              <div className="flex-1">
                <div className="flex justify-between gap-3">
                  <b>{cooling.itemName}</b>
                  <b>{formatMoney(cooling.priceCents)}</b>
                </div>
                <p className="mt-1 text-sm text-[var(--muted)]">再睡一晚，明天看看还心动不心动。</p>
                <div className="mt-4 h-2 rounded-full bg-white/80">
                  <div className="h-full w-2/3 rounded-full bg-[var(--orange)]"/>
                </div>
                <p className="mt-2 text-xs text-[var(--muted)]">还剩 18 小时 24 分</p>
              </div>
            </div>
          </Card>
        </Link>
      </section>
    )}

    {/* 闺蜜刚刚说 */}
    <section className="mt-7">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-bold">闺蜜刚刚说</h2>
        <Link href="/app/notifications" className="text-sm text-[var(--forest)]">全部消息</Link>
      </div>
      <Card className="flex gap-3 p-4">
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[var(--blue-soft)]">👭</span>
        <div>
          <p className="text-sm leading-6"><b>小满</b> 对你的降噪耳机说：&ldquo;不拦你，但答应我多想一天。&rdquo;</p>
          <div className="mt-2 flex items-center gap-1 text-xs text-[var(--muted)]">
            <MessageCircle size={13}/>12 分钟前
          </div>
        </div>
      </Card>
    </section>

    {/* 可折叠预算卡 */}
    <section className="mt-7">
      <button type="button" onClick={() => setBudgetOpen(value => !value)} aria-expanded={budgetOpen} className="flex min-h-12 w-full items-center justify-between text-left">
        <span className="flex items-center gap-2 font-bold"><WalletCards size={18}/>这个月的购物小口袋</span>
        <ChevronDown size={18} className={`transition ${budgetOpen ? "rotate-180" : ""}`}/>
      </button>
      <Card className="mt-2 p-5">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm text-[var(--muted)]">还可以自由安排</p>
            <p className="mt-1 text-3xl font-black">{formatMoney(demoBudget.remainingAmount)}</p>
          </div>
          <span className="text-sm text-[var(--muted)]">用了 {used}%</span>
        </div>
        <div className="mt-4 h-2.5 rounded-full bg-[var(--sage-soft)]">
          <div className="h-full rounded-full bg-[var(--forest)]" style={{width:`${used}%`}}/>
        </div>
        {budgetOpen && (
          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-[var(--line)] pt-4 text-sm">
            <div>
              <p className="text-[var(--muted)]">本月购物预算</p>
              <b>{formatMoney(demoBudget.discretionaryBudget)}</b>
            </div>
            <div>
              <p className="text-[var(--muted)]">已经花掉</p>
              <b>{formatMoney(demoBudget.spentAmount)}</b>
            </div>
            <Link href="/app/budget" className="col-span-2 mt-1 flex min-h-11 items-center justify-center rounded-2xl bg-[var(--sage-soft)] font-semibold text-[var(--forest)]">
              调整我的预算提醒
            </Link>
          </div>
        )}
      </Card>
    </section>

    {/* 逛逛入口 */}
    <Link href="/app/explore" className="mt-7 flex min-h-14 items-center justify-between rounded-[24px] border border-dashed border-[var(--sage)] bg-white/60 px-4">
      <span className="flex items-center gap-2 font-semibold"><Flame size={18} className="text-[var(--orange)]"/>去看看大家都在纠结什么</span>
      <ChevronRight size={18}/>
    </Link>
  </>;
}
