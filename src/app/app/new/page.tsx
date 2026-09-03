"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, ArrowRight, ChevronDown, ImagePlus, Link2, Send, Sparkles } from "lucide-react";
import { friendlyRiskLabel, moodLabel, moods, purchaseSchema, visibilityLabel, visibilities } from "@/lib/domain";
import { calculateRisk } from "@/lib/risk";
import { demoBudget } from "@/lib/mock-data";
import { formatMoney, yuanToCents } from "@/lib/utils";
import { useRequests } from "@/lib/use-requests";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";

type Form = z.input<typeof purchaseSchema>;

function generateRequestId(): string {
  return (crypto as Crypto).randomUUID?.() ?? `local-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function NewRequest() {
  const [step, setStep] = useState(0);
  const [moreOpen, setMoreOpen] = useState(false);
  const router = useRouter();
  const { add } = useRequests();
  const { register, control, handleSubmit, trigger, formState:{ errors } } = useForm<Form>({
    resolver:zodResolver(purchaseSchema),
    defaultValues:{ category:"服饰", reason:"", itemName:"", priceYuan:"" as unknown as number, productUrl:"", imageUrl:"", mood:"SEEDED_BY_OTHERS", visibility:"FRIENDS", desiredHours:0, coolingEnabled:true, coolingHours:24, countInBudget:true, hasSimilarItem:false, limitedPromotion:false, plannedPurchase:false, necessity:false }
  });
  const value = useWatch({ control });
  const priceCents = yuanToCents(Number(value.priceYuan) || 0);
  const risk = useMemo(() => calculateRisk({ priceCents, remainingCents:demoBudget.remainingAmount, safeBalanceCents:demoBudget.safeBalance, hasSimilarItem:!!value.hasSimilarItem, desiredHours:Number(value.desiredHours)||0, limitedPromotion:!!value.limitedPromotion, plannedPurchase:!!value.plannedPurchase, necessity:!!value.necessity }), [priceCents,value.hasSimilarItem,value.desiredHours,value.limitedPromotion,value.plannedPurchase,value.necessity]);

  async function continueToCheck() {
    if (await trigger(["itemName","priceYuan","reason","productUrl","imageUrl"])) setStep(1);
  }

  function submit(data: Form) {
    const id = generateRequestId();
    add({ id, itemName:data.itemName, priceCents:yuanToCents(Number(data.priceYuan)), category:data.category, reason:data.reason, status:"PENDING_APPROVAL", riskScore:risk.score, createdAt:"刚刚", reviewer:"闺蜜", mood:data.mood, visibility:data.visibility, productUrl:data.productUrl || undefined, imageUrl:data.imageUrl || undefined });
    router.push("/app/requests/submitted");
  }

  return <>
    <header className="flex items-center gap-3"><Button variant="ghost" size="icon" aria-label="返回" onClick={()=>step ? setStep(0) : router.back()}><ArrowLeft/></Button><div><p className="text-xs text-[var(--muted)]">{step === 0 ? "先记下这次心动" : "喊谁来参谋？"}</p><h1 className="text-2xl font-black">{step === 0 ? "我想买这个" : "发出去前看一眼"}</h1></div></header>
    <div className="mt-5 flex gap-2"><span className="h-1.5 flex-1 rounded-full bg-[var(--forest)]"/><span className={`h-1.5 flex-1 rounded-full ${step===1?"bg-[var(--forest)]":"bg-[var(--line)]"}`}/></div>
    <form onSubmit={handleSubmit(submit)} className="mt-7">
      {step === 0 && <div className="space-y-5">
        <div className="grid grid-cols-2 gap-3"><Field label="商品图片链接" error={errors.imageUrl?.message}><div className="relative"><ImagePlus className="absolute left-4 top-3.5 text-[var(--muted)]" size={18}/><Input {...register("imageUrl")} className="pl-11" placeholder="粘贴图片地址"/></div></Field><Field label="商品页面链接" error={errors.productUrl?.message}><div className="relative"><Link2 className="absolute left-4 top-3.5 text-[var(--muted)]" size={18}/><Input {...register("productUrl")} className="pl-11" placeholder="粘贴商品链接"/></div></Field></div>
        <p className="-mt-3 text-xs text-[var(--muted)]">商品图或商品链接，填一个就可以。</p>
        <Field label="它叫什么？" error={errors.itemName?.message}><Input {...register("itemName")} placeholder="例如：奶油白口袋相机"/></Field>
        <Field label="多少钱？" error={errors.priceYuan?.message}><div className="relative"><span className="absolute left-4 top-3 text-lg font-bold">¥</span><Input {...register("priceYuan")} className="pl-9 text-lg font-bold" type="number" inputMode="decimal" placeholder="0.00"/></div></Field>
        <Field label="为什么突然想买？" hint="一句话就好，不用分析得很完整。" error={errors.reason?.message}><Textarea {...register("reason")} placeholder="看到它的时候，我觉得……"/></Field>
        <Field label="此刻更像哪种心情？"><div className="grid grid-cols-2 gap-2">{moods.map(mood=><label key={mood} className="cursor-pointer"><input type="radio" value={mood} {...register("mood")} className="peer sr-only"/><span className="flex min-h-12 items-center rounded-2xl border border-[var(--line)] bg-white px-3 text-sm peer-checked:border-[var(--forest)] peer-checked:bg-[var(--sage-soft)] peer-checked:font-semibold peer-checked:text-[var(--forest)]">{moodLabel[mood]}</span></label>)}</div></Field>
        <button type="button" onClick={()=>setMoreOpen(open=>!open)} aria-expanded={moreOpen} className="flex min-h-12 w-full items-center justify-between rounded-2xl border border-dashed border-[var(--sage)] px-4 text-sm font-semibold"><span>再补充一点（选填）</span><ChevronDown size={18} className={`transition ${moreOpen?"rotate-180":""}`}/></button>
        {moreOpen && <Card className="space-y-4 bg-white"><Field label="分类"><select {...register("category")} className="min-h-12 w-full rounded-2xl border border-[var(--line)] bg-white px-4"><option>服饰</option><option>数码</option><option>美妆</option><option>家居</option><option>兴趣</option><option>生活必需</option><option>其他</option></select></Field><Field label="已经想了多久（小时）"><Input {...register("desiredHours")} type="number" inputMode="numeric"/></Field>{[["hasSimilarItem","家里已经有类似的"],["limitedPromotion","主要是被限时优惠击中"],["plannedPurchase","这是原本计划好的"],["necessity","这是生活里的实际需要"]].map(([name,label])=><label key={name} className="flex min-h-12 items-center gap-3 rounded-2xl bg-[var(--cream)] px-4"><input {...register(name as keyof Form)} type="checkbox" className="size-5 accent-[var(--forest)]"/><span className="text-sm">{label}</span></label>)}</Card>}
        <Button type="button" className="min-h-14 w-full text-base" onClick={continueToCheck}>下一步，喊人来看看<ArrowRight/></Button>
      </div>}
      {step === 1 && <div className="space-y-5">
        <Card className="border-0 bg-[var(--sage-soft)] p-5"><div className="flex items-start justify-between gap-4"><div><span className="mood-chip">{value.mood ? moodLabel[value.mood] : "突然心动"}</span><h2 className="mt-3 text-xl font-black">{String(value.itemName || "还没起名字")}</h2><p className="mt-1 text-sm text-[var(--muted)]">{String(value.reason || "还没写心动理由")}</p></div><b className="text-xl">{formatMoney(priceCents)}</b></div></Card>
        <Card><div className="flex items-center gap-2"><Sparkles size={18} className="text-[var(--orange)]"/><h2 className="font-bold">上头小提示</h2></div><p className="mt-3 text-xl font-black">{friendlyRiskLabel(risk.score)}</p><div className="mt-4 grid grid-cols-2 gap-3 text-sm"><div className="rounded-2xl bg-[var(--cream)] p-3"><p className="text-[var(--muted)]">买完还剩</p><b>{formatMoney(demoBudget.remainingAmount-priceCents)}</b></div><div className="rounded-2xl bg-[var(--cream)] p-3"><p className="text-[var(--muted)]">占剩余预算</p><b>{Math.round(risk.ratio*100)}%</b></div></div><details className="mt-4 text-sm text-[var(--muted)]"><summary className="cursor-pointer py-2">为什么这样提示？</summary><ul className="mt-2 space-y-1">{risk.reasons.length ? risk.reasons.map(reason=><li key={reason}>• {reason}</li>) : <li>暂时没有明显的上头信号。</li>}<li>• 详细参考分：{risk.score}/100</li></ul></details><p className="mt-3 rounded-2xl bg-[var(--lemon-soft)] p-3 text-sm">这些只是提示，决定权一直在你。</p></Card>
        <Field label="给谁看？"><div className="space-y-2">{visibilities.map(visibility=><label key={visibility} className="flex min-h-14 items-center gap-3 rounded-2xl border border-[var(--line)] bg-white px-4"><input type="radio" value={visibility} {...register("visibility")} className="size-5 accent-[var(--forest)]"/><span><b className="block text-sm">{visibilityLabel[visibility]}</b><small className="text-[var(--muted)]">{visibility === "FRIENDS" ? "让闺蜜第一时间来参谋" : visibility === "PUBLIC" ? "公开区暂为体验入口" : "先留给自己慢慢想"}</small></span></label>)}</div></Field>
        <div className="grid grid-cols-2 gap-3"><Field label="放进冷静盒"><label className="flex min-h-12 items-center gap-3 rounded-2xl bg-white px-4"><input {...register("coolingEnabled")} type="checkbox" className="size-5 accent-[var(--forest)]"/><span className="text-sm">需要</span></label></Field><Field label="冷静多久"><Input {...register("coolingHours")} type="number" inputMode="numeric"/></Field></div>
        <Button type="submit" className="min-h-14 w-full text-base"><Send/>喊闺蜜来参谋</Button>
        <button type="button" onClick={()=>setStep(0)} className="min-h-12 w-full text-sm text-[var(--muted)]">返回修改</button>
      </div>}
    </form>
  </>;
}

function Field({label,hint,error,children}:{label:string;hint?:string;error?:string;children:React.ReactNode}) { return <label className="block"><span className="mb-2 block text-sm font-semibold">{label}</span>{children}{hint&&<span className="mt-2 block text-xs text-[var(--muted)]">{hint}</span>}{error&&<span className="mt-2 block text-xs text-red-700">{error}</span>}</label>; }
