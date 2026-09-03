import { demoCases } from "@/lib/case-demo-data";
import { CaseDetail } from "./case-detail";

export function generateStaticParams() {
  return demoCases.map(c => ({ id: c.caseId }));
}

export default async function CaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CaseDetail id={id} />;
}
