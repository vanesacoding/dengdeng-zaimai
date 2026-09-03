"use client";

import Link from "next/link";
import { ChevronRight, HeartHandshake, PieChart, Shield, ShieldCheck, UserRound } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PwaManager } from "@/components/pwa-manager";
import { useLocalUser } from "@/lib/use-local-user";

export default function Settings() {
  const nickname = useLocalUser();
  return (
    <>
      <div className="flex items-center gap-4">
        <span className="grid size-16 place-items-center rounded-3xl bg-[var(--sage-soft)] text-2xl">🌿</span>
        <div>
          <h1 className="text-2xl font-bold">{nickname}</h1>
          <p className="text-sm text-[var(--muted)]">和搭子互相陪伴第 28 天</p>
        </div>
      </div>
      <div className="mt-7 space-y-3">
        <Item href="/app/budget" icon={<PieChart/>} title="月度预算" text="本月剩余 ¥1,860"/>
        <Item href="/app/relationship" icon={<HeartHandshake/>} title="我的闺蜜房" text="小满 · 已经一起 7 天"/>
        <Item href="/app/insights" icon={<Shield/>} title="我的买买买月报" text="查看消费模式"/>
        <Item href="/app/settings/community" icon={<ShieldCheck/>} title="社区与安全" text="通知偏好、拉黑管理、隐私设置"/>
        <Item href="/app/settings/privacy" icon={<UserRound/>} title="隐私与账户" text="数据权限、退出登录"/>
      </div>
      <Card className="mt-6">
        <h2 className="font-bold">把等等再买装到手机</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">安装后会全屏打开，并显示独立 App 图标。</p>
        <PwaManager/>
      </Card>
    </>
  );
}

function Item({ href, icon, title, text }: { href: string; icon: React.ReactNode; title: string; text: string }) {
  return (
    <Link href={href}>
      <Card className="mb-3 flex items-center gap-4 p-4">
        <span className="grid size-11 place-items-center rounded-2xl bg-[var(--sage-soft)] text-[var(--forest)]">{icon}</span>
        <div className="flex-1">
          <b>{title}</b>
          <p className="text-sm text-[var(--muted)]">{text}</p>
        </div>
        <ChevronRight size={18}/>
      </Card>
    </Link>
  );
}
