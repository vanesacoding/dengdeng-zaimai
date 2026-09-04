"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Send } from "lucide-react";
import { purchaseSchema } from "@/lib/domain";
import { calculateRisk } from "@/lib/risk";
import { demoBudget } from "@/lib/mock-data";
import { yuanToCents } from "@/lib/utils";
import { useRequests } from "@/lib/use-requests";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import type { z } from "zod";

type Form = z.input<typeof purchaseSchema>;

export default function NewRequest() {
  const router = useRouter();
  const { add } = useRequests();
  const { register, handleSubmit, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: { itemName: "", priceYuan: "" as unknown as number, reason: "", category: "其他", mood: "SEEDED_BY_OTHERS", visibility: "FRIENDS", productUrl: "", imageUrl: "", desiredHours: 0, coolingEnabled: true, coolingHours: 24, countInBudget: true, hasSimilarItem: false, limitedPromotion: false, plannedPurchase: false, necessity: false },
  });

  function submit(data: Form) {
    const priceCents = yuanToCents(Number(data.priceYuan));
    const risk = calculateRisk({ priceCents, remainingCents: demoBudget.remainingAmount, safeBalanceCents: demoBudget.safeBalance, hasSimilarItem: false, desiredHours: 0, limitedPromotion: false, plannedPurchase: false, necessity: false });
    add({ id: crypto.randomUUID(), itemName: data.itemName, priceCents, category: data.category, reason: data.reason, status: "PENDING_APPROVAL", riskScore: risk.score, createdAt: "刚刚", reviewer: "闺蜜", mood: data.mood, visibility: data.visibility });
    router.push("/app/requests/submitted");
  }

  return <>
    <header><p className="text-[11px] text-[var(--muted)]">发起审批</p><h1 className="mt-0.5 font-black">我想买这个</h1></header>
    <form onSubmit={handleSubmit(submit)} className="mt-5 space-y-4">
      <Field label="买什么？" error={errors.itemName?.message}><Input {...register("itemName")} placeholder="例如：降噪耳机"/></Field>
      <Field label="多少钱？" error={errors.priceYuan?.message}><div className="relative"><span className="absolute left-3 top-3 text-sm font-bold">¥</span><Input {...register("priceYuan")} className="pl-8" type="number" inputMode="decimal" placeholder="0.00"/></div></Field>
      <Field label="为什么想买？" error={errors.reason?.message}><Textarea {...register("reason")} rows={3} placeholder="一句话说清楚就好……"/></Field>
      <Field label="给谁看？"><div className="grid grid-cols-2 gap-2"><Choice value="FRIENDS" label="给闺蜜审批" register={register}/><Choice value="PUBLIC" label="发到法庭" register={register}/></div></Field>
      <Button type="submit" className="mt-2 w-full"><Send size={15}/>提交</Button>
      <p className="text-center text-[10px] text-[var(--muted)]">朋友和网友的意见都只是参考</p>
    </form>
  </>;
}

function Choice({ value, label, register }: { value: "FRIENDS" | "PUBLIC"; label: string; register: ReturnType<typeof useForm<Form>>["register"] }) {
  return <label><input type="radio" value={value} {...register("visibility")} className="peer sr-only"/><span className="flex min-h-11 items-center justify-center rounded-xl border border-[var(--line)] bg-white text-xs peer-checked:border-[var(--forest)] peer-checked:bg-[var(--sage-soft)] peer-checked:font-semibold peer-checked:text-[var(--forest)]">{label}</span></label>;
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1.5 block text-xs font-semibold">{label}</span>{children}{error && <span className="mt-1 block text-[11px] text-red-600">{error}</span>}</label>;
}
