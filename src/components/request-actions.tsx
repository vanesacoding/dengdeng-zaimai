"use client";

import { useState } from "react";
import { Check, ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatMoney, yuanToCents } from "@/lib/utils";

type Result = "PURCHASED" | "GIVEN_UP";

export function RequestActions({ priceCents }: { priceCents: number }) {
  const [result, setResult] = useState<Result | null>(null);
  const [actualYuan, setActualYuan] = useState("");

  if (result === "PURCHASED") {
    const actual = actualYuan ? yuanToCents(Number(actualYuan)) : priceCents;
    const saved = priceCents - actual;
    return (
      <Card className="mt-5 border-0 bg-[var(--sage-soft)]">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-full bg-[var(--forest)] text-white">
            <Check size={20}/>
          </span>
          <div>
            <b>已记录购买</b>
            <p className="text-sm text-[var(--muted)]">
              实际花费 {formatMoney(actual)}
              {saved > 0 && ` · 比预算省了 ${formatMoney(saved)}`}
            </p>
          </div>
        </div>
        <div className="mt-4">
          <label className="mb-2 block text-sm font-semibold">实际花费（选填）</label>
          <Input
            type="number"
            inputMode="decimal"
            placeholder={formatMoney(priceCents)}
            value={actualYuan}
            onChange={e => setActualYuan(e.target.value)}
          />
        </div>
        <Button variant="ghost" className="mt-3 w-full" onClick={() => setResult(null)}>
          重新选择
        </Button>
      </Card>
    );
  }

  if (result === "GIVEN_UP") {
    return (
      <Card className="mt-5 border-0 bg-[var(--sage-soft)]">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-full bg-[var(--forest)] text-white">
            <Check size={20}/>
          </span>
          <div>
            <b>已记录：决定不买</b>
            <p className="text-sm text-[var(--muted)]">守住了 {formatMoney(priceCents)}，给自己点个赞。</p>
          </div>
        </div>
        <Button variant="ghost" className="mt-3 w-full" onClick={() => setResult(null)}>
          重新选择
        </Button>
      </Card>
    );
  }

  return (
    <div className="mt-5 flex gap-3">
      <Button variant="outline" className="flex-1" onClick={() => setResult("GIVEN_UP")}>
        <X/> 决定不买
      </Button>
      <Button className="flex-1" onClick={() => setResult("PURCHASED")}>
        <ShieldCheck/> 记录结果
      </Button>
    </div>
  );
}
