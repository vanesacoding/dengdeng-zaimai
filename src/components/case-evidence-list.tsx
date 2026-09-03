import type { EvidenceType } from "@/lib/domain";

type Evidence = { type: EvidenceType; text: string };

export function CaseEvidenceList({ evidence }: { evidence: Evidence[] }) {
  if (!evidence.length) return null;
  return (
    <div className="rounded-2xl bg-[var(--cream)] p-4">
      <p className="mb-2 text-xs font-semibold text-[var(--muted)]">关键证据</p>
      <ul className="space-y-1.5">
        {evidence.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm leading-6">
            <span className="mt-1 text-xs text-[var(--sage)]">•</span>
            <span className="text-[var(--ink)]">{item.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
