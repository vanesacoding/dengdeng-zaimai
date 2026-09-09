"use client";

import { Suspense } from "react";
import Link from "next/link";
import { Check, Clock3, Scale } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

function SubmittedContent() {
  const searchParams = useSearchParams();
  const isCourt = searchParams.get("target") === "court";

  const content = isCourt
    ? {
        title: "已递交等等法庭",
        description: "你的购物案已经公开，等陪审团来评评理。",
        status: "等待陪审团开票",
        hint: "有人投票或评论时会提醒你",
        primaryHref: "/app/explore",
        primaryLabel: "去法庭看看",
        secondaryLabel: "查看我的记录",
      }
    : {
        title: "已经喊她来参谋啦",
        description: "你的这次心动已经记下。先去做点别的，等她来跟你说两句。",
        status: "等闺蜜一句话",
        hint: "有新消息时会提醒你",
        primaryHref: "/app",
        primaryLabel: "回首页等她",
        secondaryLabel: "看看我的想买记录",
      };

  const StatusIcon = isCourt ? Scale : Clock3;

  return (
    <div className="flex min-h-[75dvh] flex-col items-center justify-center text-center">
      <span className="grid size-20 place-items-center rounded-full bg-[var(--sage-soft)] text-[var(--forest)]">
        <Check size={38} />
      </span>
      <h1 className="mt-6 text-2xl font-black">{content.title}</h1>
      <p className="mt-3 max-w-xs leading-7 text-[var(--muted)]">{content.description}</p>
      <Card className="mt-7 flex w-full items-center gap-4 text-left">
        <StatusIcon className="text-[var(--orange)]" />
        <div>
          <b>{content.status}</b>
          <p className="text-sm text-[var(--muted)]">{content.hint}</p>
        </div>
      </Card>
      <Button asChild className="mt-7 w-full">
        <Link href={content.primaryHref}>{content.primaryLabel}</Link>
      </Button>
      <Button asChild variant="ghost" className="mt-2 w-full">
        <Link href="/app/requests">{content.secondaryLabel}</Link>
      </Button>
    </div>
  );
}

export default function SubmittedPage() {
  return (
    <Suspense fallback={null}>
      <SubmittedContent />
    </Suspense>
  );
}
