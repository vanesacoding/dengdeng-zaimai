import { verdictLabel, verdictEmoji, type VerdictSummary } from "@/lib/domain";

export function JurySummary({ summary, compact }: { summary: VerdictSummary; compact?: boolean }) {
  if (compact) {
    return (
      <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
        <span className="text-[var(--forest)] font-semibold">{summary.approvePct}% 批准</span>
        <span>·</span>
        <span className="text-[var(--orange)] font-semibold">{summary.coolingPct}% 冷静</span>
        <span>·</span>
        <span className="text-red-400 font-semibold">{summary.rejectPct}% 驳回</span>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-[var(--cream)] p-4">
      <p className="mb-3 text-xs font-semibold text-[var(--muted)]">陪审团意见</p>
      {/* Vote bars */}
      <div className="space-y-2">
        <VoteBar label="批准，她值得" pct={summary.approvePct} color="bg-[var(--forest)]" />
        <VoteBar label="判处冷静三天" pct={summary.coolingPct} color="bg-[var(--orange)]" />
        <VoteBar label="驳回，保护钱包" pct={summary.rejectPct} color="bg-red-300" />
      </div>
      {/* Majority verdict */}
      <div className="mt-3 flex items-center gap-2 border-t border-[var(--line)] pt-3">
        <span className="text-base">{verdictEmoji[summary.majorityVerdict]}</span>
        <span className="text-sm font-bold text-[var(--forest)]">{verdictLabel[summary.majorityVerdict]}</span>
      </div>
      {summary.totalVerdictVotes > 0 && (
        <p className="mt-1 text-xs text-[var(--muted)]">{summary.totalVerdictVotes} 人参与投票</p>
      )}
    </div>
  );
}

function VoteBar({ label, pct, color }: { label: string; pct: number; color: string }) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-[var(--muted)]">{label}</span>
        <span className="font-semibold">{pct}%</span>
      </div>
      <div className="mt-1 h-2 rounded-full bg-white/80">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
