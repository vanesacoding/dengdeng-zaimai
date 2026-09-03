"use client";

import { useState } from "react";
import { Check, Eye, Lock, Globe } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { formatMoney } from "@/lib/utils";
import { resultTypes, resultLabel, type ResultType } from "@/lib/domain";

const resultEmojis: Record<ResultType, string> = {
  PURCHASED_LOVED: "🥰",
  PURCHASED_REGRETTED: "😅",
  STILL_THINKING: "🤔",
  GIVEN_UP: "🌿",
  BOUGHT_ALTERNATIVE: "🔄",
  POSTPONED: "📋",
};

type Visibility = "private" | "friends" | "public";
const visibilityOptions: { value: Visibility; label: string; icon: typeof Lock }[] = [
  { value: "private", label: "仅自己", icon: Lock },
  { value: "friends", label: "同步给闺蜜", icon: Eye },
  { value: "public", label: "发到广场", icon: Globe },
];

export function ResultDiary({ priceCents, remainingCents }: { priceCents: number; remainingCents: number }) {
  const [selected, setSelected] = useState<ResultType | null>(null);
  const [note, setNote] = useState("");
  const [actualPrice, setActualPrice] = useState("");
  const [visibility, setVisibility] = useState<Visibility>("friends");
  const [submitted, setSubmitted] = useState(false);
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [followUpNote, setFollowUpNote] = useState("");

  if (submitted) {
    return (
      <Card className="border-0 bg-[var(--sage-soft)] p-6 text-center">
        <span className="text-5xl">{selected ? resultEmojis[selected] : "✨"}</span>
        <h3 className="mt-3 text-xl font-bold">
          {selected ? resultLabel[selected] : "已记录"}
        </h3>
        <p className="mt-2 text-sm text-[var(--muted)]">
          {visibility === "public" && "结果已发到广场，让大家看到你的消费故事"}
          {visibility === "friends" && "结果已同步给帮你参谋的闺蜜"}
          {visibility === "private" && "结果只给自己看，好好收藏这段消费回忆"}
        </p>

        {/* Follow-up review */}
        <button
          type="button"
          onClick={() => setShowFollowUp(!showFollowUp)}
          className="mt-4 text-sm font-semibold text-[var(--forest)]"
        >
          {showFollowUp ? "收起追加评价" : "使用一段时间后，补充评价？"}
        </button>
        {showFollowUp && (
          <div className="mt-3 text-left">
            <Textarea
              value={followUpNote}
              onChange={e => setFollowUpNote(e.target.value)}
              placeholder="用了一段时间后，感觉怎么样……"
              rows={3}
            />
            <Button
              variant="outline"
              className="mt-2 w-full"
              disabled={!followUpNote.trim()}
              onClick={() => { setFollowUpNote(""); setShowFollowUp(false); }}
            >
              保存追加评价
            </Button>
          </div>
        )}

        <Button variant="ghost" className="mt-4 w-full" onClick={() => {
          setSubmitted(false);
          setSelected(null);
          setNote("");
          setActualPrice("");
          setShowFollowUp(false);
        }}>
          重新记录
        </Button>
      </Card>
    );
  }

  return (
    <Card className="p-5">
      <h2 className="text-lg font-bold">后来怎么样了？</h2>
      <p className="mt-1 text-sm text-[var(--muted)]">记录一下这次小小的消费故事</p>

      {/* Result type grid */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        {resultTypes.map(type => (
          <button
            type="button"
            key={type}
            onClick={() => setSelected(type)}
            className={`flex min-h-20 flex-col items-center justify-center gap-1 rounded-2xl border-2 p-2 text-center transition ${
              selected === type
                ? "border-[var(--forest)] bg-[var(--sage-soft)]"
                : "border-[var(--line)] bg-white"
            }`}
          >
            <span className="text-2xl">{resultEmojis[type]}</span>
            <span className="text-xs font-semibold">{resultLabel[type]}</span>
          </button>
        ))}
      </div>

      {selected && (
        <>
          {/* Actual price */}
          {(selected === "PURCHASED_LOVED" || selected === "PURCHASED_REGRETTED" || selected === "BOUGHT_ALTERNATIVE") && (
            <div className="mt-4">
              <label className="text-sm font-semibold">实际花了多少钱？</label>
              <div className="mt-2 flex items-center gap-2">
                <Input
                  type="number"
                  inputMode="numeric"
                  value={actualPrice}
                  onChange={e => setActualPrice(e.target.value)}
                  placeholder={String(priceCents / 100)}
                />
                <span className="shrink-0 text-sm text-[var(--muted)]">元</span>
              </div>
              {actualPrice && Number(actualPrice) > 0 && (
                <p className="mt-2 text-xs text-[var(--muted)]">
                  预算还剩约 {formatMoney(remainingCents - Math.round(Number(actualPrice) * 100))}
                </p>
              )}
            </div>
          )}

          {/* Note */}
          <div className="mt-4">
            <label className="text-sm font-semibold">一句话短评</label>
            <Textarea
              className="mt-2"
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="想说什么就说什么……"
              rows={3}
            />
          </div>

          {/* Visibility */}
          <div className="mt-4">
            <label className="text-sm font-semibold">谁可以看到这条结果？</label>
            <div className="mt-2 flex gap-2">
              {visibilityOptions.map(opt => {
                const Icon = opt.icon;
                return (
                  <button
                    type="button"
                    key={opt.value}
                    onClick={() => setVisibility(opt.value)}
                    className={`flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-xl border-2 px-2 text-xs font-semibold transition ${
                      visibility === opt.value
                        ? "border-[var(--forest)] bg-[var(--sage-soft)] text-[var(--forest)]"
                        : "border-[var(--line)] text-[var(--muted)]"
                    }`}
                  >
                    <Icon size={14}/>{opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit */}
          <Button
            className="mt-5 min-h-14 w-full"
            onClick={() => setSubmitted(true)}
          >
            <Check size={18}/>记录下来
          </Button>
        </>
      )}
    </Card>
  );
}
