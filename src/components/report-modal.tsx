"use client";

import { useState } from "react";
import { Ban, Flag, Shield, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";

type TargetType = "REQUEST" | "COMMENT" | "USER";

const reportReasons: Record<TargetType, string[]> = {
  REQUEST: ["内容不当", "虚假信息", "侵犯隐私", "广告引流", "其他"],
  COMMENT: ["言语不友善", "人身攻击", "广告引流", "垃圾信息", "其他"],
  USER: ["骚扰", "不当行为", "虚假身份", "其他"],
};

export function ReportModal({
  targetType,
  targetId: _targetId,
  targetName,
  onClose,
}: {
  targetType: TargetType;
  targetId: string;
  targetName?: string;
  onClose: () => void;
}) {
  void _targetId;
  const [reason, setReason] = useState("");
  const [detail, setDetail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const reasons = reportReasons[targetType];

  function handleSubmit() {
    if (!reason) return;
    // In production: insert into moderation_reports via Supabase
    setSubmitted(true);
  }

  function handleClose() {
    setReason("");
    setDetail("");
    setSubmitted(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30" onClick={handleClose}>
      <div
        className="w-full max-w-md rounded-t-[28px] bg-[var(--paper)] p-6 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {submitted ? (
          <div className="text-center">
            <span className="mx-auto grid size-14 place-items-center rounded-full bg-[var(--sage-soft)]">
              <Shield size={28} className="text-[var(--forest)]"/>
            </span>
            <h3 className="mt-3 text-lg font-bold">举报已提交</h3>
            <p className="mt-2 text-sm text-[var(--muted)]">
              我们会在 24 小时内审核处理。如果内容违规，我们会尽快移除。
            </p>
            <p className="mt-1 text-xs text-[var(--muted)]">
              在审核结果出来之前，你可以选择拉黑该用户，避免继续看到对方内容。
            </p>
            <div className="mt-4 space-y-2">
              <Button
                className="min-h-12 w-full"
                onClick={() => {
                  // In production: insert into user_blocks via Supabase
                  handleClose();
                }}
              >
                <Ban size={16}/>拉黑该用户
              </Button>
              <Button variant="ghost" className="w-full" onClick={handleClose}>
                知道了
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-lg font-bold">
                <Flag size={18} className="text-[var(--orange)]"/>举报
              </h3>
              <button type="button" onClick={handleClose} aria-label="关闭">
                <X size={20} className="text-[var(--muted)]"/>
              </button>
            </div>

            {targetName && (
              <p className="mt-2 text-sm text-[var(--muted)]">
                举报对象：{targetName}
              </p>
            )}

            <div className="mt-4">
              <p className="text-sm font-semibold">举报原因</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {reasons.map(r => (
                  <button
                    type="button"
                    key={r}
                    onClick={() => setReason(r)}
                    className={`min-h-11 rounded-full px-3 text-sm transition ${
                      reason === r
                        ? "bg-[var(--orange)] text-white"
                        : "bg-[var(--cream)] text-[var(--muted)]"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <p className="text-sm font-semibold">补充说明（选填）</p>
              <Textarea
                className="mt-2"
                value={detail}
                onChange={e => setDetail(e.target.value)}
                placeholder="描述一下具体情况……"
                rows={3}
              />
            </div>

            <Button
              className="mt-4 min-h-14 w-full"
              disabled={!reason}
              onClick={handleSubmit}
            >
              提交举报
            </Button>

            <p className="mt-3 text-center text-xs leading-5 text-[var(--muted)]">
              恶意举报可能导致你的举报功能被限制。请在了解情况后再提交。
            </p>
          </>
        )}
      </div>
    </div>
  );
}
