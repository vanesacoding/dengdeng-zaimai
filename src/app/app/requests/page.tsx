"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, Trash2 } from "lucide-react";
import { useRequests } from "@/lib/use-requests";
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
  const { requests, remove, ready } = useRequests();
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const list = requests.filter(r => filters[active].match(r.status));

  if (!ready) {
    return (
      <>
        <h1 className="text-3xl font-bold">购买记录</h1>
        <p className="mt-2 text-[var(--muted)]">每一次认真考虑，都算数。</p>
        <div className="mt-12 text-center text-sm text-[var(--muted)]">加载中…</div>
      </>
    );
  }

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
            <Card key={r.id} className="mb-3 flex items-center p-4">
              <Link href={`/app/requests/${r.id}`} className="flex min-w-0 flex-1 items-center">
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
              </Link>

              {/* Delete action */}
              {confirmId === r.id ? (
                <div className="ml-3 flex shrink-0 items-center gap-2">
                  <button
                    onClick={() => remove(r.id)}
                    className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-100"
                  >
                    确认删除
                  </button>
                  <button
                    onClick={() => setConfirmId(null)}
                    className="text-xs text-[var(--muted)] hover:text-[var(--forest)]"
                  >
                    取消
                  </button>
                </div>
              ) : (
                <button
                  onClick={(e) => { e.stopPropagation(); setConfirmId(r.id); }}
                  className="ml-3 grid size-8 shrink-0 place-items-center rounded-full text-[var(--muted)] hover:bg-red-50 hover:text-red-500"
                  aria-label="删除"
                >
                  <Trash2 size={16}/>
                </button>
              )}
            </Card>
          ))
        )}
      </div>
    </>
  );
}
