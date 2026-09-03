"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Share2, ShoppingBag } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { formatMoney } from "@/lib/utils";
import {
  detectPlotTwist,
  formatCaseNumberDisplay,
  getCustomVoteOptions,
  isCommercialSource,
  isSafeComment,
  summarizeVerdict,
  witnessRoleLabel,
  witnessRoleEmoji,
  witnessRoles,
  type ReactionType,
  type WitnessRole,
} from "@/lib/domain";
import { demoCases, demoTestimonies, type DemoTestimony } from "@/lib/case-demo-data";
import { CaseStatusBadge } from "@/components/case-status-badge";
import { CaseEvidenceList } from "@/components/case-evidence-list";
import { JurySummary } from "@/components/jury-summary";
import { CaseOutcomePreview } from "@/components/case-outcome-preview";
import { VerdictShareCard } from "@/components/verdict-share-card";
import { ProductDecisionSheet } from "@/components/product-decision-sheet";
import { useReactions, useBookmarks, useFollowUps } from "@/lib/public-api";

const reactionButtons: { type: ReactionType; emoji: string }[] = [
  { type: "WORTH_IT", emoji: "✅" },
  { type: "WAIT", emoji: "🧊" },
  { type: "RUN_AWAY", emoji: "🛡️" },
  { type: "SAME_DESIRE", emoji: "🤩" },
  { type: "FOLLOW_UP", emoji: "👀" },
];

