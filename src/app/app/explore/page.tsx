"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ChevronRight, Loader2, Search, X } from "lucide-react";
import { channels, channelLabel, channelEmoji, type Channel } from "@/lib/domain";
import { demoCases, todayHotCases } from "@/lib/case-demo-data";
import { ShoppingCaseCard } from "@/components/shopping-case-card";
import { Input } from "@/components/ui/input";

export default function ExplorePage() {
  const [active, setActive] = useState<Channel>("HOT_CASES");
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  function handleSwitch(channel: Channel) {
    if (channel === active) return;
    setLoading(true);
    setActive(channel);
    setTimeout(() => setLoading(false), 300);
  }

  const filteredCases = useMemo(() => {
    let result = demoCases.filter(c => c.channel === active);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = demoCases.filter(c =>
        c.title.toLowerCase().includes(q) ||
        c.itemName.toLowerCase().includes(q) ||
        c.user.toLowerCase().includes(q) ||
        c.statement.toLowerCase().includes(q)
      );
    }
    return result;
  }, [active, searchQuery]);

  return (
    <>
      {/* Header */}
      <header>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-[var(--muted)]">今日购物欲，公开审理中</p>
            <h1 className="mt-1 text-3xl font-black">⚖️ 等等法庭</h1>
          </div>
          <span className="grid size-11 place-items-center rounded-2xl bg-[var(--lemon-soft)] text-2xl">⚖️</span>
        </div>
        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
          看看今天又有什么离谱但似曾相识的购物申请。本庭只负责提供视角，不替你花钱。
        </p>
      </header>

      {/* Search */}
      <div className="relative mt-5">
        <Search className="absolute left-4 top-3.5 text-[var(--muted)]" size={18} />
        <Input
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="搜案件、商品或当事人……"
          className="pl-11 pr-10"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-3 text-[var(--muted)]"
            aria-label="清除搜索"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Channel tabs */}
      <div className="-mx-5 mt-4 flex gap-2 overflow-x-auto px-5 pb-2">
        {channels.map(channel => (
          <button
            type="button"
            key={channel}
            onClick={() => handleSwitch(channel)}
            className={`flex min-h-11 shrink-0 items-center gap-1 rounded-full px-4 text-sm font-semibold transition ${
              active === channel ? "bg-[var(--forest)] text-white" : "bg-white text-[var(--muted)]"
            }`}
          >
            <span>{channelEmoji[channel]}</span>
            {channelLabel[channel]}
          </button>
        ))}
      </div>

      {/* Today's hot cases (only on HOT_CASES tab and no search) */}
      {active === "HOT_CASES" && !searchQuery && (
        <div className="mt-5">
          <p className="mb-3 text-xs font-bold text-[var(--muted)]">🔥 本庭今日热案</p>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {todayHotCases.map(hot => {
              const caseData = demoCases.find(c => c.caseId === hot.caseId);
              if (!caseData) return null;
              return (
                <Link
                  key={hot.caseId}
                  href={`/app/explore/${hot.caseId}`}
                  className="block w-64 shrink-0"
                >
                  <div className="rounded-2xl border-2 border-[var(--lemon)] bg-[var(--lemon-soft)] p-4">
                    <p className="text-xs font-semibold text-[var(--orange-deep)]">{hot.reason}</p>
                    <p className="mt-2 text-sm font-bold leading-6 text-[var(--ink)]">{hot.label}</p>
                    <p className="mt-2 text-xs text-[var(--muted)]">{caseData.caseNumber}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="mt-8 flex flex-col items-center gap-3 text-[var(--muted)]">
          <Loader2 size={28} className="animate-spin" />
          <p className="text-sm">正在开庭……</p>
        </div>
      )}

      {/* Case cards */}
      {!loading && (
        <div className="mt-4 space-y-4">
          {filteredCases.length === 0 && (
            <div className="mt-12 flex flex-col items-center gap-3 text-[var(--muted)]">
              <span className="text-4xl">🍃</span>
              <p className="text-sm">这个频道暂时没有案件</p>
              <p className="text-xs">去其他频道看看吧</p>
            </div>
          )}

          {filteredCases.map(caseData => (
            <ShoppingCaseCard
              key={caseData.caseId}
              caseData={caseData}
              detailLink={`/app/explore/${caseData.caseId}`}
              showReactions={false}
            />
          ))}
        </div>
      )}

      {/* Bottom CTA */}
      <Link
        href="/app/new"
        className="mt-6 flex min-h-14 items-center justify-between rounded-[24px] bg-[var(--forest)] px-5 text-white shadow-[0_10px_24px_rgba(79,117,89,.18)]"
      >
        <span className="flex items-center gap-2 font-semibold">📋 递交购物案</span>
        <ChevronRight size={18} />
      </Link>

      <p className="mt-4 text-center text-xs leading-5 text-[var(--muted)]">
        可以吐槽购物理由，不可以攻击当事人。最终决定权始终属于当事人。
      </p>
    </>
  );
}
