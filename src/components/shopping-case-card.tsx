"use client";

import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatMoney } from "@/lib/utils";
import {
  channelEmoji,
  channelLabel,
  formatCaseNumberDisplay,
  isCommercialSource,
  summarizeVerdict,
  type ReactionType,
} from "@/lib/domain";
import type { ShoppingCase } from "@/lib/case-demo-data";
import { CaseStatusBadge } from "./case-status-badge";
import { CaseEvidenceList } from "./case-evidence-list";
import { JurySummary } from "./jury-summary";
import { CaseOutcomePreview } from "./case-outcome-preview";
import { useBookmarks, useFollowUps, useReactions } from "@/lib/public-api";

const reactionButtons: { type: ReactionType; emoji: string }[] = [
  { type: "WORTH_IT", emoji: "✅" },
  { type: "WAIT", emoji: "🧊" },
  { type: "RUN_AWAY", emoji: "🛡️" },
  { type: "SAME_DESIRE", emoji: "🤩" },
  { type: "FOLLOW_UP", emoji: "👀" },
];

type Props = {
  caseData: ShoppingCase;
  detailLink?: string;
  showFullEvidence?: boolean;
  showReactions?: boolean;
};

export function ShoppingCaseCard({
  caseData,
  detailLink,
  showFullEvidence = false,
  showReactions = true,
}: Props) {
  const { has: hasReaction, toggle: toggleReaction } = useReactions();
  const { isSaved, toggle: toggleBookmark } = useBookmarks();
  const { isFollowing, toggle: toggleFollow } = useFollowUps();

  const summary = summarizeVerdict(caseData.voteCounts);
  const isSponsored = isCommercialSource(caseData.contentSource);
  const isBookmarked = isSaved(caseData.caseId);
  const isFollowingCase = isFollowing(caseData.caseId);

  return (
    <Card className="overflow-hidden p-0">
      <div className="p-4">
        {/* Row 1: Case number + status */}
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-[var(--ink)] px-3 py-1 text-xs font-bold text-white">
            {formatCaseNumberDisplay(caseData.caseNumber)}
          </span>
          <CaseStatusBadge status={caseData.caseStatus} />
        </div>

        {/* Row 2: User info */}
        <div className="mt-3 flex items-center gap-1.5 text-xs text-[var(--muted)]">
          <span className="grid size-6 place-items-center rounded-full bg-[var(--sage-soft)] text-xs">
            {caseData.userEmoji}
          </span>
          <b className="text-[var(--forest)]">{caseData.isAnonymous ? "匿名当事人" : caseData.user}</b>
          <span>·</span>
          <span>{caseData.createdAt}</span>
        </div>

        {/* Row 3: Funny case title — main visual focus */}
        <h2 className="mt-3 text-lg font-black leading-7 text-[var(--ink)]">
          {caseData.title}
        </h2>

        {/* Row 4: Statement */}
        <div className="mt-3 rounded-2xl bg-[var(--cream)] p-4">
          <p className="mb-1 text-xs font-semibold text-[var(--muted)]">当事人陈述</p>
          <p className="text-sm leading-6 text-[var(--ink)]">&ldquo;{caseData.statement}&rdquo;</p>
        </div>

        {/* Row 5: Evidence (compact or full) */}
        {showFullEvidence && caseData.evidence.length > 0 ? (
          <div className="mt-3">
            <CaseEvidenceList evidence={caseData.evidence} />
          </div>
        ) : caseData.evidence.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {caseData.evidence.slice(0, 3).map((e, i) => (
              <span key={i} className="rounded-full bg-[var(--cream)] px-2.5 py-1 text-xs text-[var(--muted)]">
                {e.text}
              </span>
            ))}
            {caseData.evidence.length > 3 && (
              <span className="rounded-full bg-[var(--cream)] px-2.5 py-1 text-xs text-[var(--muted)]">
                +{caseData.evidence.length - 3}
              </span>
            )}
          </div>
        ) : null}

        {/* Sponsored badge */}
        {isSponsored && (
          <div className="mt-3 rounded-2xl bg-[var(--lemon-soft)] p-3">
            <p className="text-xs font-bold text-[var(--orange-deep)]">⚠️ 品牌送审 · 合作内容</p>
            {caseData.sponsorDisclosure && (
              <p className="mt-1 text-xs text-[var(--muted)]">{caseData.sponsorDisclosure}</p>
            )}
          </div>
        )}

        {/* Demo badge */}
        {caseData.isDemo && (
          <span className="mt-3 inline-block rounded-full bg-[var(--blue-soft)] px-2.5 py-1 text-xs text-[var(--forest-deep)]">
            体验案件
          </span>
        )}
      </div>

      {/* Row 6: Product visual — below story */}
      <div className={`grid h-32 place-items-center ${caseData.tint} text-6xl`}>
        {caseData.itemEmoji}
      </div>

      {/* Row 7: Product info */}
      <div className="p-4 pt-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-[var(--muted)]">涉案商品</p>
            <b className="text-sm">{caseData.itemName}</b>
          </div>
          <span className="text-sm font-bold">{formatMoney(caseData.priceCents)}</span>
        </div>

        {/* Row 8: Jury summary */}
        <div className="mt-3">
          <JurySummary summary={summary} compact={!showFullEvidence} />
        </div>

        {/* Row 9: Comments + outcome */}
        <div className="mt-3 flex items-center justify-between border-t border-[var(--line)] pt-3">
          <div className="flex items-center gap-3 text-xs text-[var(--muted)]">
            <span className="flex items-center gap-1">
              <MessageCircle size={14} />
              {caseData.commentCount} 条证词
            </span>
            <span className="flex items-center gap-1">
              <span>{channelEmoji[caseData.channel]}</span>
              {channelLabel[caseData.channel]}
            </span>
          </div>
          <span className={`grid size-9 place-items-center transition ${isBookmarked ? "text-[var(--forest)]" : "text-[var(--muted)]"}`}>
            {isBookmarked ? "⭐" : "☆"}
          </span>
        </div>

        {/* Row 10: Outcome preview */}
        <div className="mt-3">
          <CaseOutcomePreview
            resultType={caseData.resultType}
            plotTwist={caseData.plotTwist}
            hasFollowUp={caseData.hasFollowUp}
          />
        </div>

        {/* Detail link */}
        {detailLink && (
          <Link
            href={detailLink}
            className="mt-3 flex min-h-11 w-full items-center justify-center rounded-2xl bg-[var(--sage-soft)] text-sm font-semibold text-[var(--forest)]"
          >
            查看案件详情 →
          </Link>
        )}
      </div>

      {/* Reaction bar */}
      {showReactions && (
        <div className="flex items-center justify-between border-t border-[var(--line)] px-4 pb-4">
          <div className="flex items-center gap-0">
            {reactionButtons.map(({ type, emoji }) => (
              <button
                type="button"
                key={type}
                onClick={() => toggleReaction(caseData.caseId, type)}
                className={`flex min-h-11 items-center gap-1 rounded-full px-2.5 text-sm transition ${
                  hasReaction(caseData.caseId, type)
                    ? "bg-[var(--orange-soft)] font-semibold text-[var(--orange-deep)]"
                    : "text-[var(--muted)]"
                }`}
              >
                <span className="text-base">{emoji}</span>
                <span className="text-xs hidden sm:inline">
                  {type === "WORTH_IT" ? "批准" : type === "WAIT" ? "冷静" : type === "RUN_AWAY" ? "驳回" : type === "SAME_DESIRE" ? "也想买" : "蹲后续"}
                </span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-0">
            <button
              type="button"
              onClick={() => toggleFollow(caseData.caseId)}
              className={`flex min-h-11 items-center gap-1 rounded-full px-2.5 text-sm transition ${
                isFollowingCase ? "text-[var(--forest)] font-semibold" : "text-[var(--muted)]"
              }`}
            >
              <span className="text-xs">{isFollowingCase ? "已蹲" : "蹲后续"}</span>
            </button>
            <button
              type="button"
              aria-label={isBookmarked ? "已收藏" : "收藏本案"}
              onClick={() => toggleBookmark(caseData.caseId)}
              className={`grid size-11 place-items-center transition ${isBookmarked ? "text-[var(--forest)]" : "text-[var(--muted)]"}`}
            >
              {isBookmarked ? "⭐" : "☆"}
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}
