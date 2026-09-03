import { demoRequests } from "@/lib/mock-data";
import { RequestDetail } from "./request-detail";

export function generateStaticParams() {
  return demoRequests.map(request => ({ id: request.id }));
}

export default async function DetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <RequestDetail id={id} />;
}
