"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight, MessageCircle, ThumbsDown, ThumbsUp, Timer } from "lucide-react";
import { demoCases } from "@/lib/case-demo-data";
import { formatMoney } from "@/lib/utils";

const tabs = [{ key: "hot", label: "热门" }, { key: "new", label: "最新" }] as const;

export default function ExplorePage() {
  const [active, setActive] = useState<(typeof tabs)[number]["key"]>("hot");
  const cases = useMemo(() => active === "hot" ? demoCases.slice(0, 5) : [...demoCases].reverse().slice(0, 5), [active]);

  return <>
    <header className="flex items-end justify-between gap-3">
      <div><p className="text-[11px] text-[var(--muted)]">大家今天又想买什么</p><h1 className="mt-0.5 font-black">等等法庭</h1></div>
      <Link href="/app/new" className="rounded-full bg-[var(--forest)] px-3 py-2 text-xs font-semibold text-white">+ 发起评审</Link>
    </header>
    <div className="mt-4 flex gap-5 border-b border-[var(--line)]">
      {tabs.map(tab => <button type="button" key={tab.key} onClick={() => setActive(tab.key)} className={`border-b-2 pb-2 text-[13px] font-semibold ${active === tab.key ? "border-[var(--forest)] text-[var(--forest)]" : "border-transparent text-[var(--muted)]"}`}>{tab.label}</button>)}
    </div>
    <div className="mt-3 space-y-3">
      {cases.map(caseData => {
        return <article key={caseData.caseId} className="rounded-2xl border border-[var(--line)] bg-white p-3.5 shadow-[0_3px_12px_rgba(28,50,36,.04)]">
          <div className="flex items-center gap-2 text-[11px] text-[var(--muted)]"><span className="grid size-6 place-items-center rounded-full bg-[var(--sage-soft)]">{caseData.userEmoji}</span><b className="text-[var(--ink)]">{caseData.isAnonymous ? "匿名" : caseData.user}</b><span>· {caseData.createdAt}</span></div>
          <Link href={`/app/explore/${caseData.caseId}`} className="mt-2.5 flex gap-3">
            <div className="min-w-0 flex-1"><h2 className="line-clamp-2 font-bold text-[14px] leading-5">{caseData.title.replaceAll("《", "").replaceAll("》", "")}</h2><p className="mt-1 line-clamp-2 text-[12px] leading-[18px] text-[var(--muted)]">{caseData.statement}</p><p className="mt-2 text-[13px] font-bold text-[var(--forest)]">{caseData.itemName} · {formatMoney(caseData.priceCents)}</p></div>
            <div className={`grid size-[68px] shrink-0 place-items-center rounded-xl ${caseData.tint} text-3xl`}>{caseData.itemEmoji}</div>
          </Link>
          <div className="mt-3 flex items-center gap-1.5">
            <VoteCount icon={<ThumbsUp size={12}/>} label="可以买" count={caseData.voteCounts.WORTH_IT}/>
            <VoteCount icon={<Timer size={12}/>} label="等等" count={caseData.voteCounts.WAIT}/>
            <VoteCount icon={<ThumbsDown size={12}/>} label="别买" count={caseData.voteCounts.RUN_AWAY}/>
            <Link href={`/app/explore/${caseData.caseId}#comments`} className="ml-auto flex min-h-8 items-center gap-1 px-1 text-[11px] text-[var(--muted)]"><MessageCircle size={14}/> {caseData.commentCount}</Link>
            <Link href={`/app/explore/${caseData.caseId}`} aria-label="查看详情" className="grid size-8 place-items-center text-[var(--muted)]"><ChevronRight size={15}/></Link>
          </div>
        </article>;
      })}
    </div>
    <p className="mt-4 text-center text-[11px] leading-4 text-[var(--muted)]">可以吐槽理由，不攻击本人。最终决定权属于当事人。</p>
  </>;
}

function VoteCount({ icon, label, count }: { icon: React.ReactNode; label: string; count: number }) {
  return <span className="flex min-h-8 items-center gap-1 rounded-full bg-[var(--cream)] px-2 text-[10px] text-[var(--muted)]">{icon}<span>{label}</span><b className="text-[var(--ink)]">{count}</b></span>;
}
