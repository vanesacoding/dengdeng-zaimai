import { closedCaseLabel, plotTwistLabel, type PlotTwistType, type ResultType } from "@/lib/domain";

export function CaseOutcomePreview({
  resultType,
  plotTwist,
  hasFollowUp,
}: {
  resultType?: ResultType;
  plotTwist?: PlotTwistType | string;
  hasFollowUp?: boolean;
}) {
  if (!resultType) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      <span className="rounded-full bg-[var(--sage-soft)] px-3 py-1 text-xs font-semibold text-[var(--forest)]">
        📁 {closedCaseLabel[resultType]}
      </span>
      {plotTwist && (
        <span className="rounded-full bg-[var(--lemon-soft)] px-3 py-1 text-xs font-bold text-[var(--orange-deep)]">
          🔄 {typeof plotTwist === "string" ? plotTwist : plotTwistLabel[plotTwist]}
        </span>
      )}
      {hasFollowUp && (
        <span className="rounded-full bg-[var(--blue-soft)] px-3 py-1 text-xs text-[var(--forest-deep)]">
          本案有后续
        </span>
      )}
    </div>
  );
}
