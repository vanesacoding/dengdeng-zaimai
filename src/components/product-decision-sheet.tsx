"use client";

import { useState } from "react";
import { Check, ShoppingBag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  purchaseIntentLabel,
  purchaseIntentOrder,
  type PurchaseIntent,
} from "@/lib/domain";

type Props = {
  open: boolean;
  onClose: () => void;
  itemName: string;
  onConfirm: (intent: PurchaseIntent) => void;
};

export function ProductDecisionSheet({ open, onClose, itemName, onConfirm }: Props) {
  const [step, setStep] = useState<0 | 1>(0);
  const [selected, setSelected] = useState<PurchaseIntent | undefined>();

  if (!open) return null;

  function handleClose() {
    setStep(0);
    setSelected(undefined);
    onClose();
  }

  function handleConfirm() {
    if (!selected) return;
    onConfirm(selected);
    setStep(0);
    setSelected(undefined);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div className="relative w-full max-w-[480px] animate-[slideUp_.2s_ease] rounded-t-3xl bg-[var(--paper)] p-5 pb-8">
        {/* Handle */}
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-[var(--line)]" />

        {/* Close */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-4 top-4 grid size-9 place-items-center rounded-full bg-[var(--cream)] text-[var(--muted)]"
          aria-label="关闭"
        >
          <X size={18} />
        </button>

        {step === 0 && (
          <div>
            <div className="flex items-center gap-2">
              <ShoppingBag size={20} className="text-[var(--forest)]" />
              <h2 className="text-xl font-black">想清楚了吗？</h2>
            </div>
            <p className="mt-2 text-sm text-[var(--muted)]">
              选一个最接近你现在的状态。没有标准答案，只是为了帮自己记住此刻的判断。
            </p>

            <div className="mt-5 space-y-2">
              {purchaseIntentOrder.map(intent => (
                <button
                  type="button"
                  key={intent}
                  onClick={() => setSelected(intent)}
                  className={`flex min-h-14 w-full items-center justify-between rounded-2xl border px-4 text-sm font-semibold transition ${
                    selected === intent
                      ? "border-[var(--forest)] bg-[var(--sage-soft)] text-[var(--forest)]"
                      : "border-[var(--line)] bg-white text-[var(--muted)]"
                  }`}
                >
                  <span>{purchaseIntentLabel[intent]}</span>
                  {selected === intent && <Check size={18} />}
                </button>
              ))}
            </div>

            <Button
              type="button"
              className="mt-5 min-h-14 w-full text-base"
              disabled={!selected}
              onClick={() => setStep(1)}
            >
              下一步
            </Button>
          </div>
        )}

        {step === 1 && selected && (
          <div>
            <p className="text-xs text-[var(--muted)]">确认决定</p>
            <h2 className="mt-1 text-2xl font-black">{purchaseIntentLabel[selected]}</h2>

            <div className="mt-4 flex items-center justify-between rounded-2xl bg-[var(--sage-soft)] p-4">
              <div>
                <p className="text-sm text-[var(--muted)]">{itemName}</p>
                <p className="mt-1 text-xs text-[var(--forest)]">
                  {selected === "PURCHASED"
                    ? "记住这次购买的心动和结果"
                    : selected === "READY_TO_BUY"
                      ? "想清楚了就去吧，记得记录后续感受"
                      : "保持这个状态，慢慢来"}
                </p>
              </div>
            </div>

            <div className="mt-5 flex gap-3">
              <Button
                type="button"
                variant="secondary"
                className="min-h-14 flex-1"
                onClick={() => setStep(0)}
              >
                返回修改
              </Button>
              <Button
                type="button"
                className="min-h-14 flex-1"
                onClick={handleConfirm}
              >
                <Check size={18} />
                确认
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
