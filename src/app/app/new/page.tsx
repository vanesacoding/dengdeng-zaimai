"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ImagePlus, LoaderCircle, Send, Sparkles, X } from "lucide-react";
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
  const [imagePreview, setImagePreview] = useState("");
  const [imageError, setImageError] = useState("");
  const { register, handleSubmit, control, getValues, trigger, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: { itemName: "", priceYuan: "" as unknown as number, reason: "", category: "其他", mood: "SEEDED_BY_OTHERS", visibility: "FRIENDS", productUrl: "", imageUrl: "", desiredHours: 0, coolingEnabled: true, coolingHours: 24, countInBudget: true, hasSimilarItem: false, hasAlternative: false, limitedPromotion: false, plannedPurchase: false, necessity: false },
  });
  const visibility = useWatch({ control, name: "visibility" });

  function submit(data: Form) {
    setSubmitError("");
    const priceCents = yuanToCents(Number(data.priceYuan));
    const risk = calculateRisk({ priceCents, remainingCents: demoBudget.remainingAmount, safeBalanceCents: demoBudget.safeBalance, hasSimilarItem: false, desiredHours: 0, limitedPromotion: false, plannedPurchase: false, necessity: false });
    add({ id: crypto.randomUUID(), itemName: data.itemName, priceCents, category: data.category, reason: data.reason, status: "PENDING_APPROVAL", riskScore: risk.score, createdAt: "刚刚", reviewer: "闺蜜", mood: data.mood, visibility: data.visibility, imageUrl: imagePreview || undefined, hasAlternative: data.hasAlternative === true || data.hasAlternative === "true", caseTitle: data.visibility === "PUBLIC" ? selectedTitle : undefined, caseStatement: data.visibility === "PUBLIC" ? statement : undefined });
    router.push(`/app/requests/submitted?target=${data.visibility === "PUBLIC" ? "court" : "friend"}`);
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

  function selectImage(file?: File) {
    setImageError("");
    if (!file) return;
    if (!file.type.startsWith("image/")) return setImageError("请选择图片文件");
    if (file.size > 2 * 1024 * 1024) return setImageError("图片请控制在 2MB 以内");
    const reader = new FileReader();
    reader.onload = () => setImagePreview(String(reader.result));
    reader.readAsDataURL(file);
  }

  return <>
    <header><p className="text-[11px] text-[var(--muted)]">发起审批</p><h1 className="mt-0.5 font-black">我想买这个</h1></header>
    <form onSubmit={handleSubmit(submit, () => setSubmitError("还有内容没填好，请看看上面的提示。"))} className="mt-5 space-y-4">
      <Field label="买什么？" error={errors.itemName?.message}><Input {...register("itemName")} placeholder="例如：降噪耳机"/></Field>
      <Field label="多少钱？" error={errors.priceYuan?.message}><div className="relative"><span className="absolute left-3 top-3 text-sm font-bold">¥</span><Input {...register("priceYuan")} className="pl-8" type="number" inputMode="decimal" placeholder="0.00"/></div></Field>
      <Field label="为什么想买？" error={errors.reason?.message}><Textarea {...register("reason")} rows={3} placeholder="一句话说清楚就好……"/></Field>
      <Field label="是否有替代品？" error={errors.hasAlternative?.message}><div className="grid grid-cols-2 gap-2"><BooleanChoice value="false" label="没有" name="hasAlternative" register={register}/><BooleanChoice value="true" label="有" name="hasAlternative" register={register}/></div></Field>
      <Field label="商品图片（选填）">
        {imagePreview ? <div className="relative overflow-hidden rounded-2xl border border-[var(--line)] bg-white"><Image src={imagePreview} alt="商品预览" width={640} height={352} unoptimized className="h-44 w-full object-cover"/><button type="button" aria-label="删除图片" onClick={() => setImagePreview("")} className="absolute right-2 top-2 grid size-8 place-items-center rounded-full bg-black/60 text-white"><X size={15}/></button></div> : <label className="flex min-h-24 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--line)] bg-white text-[11px] text-[var(--muted)]"><ImagePlus size={22}/><span className="mt-1">上传商品图片</span><input type="file" accept="image/*" className="sr-only" onChange={event => selectImage(event.target.files?.[0])}/></label>}
        {imageError && <span className="mt-1 block text-[11px] text-red-600">{imageError}</span>}
      </Field>
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

function BooleanChoice({ value, label, name, register }: { value: "true" | "false"; label: string; name: "hasAlternative"; register: ReturnType<typeof useForm<Form>>["register"] }) {
  // 注意：react-hook-form 对 radio 不应用 setValueAs，提交值是字符串，由 schema 里的 transform 统一转回布尔
  return <label><input type="radio" value={value} {...register(name)} className="peer sr-only"/><span className="flex min-h-11 items-center justify-center rounded-xl border border-[var(--line)] bg-white text-xs peer-checked:border-[var(--forest)] peer-checked:bg-[var(--sage-soft)] peer-checked:font-semibold peer-checked:text-[var(--forest)]">{label}</span></label>;
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1.5 block text-xs font-semibold">{label}</span>{children}{error && <span className="mt-1 block text-[11px] text-red-600">{error}</span>}</label>;
}
