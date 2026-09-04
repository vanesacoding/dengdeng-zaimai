"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Heart, Send, ThumbsDown, ThumbsUp, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { demoCases, demoTestimonies, type DemoTestimony } from "@/lib/case-demo-data";
import { isSafeComment } from "@/lib/domain";
import { formatMoney } from "@/lib/utils";

type Vote = "buy" | "wait" | "skip";
const voteLabels: Record<Vote, string> = { buy: "可以买", wait: "等等", skip: "别买" };

export function CaseDetail({ id }: { id: string }) {
  const caseData = useMemo(() => demoCases.find(item => item.caseId === id), [id]);
  const [vote, setVote] = useState<Vote>();
  const [comments, setComments] = useState<DemoTestimony[]>(demoTestimonies.filter(item => item.caseId === id));
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [replyTo, setReplyTo] = useState<string>();
  const [input, setInput] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const savedVote = localStorage.getItem(`ddzm:case-vote:${id}`) as Vote | null;
    if (savedVote) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVote(savedVote);
    }
  }, [id]);

  if (!caseData) return <div className="py-20 text-center"><p className="text-[var(--muted)]">这个案件找不到了</p><Button asChild className="mt-4"><Link href="/app/explore">返回法庭</Link></Button></div>;

  function submitComment() {
    const content = input.trim();
    if (!content) return;
    if (!isSafeComment(content)) { setError("换一种更友善的说法吧"); return; }
    setComments(items => [...items, { id: `t${Date.now()}`, caseId: id, role: "NONE", author: "我", emoji: "✨", content, parentId: replyTo, createdAt: "刚刚", likeCount: 0 }]);
    setInput(""); setReplyTo(undefined); setError("");
  }

  const topLevel = comments.filter(item => !item.parentId);
  const replies = (parentId: string) => comments.filter(item => item.parentId === parentId);
  const baseVotes = {
    buy: caseData.voteCounts.WORTH_IT,
    wait: caseData.voteCounts.WAIT,
    skip: caseData.voteCounts.RUN_AWAY,
  };

  function castVote(nextVote: Vote) {
    setVote(nextVote);
    localStorage.setItem(`ddzm:case-vote:${id}`, nextVote);
  }

  return <>
    <Link href="/app/explore" className="inline-flex items-center gap-1 text-xs text-[var(--muted)]"><ArrowLeft size={15}/> 返回法庭</Link>

    <section className="mt-4 rounded-2xl border border-[var(--line)] bg-white p-4">
      <div className="flex items-center gap-2 text-[11px] text-[var(--muted)]"><span className="grid size-6 place-items-center rounded-full bg-[var(--sage-soft)]">{caseData.userEmoji}</span><b className="text-[var(--ink)]">{caseData.isAnonymous ? "匿名" : caseData.user}</b><span>· {caseData.createdAt}</span></div>
      <h1 className="mt-3 font-black">{caseData.title.replaceAll("《", "").replaceAll("》", "")}</h1>
      <p className="mt-2 text-[13px] leading-5 text-[var(--muted)]">{caseData.statement}</p>
      <div className={`mt-3 flex items-center gap-3 rounded-xl p-3 ${caseData.tint}`}><span className="text-3xl">{caseData.itemEmoji}</span><div className="min-w-0 flex-1"><b className="block truncate text-[13px]">{caseData.itemName}</b><span className="text-[11px] text-[var(--muted)]">{caseData.category}</span></div><b className="text-[14px]">{formatMoney(caseData.priceCents)}</b></div>
      {caseData.evidence[0] && <p className="mt-2 text-[11px] text-[var(--muted)]">提示：{caseData.evidence[0].text}</p>}
    </section>

    <section className="mt-3 rounded-2xl border border-[var(--line)] bg-white p-4">
      <h2 className="font-bold">你怎么看？</h2>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <VoteButton active={vote === "buy"} onClick={() => castVote("buy")} icon={<ThumbsUp size={15}/>} label="可以买" count={baseVotes.buy + (vote === "buy" ? 1 : 0)} />
        <VoteButton active={vote === "wait"} onClick={() => castVote("wait")} icon={<Timer size={15}/>} label="等等" count={baseVotes.wait + (vote === "wait" ? 1 : 0)} />
        <VoteButton active={vote === "skip"} onClick={() => castVote("skip")} icon={<ThumbsDown size={15}/>} label="别买" count={baseVotes.skip + (vote === "skip" ? 1 : 0)} />
      </div>
      <p role="status" className={`mt-2 text-center text-[11px] ${vote ? "font-semibold text-[var(--forest)]" : "text-[var(--muted)]"}`}>{vote ? `✓ 已投票：${voteLabels[vote]}` : "选择后可随时改票"}</p>
    </section>

    <section id="comments" className="mt-3 rounded-2xl border border-[var(--line)] bg-white p-4">
      <h2 className="font-bold">评论 <span className="font-normal text-[var(--muted)]">{comments.length}</span></h2>
      <div className="mt-3 space-y-3">
        {topLevel.length === 0 && <p className="py-4 text-center text-xs text-[var(--muted)]">还没人评论，来坐第一排</p>}
        {topLevel.map(comment => <div key={comment.id}>
          <CommentItem comment={comment} liked={Boolean(liked[comment.id])} onLike={() => setLiked(state => ({ ...state, [comment.id]: !state[comment.id] }))} onReply={() => setReplyTo(comment.id)} />
          {replies(comment.id).length > 0 && <div className="ml-9 mt-2 space-y-2 border-l border-[var(--line)] pl-3">{replies(comment.id).map(reply => <CommentItem key={reply.id} comment={reply} liked={Boolean(liked[reply.id])} onLike={() => setLiked(state => ({ ...state, [reply.id]: !state[reply.id] }))} onReply={() => setReplyTo(comment.id)} />)}</div>}
        </div>)}
      </div>
      <div className="mt-4 border-t border-[var(--line)] pt-3">
        {replyTo && <div className="mb-2 flex justify-between text-[11px] text-[var(--muted)]"><span>回复 {comments.find(item => item.id === replyTo)?.author}</span><button type="button" onClick={() => setReplyTo(undefined)}>取消</button></div>}
        <div className="flex items-end gap-2"><Textarea value={input} onChange={event => { setInput(event.target.value); setError(""); }} placeholder="说说你的看法……" rows={2} className="min-h-16 flex-1"/><Button onClick={submitComment} disabled={!input.trim()} size="icon" aria-label="发表评论"><Send size={15}/></Button></div>
        {error && <p className="mt-1 text-[11px] text-red-500">{error}</p>}
      </div>
    </section>
  </>;
}

