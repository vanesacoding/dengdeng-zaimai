"use client";

import { useRef, useState } from "react";
import { Copy, Download, Share2, X } from "lucide-react";
import { toPng } from "html-to-image";
import { Button } from "@/components/ui/button";
import {
  formatCaseNumberDisplay,
  verdictEmoji,
  verdictLabel,
  type VerdictSummary,
} from "@/lib/domain";
import { formatMoney } from "@/lib/utils";
import type { ShoppingCase } from "@/lib/case-demo-data";

type Props = {
  caseData: ShoppingCase;
  summary: VerdictSummary;
  open: boolean;
  onClose: () => void;
};

export function VerdictShareCard({ caseData, summary, open, onClose }: Props) {
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  if (!open) return null;

  function handleCopy() {
    const text = `等等法庭 · ${formatCaseNumberDisplay(caseData.caseNumber)}\n\n商品：${formatMoney(caseData.priceCents)} ${caseData.itemName}\n\n陪审团判决：\n${verdictLabel[summary.majorityVerdict]}\n\n${summary.approvePct}% 建议批准\n${summary.coolingPct}% 建议冷静\n${summary.rejectPct}% 建议保护钱包\n\n本判决仅代表社区意见。最终决定权属于当事人。`;
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  async function handleSaveImage() {
    if (!cardRef.current) return;
    setSaving(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 2,
      });
      const link = document.createElement("a");
      link.download = `${caseData.caseNumber}-verdict.png`;
      link.href = dataUrl;
      link.click();
    } catch {
      // Fallback: silent fail, user can still copy text
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />

      {/* Sheet with scrollable content */}
      <div className="relative flex w-full max-w-[480px] flex-col rounded-t-3xl bg-[var(--paper)]">
        {/* Handle + header — sticky */}
        <div className="shrink-0 p-5 pb-0">
          <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-[var(--line)]" />

          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 grid size-9 place-items-center rounded-full bg-[var(--cream)] text-[var(--muted)]"
            aria-label="关闭"
          >
            <X size={18} />
          </button>

          <h2 className="flex items-center gap-2 text-lg font-bold">
            <Share2 size={18} className="text-[var(--forest)]" />
            分享判决书
          </h2>
          <p className="mt-1 text-xs text-[var(--muted)]">长截图分享卡 · 支持保存为图片</p>
        </div>

        {/* Scrollable card area */}
        <div className="max-h-[65dvh] overflow-y-auto p-5 pt-3">
          {/* Verdict card — this node is captured */}
          <div
            ref={cardRef}
            className="rounded-3xl border-2 border-[var(--line)] bg-gradient-to-b from-[var(--cream)] to-[var(--paper)] p-6"
          >
            {/* Brand */}
            <p className="text-center text-sm font-bold text-[var(--forest)]">⚖️ 等等法庭</p>
            <p className="mt-1 text-center text-xs text-[var(--muted)]">{formatCaseNumberDisplay(caseData.caseNumber)}</p>

            {/* Title */}
            <h3 className="mt-4 text-center text-base font-black leading-7 text-[var(--ink)]">
              {caseData.title}
            </h3>

            {/* Product */}
            <div className="mt-4 flex items-center justify-center gap-2 text-sm">
              <span className="text-2xl">{caseData.itemEmoji}</span>
              <span className="font-bold">{formatMoney(caseData.priceCents)}</span>
              <span className="text-[var(--muted)]">{caseData.itemName}</span>
            </div>

            {/* Verdict */}
            <div className="mt-5 rounded-2xl bg-white p-4 text-center">
              <p className="text-xs text-[var(--muted)]">陪审团判决</p>
              <p className="mt-2 text-lg font-black">
                <span className="mr-1">{verdictEmoji[summary.majorityVerdict]}</span>
                {verdictLabel[summary.majorityVerdict]}
              </p>
              <div className="mt-3 flex justify-center gap-4 text-xs">
                <span className="text-[var(--forest)]">{summary.approvePct}% 批准</span>
                <span className="text-[var(--orange)]">{summary.coolingPct}% 冷静</span>
                <span className="text-red-400">{summary.rejectPct}% 保护钱包</span>
              </div>
            </div>

            {/* Best testimony */}
            {caseData.bestTestimony && (
              <div className="mt-4 rounded-2xl bg-[var(--lemon-soft)] p-4 text-center">
                <p className="text-xs font-semibold text-[var(--orange-deep)]">本案最佳证词</p>
                <p className="mt-2 text-sm italic leading-6 text-[var(--ink)]">
                  &ldquo;{caseData.bestTestimony.content}&rdquo;
                </p>
                <p className="mt-2 text-xs text-[var(--muted)]">— {caseData.bestTestimony.author}</p>
              </div>
            )}

            {/* Disclaimer */}
            <p className="mt-5 text-center text-xs leading-5 text-[var(--muted)]">
              本判决仅代表社区意见。<br />最终决定权属于当事人。
            </p>

            {/* Demo label */}
            {caseData.isDemo && (
              <p className="mt-2 text-center text-xs text-[var(--sage)]">体验案件 · 演示数据</p>
            )}
          </div>
        </div>

        {/* Actions — sticky bottom */}
        <div className="shrink-0 border-t border-[var(--line)] p-5">
          <div className="flex gap-3">
            <Button variant="outline" className="min-h-12 flex-1" onClick={handleCopy}>
              <Copy size={16} />
              {copied ? "已复制" : "复制文案"}
            </Button>
            <Button className="min-h-12 flex-1" onClick={handleSaveImage} disabled={saving}>
              <Download size={16} />
              {saving ? "保存中…" : "保存为图片"}
            </Button>
          </div>
          <p className="mt-3 text-center text-xs text-[var(--muted)]">
            保存的图片为本地生成，不经过服务器
          </p>
        </div>
      </div>
    </div>
  );
}