export function CaseDetail({ id }: { id: string }) {
  const [testimonies, setTestimonies] = useState<DemoTestimony[]>(demoTestimonies.filter(t => t.caseId === id));
  const [input, setInput] = useState("");
  const [replyTo, setReplyTo] = useState<string | undefined>();
  const [selectedRole, setSelectedRole] = useState<WitnessRole>("NONE");
  const [showShare, setShowShare] = useState(false);
  const [showDecision, setShowDecision] = useState(false);
  const [showCommerce, setShowCommerce] = useState(false);
  const [testimonyError, setTestimonyError] = useState("");
  const { has: hasReaction, toggle: toggleReaction } = useReactions();
  const { isSaved, toggle: toggleBookmark } = useBookmarks();
  const { isFollowing, toggle: toggleFollow } = useFollowUps();

  const caseData = useMemo(() => demoCases.find(c => c.caseId === id), [id]);

  if (!caseData) {
    return (
      <div className="flex min-h-[60dvh] flex-col items-center justify-center text-center">
        <span className="text-4xl">📁</span>
        <p className="mt-3 text-[var(--muted)]">案件不存在或已归档</p>
        <Button asChild className="mt-6">
          <Link href="/app/explore">返回法庭</Link>
        </Button>
      </div>
    );
  }

  const summary = summarizeVerdict(caseData.voteCounts);
  const plotTwist = detectPlotTwist(caseData.majorityVerdict, caseData.resultType);
  const isBookmarked = isSaved(caseData.caseId);
  const isFollowingCase = isFollowing(caseData.caseId);
  const customVotes = getCustomVoteOptions(caseData.category);
  const isSponsored = isCommercialSource(caseData.contentSource);

  function submitTestimony() {
    const trimmed = input.trim();
    if (!trimmed) return;
    if (!isSafeComment(trimmed)) {
      setTestimonyError("证词包含不友善内容，请修改后再提交");
      return;
    }
    const newTestimony: DemoTestimony = {
      id: `t${Date.now()}`,
      caseId: id,
      role: selectedRole,
      author: "我",
      emoji: "✨",
      content: trimmed,
      parentId: replyTo,
      createdAt: "刚刚",
    };
    setTestimonies(prev => [...prev, newTestimony]);
    setInput("");
    setReplyTo(undefined);
    setTestimonyError("");
  }

  const topLevel = testimonies.filter(t => !t.parentId);
  const getReplies = (parentId: string) => testimonies.filter(t => t.parentId === parentId);

  return (
    <>
      <Link href="/app/explore" className="mb-5 inline-flex gap-2 text-sm text-[var(--muted)]">
        <ArrowLeft size={18} />返回法庭
      </Link>

      <div className="flex items-center justify-between">
        <span className="rounded-full bg-[var(--ink)] px-3 py-1 text-xs font-bold text-white">
          {formatCaseNumberDisplay(caseData.caseNumber)}
        </span>
        <CaseStatusBadge status={caseData.caseStatus} />
      </div>

      <h1 className="mt-4 text-2xl font-black leading-8 text-[var(--ink)]">{caseData.title}</h1>

      <div className="mt-3 flex items-center gap-2 text-xs text-[var(--muted)]">
        <span className="grid size-7 place-items-center rounded-full bg-[var(--sage-soft)] text-xs">{caseData.userEmoji}</span>
        <b className="text-[var(--forest)]">{caseData.isAnonymous ? "匿名当事人" : caseData.user}</b>
        <span>·</span>
        <span>{caseData.createdAt}</span>
        {caseData.isDemo && (
          <span className="rounded-full bg-[var(--blue-soft)] px-2 py-0.5 text-[var(--forest-deep)]">体验案件</span>
        )}
      </div>

      {/* Statement */}
      <Card className="mt-5 p-5">
        <p className="mb-2 text-xs font-semibold text-[var(--muted)]">📋 案由</p>
        <p className="text-sm font-semibold text-[var(--ink)]">{caseData.caseReason}</p>
        <div className="mt-4 rounded-2xl bg-[var(--cream)] p-4">
          <p className="mb-1 text-xs font-semibold text-[var(--muted)]">当事人陈述</p>
          <p className="text-sm leading-7 text-[var(--ink)]">&ldquo;{caseData.statement}&rdquo;</p>
        </div>
      </Card>

      {/* Product */}
      <Card className="mt-4 overflow-hidden p-0">
        <div className={`grid h-40 place-items-center ${caseData.tint} text-7xl`}>{caseData.itemEmoji}</div>
        <div className="p-4">
          <p className="text-xs text-[var(--muted)]">涉案商品</p>
          <div className="mt-1 flex items-center justify-between">
            <b className="text-lg">{caseData.itemName}</b>
            <span className="text-lg font-bold">{formatMoney(caseData.priceCents)}</span>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <span className="mood-chip">{caseData.mood}</span>
            <span className="rounded-full bg-[var(--cream)] px-3 py-1 text-xs text-[var(--muted)]">{caseData.category}</span>
          </div>
        </div>
      </Card>

      {/* Evidence */}
      <div className="mt-4">
        <CaseEvidenceList evidence={caseData.evidence} />
      </div>

      {/* Sponsored disclosure */}
      {isSponsored && caseData.sponsorDisclosure && (
        <div className="mt-4 rounded-2xl bg-[var(--lemon-soft)] p-4">
          <p className="text-xs font-bold text-[var(--orange-deep)]">⚠️ 品牌送审 · 合作内容</p>
          <p className="mt-1 text-xs leading-5 text-[var(--muted)]">{caseData.sponsorDisclosure}</p>
        </div>
      )}

      {/* Jury voting */}
      <Card className="mt-4 p-5">
        <h2 className="font-bold">⚖️ 陪审团投票</h2>
        <p className="mt-1 text-xs text-[var(--muted)]">你的投票会加入陪审团意见统计</p>

        {customVotes.length > 0 && (
          <div className="mt-3 space-y-2">
            <p className="text-xs font-semibold text-[var(--muted)]">定制选项（{caseData.category}）</p>
            {customVotes.map((opt, i) => (
              <button
                type="button"
                key={i}
                onClick={() => toggleReaction(caseData.caseId, opt.type)}
                className={`flex min-h-12 w-full items-center gap-2 rounded-2xl border px-4 text-sm transition ${
                  hasReaction(caseData.caseId, opt.type)
                    ? "border-[var(--forest)] bg-[var(--sage-soft)] font-semibold text-[var(--forest)]"
                    : "border-[var(--line)] bg-white text-[var(--muted)]"
                }`}
              >
                {opt.text}
              </button>
            ))}
          </div>
        )}

        <div className="mt-3 flex flex-wrap gap-2">
          {reactionButtons.map(({ type, emoji }) => (
            <button
              type="button"
              key={type}
              onClick={() => toggleReaction(caseData.caseId, type)}
              className={`flex min-h-11 items-center gap-1 rounded-full px-3 text-sm transition ${
                hasReaction(caseData.caseId, type)
                  ? "bg-[var(--orange-soft)] font-semibold text-[var(--orange-deep)]"
                  : "bg-[var(--cream)] text-[var(--muted)]"
              }`}
            >
              <span>{emoji}</span>
              <span className="text-xs">{type === "WORTH_IT" ? "批准" : type === "WAIT" ? "冷静" : type === "RUN_AWAY" ? "驳回" : type === "SAME_DESIRE" ? "也想买" : "蹲后续"}</span>
            </button>
          ))}
        </div>

        <div className="mt-4">
          <JurySummary summary={summary} />
        </div>
        <p className="mt-3 rounded-2xl bg-[var(--lemon-soft)] p-3 text-xs leading-5 text-[var(--muted)]">
          这是社区意见，不是消费命令。最终决定权属于当事人。
        </p>
      </Card>

      {/* Best testimony */}
      {caseData.bestTestimony && (
        <Card className="mt-4 border-2 border-[var(--lemon)] bg-[var(--lemon-soft)] p-5">
          <p className="text-xs font-bold text-[var(--orange-deep)]">🏆 本案最佳证词</p>
          <div className="mt-3 flex gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white text-lg">
              {caseData.bestTestimony.emoji}
            </span>
            <div>
              <p className="text-sm italic leading-6 text-[var(--ink)]">
                &ldquo;{caseData.bestTestimony.content}&rdquo;
              </p>
              <p className="mt-2 text-xs text-[var(--muted)]">
                — {caseData.bestTestimony.author}（{witnessRoleLabel[caseData.bestTestimony.role]}）
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Testimony section */}
      <Card className="mt-4 p-5">
        <h2 className="font-bold">💬 证词区（{testimonies.length}）</h2>

        <div className="mt-3 flex flex-wrap gap-2">
          {witnessRoles.map(role => (
            <button
              type="button"
              key={role}
              onClick={() => setSelectedRole(role)}
              className={`flex min-h-9 items-center gap-1 rounded-full px-3 text-xs transition ${
                selectedRole === role
                  ? "bg-[var(--forest)] text-white font-semibold"
                  : "bg-[var(--cream)] text-[var(--muted)]"
              }`}
            >
              <span>{witnessRoleEmoji[role]}</span>
              {witnessRoleLabel[role]}
            </button>
          ))}
        </div>

        <div className="mt-4 space-y-3">
          {topLevel.length === 0 && (
            <p className="text-center text-sm text-[var(--muted)]">还没有证词，来提交第一条吧</p>
          )}
          {topLevel.map(t => (
            <div key={t.id}>
              <TestimonyItem testimony={t} onReply={() => setReplyTo(t.id)} />
              <div className="ml-11 space-y-2 border-l-2 border-[var(--line)] pl-3">
                {getReplies(t.id).map(reply => (
                  <TestimonyItem key={reply.id} testimony={reply} onReply={() => setReplyTo(t.id)} />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4">
          {replyTo && (
            <div className="mb-2 flex items-center justify-between rounded-lg bg-[var(--cream)] px-3 py-1.5 text-xs text-[var(--muted)]">
              <span>回应 {testimonies.find(t => t.id === replyTo)?.author}</span>
              <button type="button" onClick={() => setReplyTo(undefined)} className="text-[var(--forest)]">取消</button>
            </div>
          )}
          <Textarea
            value={input}
            onChange={e => { setInput(e.target.value); setTestimonyError(""); }}
            placeholder="提交证词……说说你的真实体验或建议"
            rows={3}
            className="mb-2"
          />
          {testimonyError && (
            <p className="mb-2 text-xs text-red-500">{testimonyError}</p>
          )}
          <div className="flex gap-2">
            <Button
              className="shrink-0"
              disabled={!input.trim()}
              onClick={submitTestimony}
            >
              提交证词
            </Button>
            <Button variant="ghost" className="shrink-0" onClick={() => { setSelectedRole("NONE"); setReplyTo(undefined); }}>
              重置
            </Button>
          </div>
        </div>
      </Card>

      {/* Case outcome */}
      {caseData.hasResult && (
        <Card className="mt-4 p-5">
          <h2 className="font-bold">📁 案件回访</h2>
          <div className="mt-3">
            <CaseOutcomePreview
              resultType={caseData.resultType}
              plotTwist={plotTwist}
              hasFollowUp={caseData.hasFollowUp}
            />
          </div>
          {caseData.resultType && (
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              {caseData.resultType === "PURCHASED_LOVED" && summary.majorityVerdict === "WALLET_PROTECTED" && "陪审团多数劝她别买，但当事人坚持购买。回访结果：真香。"}
              {caseData.resultType === "PURCHASED_LOVED" && summary.majorityVerdict === "COOLING_RECOMMENDED" && "陪审团建议冷静，但当事人最终购买。回访结果：真香。"}
              {caseData.resultType === "PURCHASED_REGRETTED" && summary.majorityVerdict === "APPROVED_BY_JURY" && "陪审团批准购买，但回访发现：已闲置。本案申请重审。"}
              {caseData.resultType === "GIVEN_UP" && summary.majorityVerdict === "COOLING_RECOMMENDED" && "陪审团建议冷静，冷静期后当事人成功拔草。"}
              {caseData.resultType === "BOUGHT_ALTERNATIVE" && "当事人最终选择了更合适的平替方案。"}
            </p>
          )}
        </Card>
      )}

      {/* Actions */}
      <div className="mt-5 flex gap-3">
        <Button variant="outline" className="flex-1" onClick={() => setShowShare(true)}>
          <Share2 size={16} /> 分享判决书
        </Button>
        <Button
          variant="outline"
          className={`flex-1 ${isBookmarked ? "text-[var(--forest)]" : ""}`}
          onClick={() => toggleBookmark(caseData.caseId)}
        >
          {isBookmarked ? "⭐ 已收藏" : "☆ 收藏"}
        </Button>
        <Button
          variant="outline"
          className={`flex-1 ${isFollowingCase ? "text-[var(--forest)]" : ""}`}
          onClick={() => toggleFollow(caseData.caseId)}
        >
          {isFollowingCase ? "已蹲" : "蹲后续"}
        </Button>
      </div>

      {/* Decision + commerce */}
      <Card className="mt-4 border-2 border-[var(--forest)] bg-[var(--sage-soft)] p-5 text-center">
        <h3 className="font-bold">想清楚了吗？</h3>
        <p className="mt-1 text-sm text-[var(--muted)]">查看案件解决方案，或记录你的决定</p>
        <div className="mt-3 flex gap-3">
          <Button className="flex-1" onClick={() => setShowDecision(true)}>
            <ShoppingBag size={16} /> 我已经想清楚了
          </Button>
        </div>
      </Card>

      {showCommerce && (
        <Card className="mt-4 p-5">
          <h3 className="font-bold">🛒 案件解决方案</h3>
          <p className="mt-1 text-xs text-[var(--muted)]">以下为演示渠道，不构成购买建议</p>
          <div className="mt-3 space-y-2">
            <button type="button" className="flex min-h-12 w-full items-center justify-between rounded-2xl border border-[var(--line)] bg-white px-4 text-sm">
              <span>📋 查看同款真实案件</span>
              <span className="text-xs text-[var(--muted)]">3 个相似案件</span>
            </button>
            <button type="button" className="flex min-h-12 w-full items-center justify-between rounded-2xl border border-[var(--line)] bg-white px-4 text-sm">
              <span>🔄 看看陪审团推荐的平替</span>
              <span className="text-xs text-[var(--muted)]">2 个推荐</span>
            </button>
            <button type="button" className="flex min-h-12 w-full items-center justify-between rounded-2xl border border-[var(--line)] bg-white px-4 text-sm">
              <span>♻️ 看看二手方案</span>
              <span className="text-xs text-[var(--muted)]">演示</span>
            </button>
            <button type="button" className="flex min-h-12 w-full items-center justify-between rounded-2xl border border-[var(--line)] bg-white px-4 text-sm">
              <span>🧊 再冷静一天</span>
              <span className="text-xs text-[var(--muted)]">免费</span>
            </button>
          </div>
          <p className="mt-3 text-center text-xs text-[var(--muted)]">演示渠道 · 不接入真实支付和下单</p>
        </Card>
      )}

      <p className="mt-6 text-center text-xs leading-5 text-[var(--muted)]">
        等等法庭是娱乐化社区，不是真实法律服务。社区判决仅代表意见，不替你做决定。
      </p>

      <VerdictShareCard
        caseData={caseData}
        summary={summary}
        open={showShare}
        onClose={() => setShowShare(false)}
      />
      <ProductDecisionSheet
        open={showDecision}
        onClose={() => setShowDecision(false)}
        itemName={caseData.itemName}
        onConfirm={() => { setShowDecision(false); setShowCommerce(true); }}
      />
    </>
  );
}

function TestimonyItem({ testimony, onReply }: { testimony: DemoTestimony; onReply: () => void }) {
  return (
    <Card className="flex gap-3 p-3">
      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[var(--sage-soft)] text-lg">
        {testimony.emoji}
      </span>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <b className="text-sm">{testimony.author}</b>
          {testimony.role !== "NONE" && (
            <span className="rounded-full bg-[var(--blue-soft)] px-2 py-0.5 text-xs text-[var(--forest-deep)]">
              {witnessRoleEmoji[testimony.role]} {witnessRoleLabel[testimony.role]}
            </span>
          )}
          <span className="text-xs text-[var(--muted)]">{testimony.createdAt}</span>
        </div>
        <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{testimony.content}</p>
        <button
          type="button"
          onClick={onReply}
          className="mt-1 text-xs text-[var(--forest)]"
        >
          回应
        </button>
      </div>
    </Card>
  );
}
