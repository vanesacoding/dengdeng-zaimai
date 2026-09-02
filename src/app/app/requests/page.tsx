"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { demoRequests } from "@/lib/mock-data";
import { formatMoney } from "@/lib/utils";
import { statusLabel, type RequestStatus } from "@/lib/domain";
import { Card } from "@/components/ui/card";

const filters = [
  { label: "全部", match: () => true },
  { label: "待审批", match: (s: RequestStatus) => s === "PENDING_APPROVAL" },
  { label: "冷静期", match: (s: RequestStatus) => s === "COOLING_OFF" },
  { label: "已完成", match: (s: RequestStatus) => s === "PURCHASED" || s === "GIVEN_UP" },
] as const;

export default function Requests() {
  const [active, setActive] = useState(0);
  const list = demoRequests.filter(r => filters[active].match(r.status));

  return (
    <>
      <h1 className="text-3xl font-bold">购买记录</h1>
      <p className="mt-2 text-[var(--muted)]">每一次认真考虑，都算数。</p>

      <div className="mt-6 flex gap-2 overflow-auto pb-2">
        {filters.map((f, i) => (
          <button
            key={f.label}
            onClick={() => setActive(i)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm transition ${
              i === active ? "bg-[var(--forest)] text-white" : "bg-white text-[var(--muted)] hover:bg-[var(--cream)]"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        {list.length === 0 ? (
          <p className="py-12 text-center text-sm text-[var(--muted)]">这里还没有记录</p>
        ) : (
          list.map(r => (
            <Link href={`/app/requests/${r.id}`} key={r.id}>
              <Card className="mb-3 flex items-center p-4">
                <div className="min-w-0 flex-1">
                  <div className="flex gap-2">
                    <b>{r.itemName}</b>
                    <span className="rounded-full bg-[var(--sage-soft)] px-2 py-0.5 text-xs text-[var(--forest)]">
                      {statusLabel[r.status]}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-[var(--muted)]">{r.createdAt} · {r.category}</p>
                </div>
                <b>{formatMoney(r.priceCents)}</b>
                <ChevronRight className="ml-2 text-[var(--muted)]" size={18}/>
              </Card>
            </Link>
          ))
        )}
      </div>
    </>
  );
}
