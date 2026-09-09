"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, LoaderCircle, Send, Sparkles } from "lucide-react";
import { purchaseSchema } from "@/lib/domain";
import { calculateRisk } from "@/lib/risk";
import { demoBudget } from "@/lib/mock-data";
import { yuanToCents } from "@/lib/utils";
import { useRequests } from "@/lib/use-requests";
import { createClient } from "@/lib/supabase/client";
import { createLocalCaseDraft, isCaseWriterResult, toneLabels, type CaseWriterResult, type CaseWriterTone } from "@/lib/case-writer";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import type { z } from "zod";

type Form = z.input<typeof purchaseSchema>;
const toneOrder: CaseWriterTone[] = ["dramatic", "light", "official"];

function timeout<T>(promise: Promise<T>, milliseconds = 4000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => window.setTimeout(() => reject(new Error("AI_TIMEOUT")), milliseconds)),
  ]);
}

export default function NewRequest() {
  const router = useRouter();
  const { add } = useRequests();
  const [tone, setTone] = useState<CaseWriterTone>("dramatic");
  const [draft, setDraft] = useState<CaseWriterResult>();
  const [selectedTitle, setSelectedTitle] = useState("");
  const [statement, setStatement] = useState("");
  const [generating, setGenerating] = useState(false);
  const [writerNote, setWriterNote] = useState("");
  const [submitError, setSubmitError] = useState("");
  const { register, handleSubmit, control, getValues, trigger, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: { itemName: "", priceYuan: "" as unknown as number, reason: "", category: "其他", mood: "SEEDED_BY_OTHERS", visibility: "FRIENDS", productUrl: "", imageUrl: "", desiredHours: 0, coolingEnabled: true, coolingHours: 24, countInBudget: true, hasSimilarItem: false, limitedPromotion: false, plannedPurchase: false, necessity: false },
  });
  const visibility = useWatch({ control, name: "visibility" });

  function submit(data: Form) {
    setSubmitError("");
    const priceCents = yuanToCents(Number(data.priceYuan));
    const risk = calculateRisk({ priceCents, remainingCents: demoBudget.remainingAmount, safeBalanceCents: demoBudget.safeBalance, hasSimilarItem: false, desiredHours: 0, limitedPromotion: false, plannedPurchase: false, necessity: false });
    add({ id: crypto.randomUUID(), itemName: data.itemName, priceCents, category: data.category, reason: data.reason, status: "PENDING_APPROVAL", riskScore: risk.score, createdAt: "刚刚", reviewer: "闺蜜", mood: data.mood, visibility: data.visibility, caseTitle: data.visibility === "PUBLIC" ? selectedTitle : undefined, caseStatement: data.visibility === "PUBLIC" ? statement : undefined });
    router.push("/app/requests/submitted");
  }

  async function writeCase(nextTone: CaseWriterTone = tone) {
    if (!await trigger(["itemName", "priceYuan", "reason"])) return;
    const values = getValues();
    const input = { itemName: values.itemName, priceYuan: Number(values.priceYuan), originalReason: values.reason, tone: nextTone };
    setGenerating(true); setWriterNote("");
    let result: CaseWriterResult | undefined;
    try {
      const supabase = createClient();
      if (supabase) {
        const response = await timeout(supabase.functions.invoke("case-writer", { body: input }));
        if (!response.error && isCaseWriterResult(response.data)) result = response.data;
      }
    } catch { /* fall back to the local demo writer */ }
    if (!result) {
      result = createLocalCaseDraft(input);
      setWriterNote("当前为本地体验稿；配置 AI 后会更贴合你的原话。 ");
    }
    setDraft(result); setSelectedTitle(result.caseTitles[0]); setStatement(result.caseStatement); setGenerating(false);
  }

  function changeTone(nextTone: CaseWriterTone) {
    setTone(nextTone);
    if (draft) void writeCase(nextTone);
  }

  return <>
    <header><p className="text-[11px] text-[var(--muted)]">发起审批</p><h1 className="mt-0.5 font-black">我想买这个</h1></header>
    <form onSubmit={handleSubmit(submit, () => setSubmitError("还有内容没填好，请看看上面的提示。"))} className="mt-5 space-y-4">
      <Field label="买什么？" error={errors.itemName?.message}><Input {...register("itemName")} placeholder="例如：降噪耳机"/></Field>
      <Field label="多少钱？" error={errors.priceYuan?.message}><div className="relative"><span className="absolute left-3 top-3 text-sm font-bold">¥</span><Input {...register("priceYuan")} className="pl-8" type="number" inputMode="decimal" placeholder="0.00"/></div></Field>
      <Field label="为什么想买？" error={errors.reason?.message}><Textarea {...register("reason")} rows={3} placeholder="一句话说清楚就好……"/></Field>
      <Field label="给谁看？"><div className="grid grid-cols-2 gap-2"><Choice value="FRIENDS" label="给闺蜜审批" register={register}/><Choice value="PUBLIC" label="发到法庭" register={register}/></div></Field>
      {visibility === "PUBLIC" && <section className="rounded-2xl border border-[var(--line)] bg-white p-3.5">
        <div className="flex items-center justify-between gap-3"><div><b className="text-[13px]">AI 书记员</b><p className="text-[11px] text-[var(--muted)]">把原话写成有梗的购物案</p></div><Button type="button" size="sm" onClick={() => writeCase()} disabled={generating}>{generating ? <LoaderCircle className="animate-spin" size={14}/> : <Sparkles size={14}/>} {draft ? "换一批" : "帮我写"}</Button></div>
        <div className="mt-3 flex gap-1.5">{toneOrder.map(item => <button type="button" key={item} disabled={generating} onClick={() => changeTone(item)} className={`rounded-full px-2.5 py-1.5 text-[10px] disabled:opacity-50 ${tone === item ? "bg-[var(--forest)] text-white" : "bg-[var(--cream)] text-[var(--muted)]"}`}>{toneLabels[item]}</button>)}</div>
        {draft && <div className="mt-3 space-y-2">
          <p className="text-[11px] font-semibold">选一个案名</p>
          {draft.caseTitles.map(title => <button type="button" key={title} onClick={() => setSelectedTitle(title)} className={`flex min-h-10 w-full items-center gap-2 rounded-xl border px-3 text-left text-[12px] ${selectedTitle === title ? "border-[var(--forest)] bg-[var(--sage-soft)] text-[var(--forest)]" : "border-[var(--line)]"}`}><span className="w-3">{selectedTitle === title && <Check size={13}/>}</span>{title}</button>)}
          <label className="block pt-1"><span className="mb-1.5 block text-[11px] font-semibold">案名（可修改）</span><Input value={selectedTitle} onChange={event => setSelectedTitle(event.target.value)} maxLength={40}/></label>
          <label className="block pt-1"><span className="mb-1.5 block text-[11px] font-semibold">案情描述（可修改）</span><Textarea value={statement} onChange={event => setStatement(event.target.value)} rows={3}/></label>
          {writerNote && <p className="text-[10px] leading-4 text-[var(--muted)]">{writerNote}</p>}
        </div>}
      </section>}
      {submitError && <p role="alert" className="rounded-xl bg-[#fce8e3] px-3 py-2 text-[11px] text-[#9d3b2b]">{submitError}</p>}
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
