"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Clock3, MessageCircle, MoreHorizontal,
  Trash2
} from "lucide-react";
import { useRequests } from "@/lib/use-requests";
import { demoBudget } from "@/lib/mock-data";
import { formatMoney } from "@/lib/utils";
import { statusLabel } from "@/lib/domain";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RequestActions } from "@/components/request-actions";
import { ResultDiary } from "@/components/result-diary";
import { ReportModal } from "@/components/report-modal";

export function RequestDetail({ id }: { id: string }) {
  const router = useRouter();
  const { requests, remove, ready } = useRequests();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showResultDiary, setShowResultDiary] = useState(false);

  const r = requests.find(x => x.id === id);

  if (!ready) {
    return <p className="py-12 text-center text-sm text-[var(--muted)]">加载中…</p>;
  }

  if (!r) {
    return (
      <div className="flex min-h-[60dvh] flex-col items-center justify-center text-center">
        <p className="text-[var(--muted)]">记录不存在或已被删除</p>
        <Button asChild className="mt-6">
          <Link href="/app/requests">返回想买记录</Link>
        </Button>
      </div>
    );
  }

  function handleDelete() {
    if (!r) return;
    remove(r.id);
    router.push("/app/requests");
  }

  // Check if result diary should be shown (cooling off ended or user ready)
  const showResultPrompt =
    r.status === "READY_TO_BUY" ||
    r.status === "COOLING_OFF" ||
    r.status === "PURCHASED";

  return (
    <>
      <Link href="/app/requests" className="mb-5 inline-flex gap-2 text-sm text-[var(--muted)]">
        <ArrowLeft size={18}/>返回想买记录
      </Link>

      <div className="flex justify-between">
        <div>
          <span className="rounded-full bg-[var(--sage-soft)] px-3 py-1 text-xs text-[var(--forest)]">
            {statusLabel[r.status]}
          </span>
          <h1 className="mt-3 text-3xl font-bold">{r.itemName}</h1>
          <p className="mt-1 text-[var(--muted)]">{r.category} · {r.createdAt}</p>
        </div>
        <button
          type="button"
          aria-label="更多操作"
          onClick={() => setShowReport(true)}
          className="grid size-10 place-items-center rounded-xl text-[var(--muted)]"
        >
          <MoreHorizontal size={20}/>
        </button>
      </div>

      <div className="mt-1">
        <b className="text-2xl">{formatMoney(r.priceCents)}</b>
      </div>

      {r.status === "COOLING_OFF" && (
        <Card className="mt-6 border-0 bg-[var(--orange-soft)]">
          <div className="flex gap-3">
            <Clock3 className="text-[var(--orange)]"/>
            <div>
              <b>还剩 18 小时 24 分</b>
              <p className="mt-1 text-sm text-[var(--muted)]">明天 15:30 后，再问问自己是否还需要。</p>
            </div>
          </div>
        </Card>
      )}

      <Card className="mt-6">
        <h2 className="font-bold">为什么想买</h2>
        <p className="mt-3 leading-7 text-[var(--muted)]">{r.reason}</p>
      </Card>

      <Card className="mt-4">
        <div className="flex justify-between">
          <h2 className="font-bold">上头小提示</h2>
          <span className="font-bold text-[var(--orange-deep)]">仅供参考</span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-[var(--muted)]">当前剩余</p>
            <b>{formatMoney(demoBudget.remainingAmount)}</b>
          </div>
          <div>
            <p className="text-[var(--muted)]">购买后</p>
            <b>{formatMoney(demoBudget.remainingAmount - r.priceCents)}</b>
          </div>
        </div>
      </Card>

      <Card className="mt-4">
        <h2 className="flex items-center gap-2 font-bold">
          <MessageCircle size={18}/>闺蜜的想法
        </h2>
        <p className="mt-3 rounded-2xl bg-[var(--cream)] p-4 text-sm leading-6">
          预算够，但建议等两天再决定。你已经有一副耳机，可以想想降噪功能会不会经常用到。
        </p>
      </Card>

      {/* Result diary prompt */}
      {showResultPrompt && !showResultDiary && (
        <Card className="mt-4 border-2 border-[var(--forest)] bg-[var(--sage-soft)] p-5 text-center">
          <span className="text-4xl">📝</span>
          <h3 className="mt-2 font-bold">后来怎么样了？</h3>
          <p className="mt-1 text-sm text-[var(--muted)]">记录一下这次的结果，给自己留个回忆</p>
          <Button
            className="mt-4 min-h-12 w-full"
            onClick={() => setShowResultDiary(true)}
          >
            写结果日记
          </Button>
        </Card>
      )}

      {/* Result diary component */}
      {showResultDiary && (
        <div className="mt-4">
          <ResultDiary
            priceCents={r.priceCents}
            remainingCents={demoBudget.remainingAmount}
          />
        </div>
      )}

      <RequestActions priceCents={r.priceCents}/>

      {/* Delete section */}
      <div className="mt-6 border-t border-[var(--line)] pt-6">
        {showDeleteConfirm ? (
          <div className="rounded-2xl bg-red-50 p-4">
            <p className="text-sm font-semibold text-red-700">确定要删除这条记录吗？</p>
            <p className="mt-1 text-xs text-red-600">删除后无法恢复</p>
            <div className="mt-3 flex gap-3">
              <Button variant="danger" className="flex-1" onClick={handleDelete}>
                <Trash2 size={16}/> 确认删除
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => setShowDeleteConfirm(false)}>
                取消
              </Button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-red-500 hover:bg-red-50"
          >
            <Trash2 size={16}/> 删除此记录
          </button>
        )}
      </div>

      {/* Report modal */}
      {showReport && (
        <ReportModal
          targetType="REQUEST"
          targetId={r.id}
          onClose={() => setShowReport(false)}
        />
      )}
    </>
  );
}