function VoteButton({ active, onClick, icon, label, count }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string; count: number }) {
  return <button type="button" aria-pressed={active} onClick={onClick} className={`flex min-h-11 flex-col items-center justify-center rounded-xl text-[11px] font-semibold ${active ? "bg-[var(--forest)] text-white shadow-sm" : "bg-[var(--cream)] text-[var(--muted)]"}`}><span className="flex items-center gap-1">{icon}{label}</span><span className={`mt-0.5 text-[10px] ${active ? "text-white/80" : "text-[var(--muted)]"}`}>{count}票</span></button>;
}

function CommentItem({ comment, liked, onLike, onReply }: { comment: DemoTestimony; liked: boolean; onLike: () => void; onReply: () => void }) {
  return <div className="flex gap-2.5"><span className="grid size-7 shrink-0 place-items-center rounded-full bg-[var(--sage-soft)]">{comment.emoji}</span><div className="min-w-0 flex-1"><div className="flex items-center gap-2 text-[11px]"><b>{comment.author}</b><span className="text-[var(--muted)]">{comment.createdAt}</span></div><p className="mt-0.5 text-[12px] leading-[18px] text-[var(--ink)]">{comment.content}</p><div className="mt-1 flex gap-4"><button type="button" onClick={onReply} className="text-[11px] text-[var(--muted)]">回复</button><button type="button" onClick={onLike} aria-pressed={liked} className={`flex items-center gap-1 text-[11px] ${liked ? "text-[#d45f55]" : "text-[var(--muted)]"}`}><Heart size={12} fill={liked ? "currentColor" : "none"}/>{(comment.likeCount ?? 0) + (liked ? 1 : 0)}</button></div></div></div>;
}
