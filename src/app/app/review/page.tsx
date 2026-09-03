"use client";

import { useState } from "react";
import { Check, Clock3, HelpCircle, MessageCircleHeart, MessageSquareText, Send, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";

const quick = [
  "买！这个真的很适合你。",
  "先等到明天，醒来再看看。",
  "你是不是已经有类似的了？",
  "我觉得你现在有一点情绪上头。",
  "确实需要，但可以先比比价。",
  "不拦你，但答应我多想一天。",
  "买了记得回来交作业。",
  "预算看起来还好，但要不要再比较一下？",
  "如果不是限时促销，你现在还会这么想买吗？",
];

const choices = [
  { value:"买！适合你", icon:Check, className:"bg-[var(--forest)] text-white" },
  { value:"先等等", icon:Clock3, className:"bg-[var(--lemon-soft)] text-[#67560f]" },
  { value:"我劝你别买", icon:X, className:"bg-[var(--orange-soft)] text-[var(--orange-deep)]" },
  { value:"需要补充信息", icon:HelpCircle, className:"bg-[var(--blue-soft)] text-[var(--forest-deep)]" },
  { value:"不替你决定，但我有话说", icon:MessageSquareText, className:"bg-[var(--sage-soft)] text-[var(--forest-deep)]" },
];

export default function Review() {
  const [comment,setComment] = useState("");
  const [choice,setChoice] = useState("");
  const [done,setDone] = useState(false);
  return (
    <>
      <header>
        <span className="inline-flex items-center gap-1 rounded-full bg-[var(--lemon-soft)] px-3 py-1 text-xs font-semibold text-[#67560f]"><MessageCircleHeart size={14}/>等你一句话</span>
        <h1 className="mt-3 text-3xl font-black">帮她参谋一下</h1>
        <p className="mt-2 text-[var(--muted)]">你给她多一个视角，最后还是由她自己决定。</p>
      </header>

      {/* 商品卡片 */}
      <Card className="mt-6 overflow-hidden p-0">
        <div className="grid h-40 place-items-center bg-[var(--blue-soft)] text-7xl">📷</div>
        <div className="p-5">
          <div className="flex justify-between gap-4">
            <div>
              <span className="mood-chip">想记录生活</span>
              <h2 className="mt-2 text-xl font-black">便携照片打印机</h2>
            </div>
            <b className="text-xl">¥699</b>
          </div>
          <p className="mt-4 rounded-2xl bg-[var(--cream)] p-4 text-sm leading-6">想把旅行照片打印出来做手账，已经看了一个星期。</p>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-[var(--muted)]">买完还剩</p>
              <b>¥821</b>
            </div>
            <div>
              <p className="text-[var(--muted)]">上头小提示</p>
              <b className="text-[var(--orange-deep)]">可能有点上头</b>
            </div>
          </div>
        </div>
      </Card>

      {/* 态度选择 */}
      <h2 className="mt-7 font-bold">你的第一反应是？</h2>
      <div className="mt-3 grid grid-cols-2 gap-3">
        {choices.map(item => {
          const Icon = item.icon;
          return (
            <button
              type="button"
              key={item.value}
              onClick={() => setChoice(item.value)}
              className={`flex min-h-16 items-center justify-center gap-2 rounded-[20px] px-3 text-sm font-bold transition ${choice === item.value ? item.className : "border border-[var(--line)] bg-white text-[var(--muted)]"}`}
            >
              <Icon size={18}/>{item.value}
            </button>
          );
        })}
      </div>

      {/* 文字意见 */}
      <label className="mt-7 block text-sm font-bold">再说两句也可以</label>
      <Textarea className="mt-2" value={comment} onChange={event => setComment(event.target.value)} placeholder="像平时聊天一样，说说你的考虑……"/>

      {/* 快捷回复 */}
      <div className="-mx-5 mt-3 flex gap-2 overflow-x-auto px-5 pb-2">
        {quick.map(text => (
          <button
            type="button"
            key={text}
            onClick={() => setComment(text)}
            className="min-h-11 shrink-0 rounded-full border border-[var(--line)] bg-white px-3 text-xs"
          >
            {text}
          </button>
        ))}
      </div>

      {/* 建议冷静时长 */}
      {choice === "先等等" && (
        <Card className="mt-4 bg-[var(--lemon-soft)]">
          <label className="text-sm font-semibold">建议她冷静多久？</label>
          <div className="mt-2 flex items-center gap-2">
            <Input type="number" defaultValue="24" inputMode="numeric"/>
            <span className="shrink-0 text-sm">小时</span>
          </div>
        </Card>
      )}

      {/* 提交 */}
      <Button className="mt-6 min-h-14 w-full text-base" disabled={!choice} onClick={() => setDone(true)}>
        <Send/>把我的想法告诉她
      </Button>

      {done && (
        <p role="status" className="mt-4 rounded-2xl bg-[var(--sage-soft)] p-4 text-center font-semibold text-[var(--forest)]">
          已经送达：{choice}{comment ? "，她也会看到你的留言。" : "。"}
        </p>
      )}

      <p className="mt-6 text-center text-xs leading-5 text-[var(--muted)]">
        闺蜜意见只是参考，最终决定始终属于她。即使你劝她别买，她仍然可以记录自己最终购买。
      </p>
    </>
  );
}
