import { caseStatusEmoji, caseStatusLabel, type CaseStatus } from "@/lib/domain";

export function CaseStatusBadge({ status, className }: { status: CaseStatus; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full bg-[var(--cream)] px-2.5 py-1 text-xs font-semibold text-[var(--muted)] ${className ?? ""}`}>
      <span>{caseStatusEmoji[status]}</span>
      {caseStatusLabel[status]}
    </span>
  );
}
