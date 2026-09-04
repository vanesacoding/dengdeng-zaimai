"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useRequests } from "@/lib/use-requests";
import { formatMoney } from "@/lib/utils";
import { statusLabel } from "@/lib/domain";

export default function Requests() {
  const { requests, ready } = useRequests();
  return <>
    <header><p className="text-[11px] text-[var(--muted)]">我的</p><h1 className="mt-0.5 font-black">审批记录</h1></header>
    {!ready ? <p className="py-12 text-center text-xs text-[var(--muted)]">加载中…</p> : requests.length === 0 ? <p className="py-12 text-center text-xs text-[var(--muted)]">还没有记录</p> : <div className="mt-4 overflow-hidden rounded-2xl border border-[var(--line)] bg-white">{requests.map((request, index) => <Link key={request.id} href={`/app/requests/${request.id}`} className={`flex min-h-16 items-center gap-3 px-4 ${index ? "border-t border-[var(--line)]" : ""}`}><div className="min-w-0 flex-1"><b className="block truncate text-[13px]">{request.itemName}</b><span className="text-[11px] text-[var(--muted)]">{request.createdAt} · {statusLabel[request.status]}</span></div><b className="text-[13px]">{formatMoney(request.priceCents)}</b><ChevronRight size={15} className="text-[var(--muted)]"/></Link>)}</div>}
  </>;
}
