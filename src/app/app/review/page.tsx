"use client";

import { useState } from "react";
import { Check, Clock3, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";

const choices = [
  { value: "可以买", icon: Check },
  { value: "先等等", icon: Clock3 },
  { value: "不建议买", icon: X },
];
const quick = ["很适合你，可以买。", "先睡一觉，明天再看。", "家里是不是已经有类似的？"];

export default function Review() {
  const [choice, setChoice] = useState("");
  const [comment, setComment] = useState("");
  const [done, setDone] = useState(false);

  return <>
    <header><p className="text-[11px] text-[var(--muted)]">等你审批</p><h1 className="mt-0.5 font-black">帮她看看</h1></header>

    <section className="mt-4 rounded-2xl border border-[var(--line)] bg-white p-4">
      <div className="flex items-center gap-3"><span className="grid size-14 place-items-center rounded-xl bg-[var(--blue-soft)] text-2xl">📷</span><div className="min-w-0 flex-1"><b className="block truncate text-[14px]">便携照片打印机</b><p className="mt-0.5 text-[12px] text-[var(--muted)]">想做旅行手账，已经看了一周</p></div><b className="text-[14px]">¥699</b></div>
      <p className="mt-3 rounded-xl bg-[var(--cream)] px-3 py-2 text-[11px] text-[var(--muted)]">买完剩余 ¥821 · 可能有点上头</p>
    </section>

    <h2 className="mt-5 font-bold">你的意见</h2>
    <div className="mt-2 grid grid-cols-3 gap-2">{choices.map(item => { const Icon = item.icon; return <button type="button" key={item.value} aria-pressed={choice === item.value} onClick={() => { setChoice(item.value); setDone(false); }} className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-semibold ${choice === item.value ? "bg-[var(--forest)] text-white" : "border border-[var(--line)] bg-white text-[var(--muted)]"}`}><Icon size={15}/>{item.value}</button>; })}</div>

    <Textarea className="mt-4 min-h-20" value={comment} onChange={event => setComment(event.target.value)} placeholder="想补充什么？（选填）" rows={3}/>
    <div className="mt-2 flex gap-2 overflow-x-auto pb-1">{quick.map(text => <button type="button" key={text} onClick={() => setComment(text)} className="shrink-0 rounded-full bg-[var(--cream)] px-3 py-2 text-[11px] text-[var(--muted)]">{text}</button>)}</div>

    <Button className="mt-5 w-full" disabled={!choice} onClick={() => setDone(true)}><Send size={15}/>提交意见</Button>
    {done && <p role="status" className="mt-3 rounded-xl bg-[var(--sage-soft)] p-3 text-center text-xs font-semibold text-[var(--forest)]">已送达：{choice}</p>}
  </>;
}
