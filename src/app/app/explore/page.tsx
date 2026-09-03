"use client";

import { useState } from "react";
import { Bookmark, Heart, MessageCircle, Timer, Users } from "lucide-react";
import { Card } from "@/components/ui/card";

const channels = ["正在纠结", "今日上头", "成功拔草", "买后真香", "买后后悔"];
const posts = [
  { emoji:"📷", name:"口袋照片打印机", price:"¥699", user:"晚风", mood:"想记录生活", reason:"看大家做旅行手账好心动，但担心买回来吃灰……", tag:"正在纠结", wait:"纠结 7 天", votes:26, comments:8, tint:"bg-[#f3e9df]" },
  { emoji:"👜", name:"焦糖色通勤包", price:"¥459", user:"桃子汽水", mood:"想奖励自己", reason:"升职后的第一个小礼物！容量和颜色都很喜欢。", tag:"姐妹求参谋", wait:"刚刚心动", votes:41, comments:13, tint:"bg-[var(--lemon-soft)]" },
  { emoji:"☕", name:"奶油白咖啡机", price:"¥1299", user:"栗子", mood:"成功拔草", reason:"冷静三天后发现我真正想要的是每天早点睡，不是咖啡机。", tag:"成功拔草", wait:"冷静了 72 小时", votes:88, comments:20, tint:"bg-[var(--blue-soft)]" },
];

export default function ExplorePage() {
  const [active, setActive] = useState(0);
  const [liked, setLiked] = useState<string[]>([]);
  return <>
    <header><div className="flex items-center justify-between"><div><p className="text-sm text-[var(--muted)]">想买广场</p><h1 className="mt-1 text-3xl font-black">大家都在纠结什么</h1></div><span className="grid size-11 place-items-center rounded-2xl bg-[var(--lemon-soft)]">👀</span></div><p className="mt-3 text-sm leading-6 text-[var(--muted)]">先围观真实的心动和拔草，别急着被种草。</p></header>
    <div className="-mx-5 mt-5 flex gap-2 overflow-x-auto px-5 pb-2">{channels.map((channel,index)=><button type="button" key={channel} onClick={()=>setActive(index)} className={`min-h-11 shrink-0 rounded-full px-4 text-sm font-semibold ${active===index?"bg-[var(--forest)] text-white":"bg-white text-[var(--muted)]"}`}>{channel}</button>)}</div>
    <div className="mt-4 rounded-2xl bg-[var(--blue-soft)] px-4 py-3 text-xs leading-5 text-[var(--muted)]">第一阶段体验区 · 当前内容为演示数据，真实公开发布和评论将在社区阶段接入。</div>
    <div className="mt-4 space-y-4">{posts.map(post=><Card key={post.name} className="overflow-hidden p-0"><div className={`grid h-44 place-items-center ${post.tint} text-7xl`}>{post.emoji}</div><div className="p-4"><div className="flex items-center justify-between text-xs text-[var(--muted)]"><span className="flex items-center gap-1"><span className="grid size-6 place-items-center rounded-full bg-[var(--sage-soft)]">♡</span>{post.user}</span><span className="rounded-full bg-[var(--orange-soft)] px-2.5 py-1 text-[var(--orange-deep)]">{post.tag}</span></div><div className="mt-3 flex items-start justify-between gap-3"><div><h2 className="text-lg font-bold">{post.name}</h2><span className="mood-chip mt-1">{post.mood}</span></div><b className="text-lg">{post.price}</b></div><p className="mt-3 text-sm leading-6 text-[var(--muted)]">{post.reason}</p><div className="mt-3 flex items-center gap-1 text-xs text-[var(--muted)]"><Timer size={13}/>{post.wait}</div><div className="mt-4 flex items-center justify-between border-t border-[var(--line)] pt-3"><button type="button" onClick={()=>setLiked(values=>values.includes(post.name)?values.filter(value=>value!==post.name):[...values,post.name])} className={`flex min-h-11 items-center gap-1.5 rounded-full px-3 text-sm font-semibold ${liked.includes(post.name)?"bg-[var(--orange-soft)] text-[var(--orange-deep)]":"text-[var(--muted)]"}`}><Heart size={17} fill={liked.includes(post.name)?"currentColor":"none"}/>{liked.includes(post.name)?post.votes+1:post.votes}</button><span className="flex items-center gap-1 text-sm text-[var(--muted)]"><Users size={17}/>先等等</span><span className="flex items-center gap-1 text-sm text-[var(--muted)]"><MessageCircle size={17}/>{post.comments}</span><button type="button" aria-label={`收藏${post.name}`} className="grid size-11 place-items-center text-[var(--muted)]"><Bookmark size={18}/></button></div></div></Card>)}</div>
  </>;
}
