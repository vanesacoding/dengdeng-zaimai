"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardCheck, Scale, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/app", label: "审批", icon: ClipboardCheck },
  { href: "/app/explore", label: "法庭", icon: Scale },
  { href: "/app/settings", label: "我的", icon: UserRound },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  return <div className="mx-auto min-h-dvh max-w-[480px] bg-[var(--paper)] shadow-xl">
    <main className="app-main min-h-dvh px-4 pb-24 pt-5">{children}</main>
    <nav aria-label="主导航" className="safe-bottom fixed bottom-0 left-1/2 z-30 flex w-full max-w-[480px] -translate-x-1/2 justify-around border-t border-[var(--line)] bg-[var(--paper)]/96 px-5 pt-1.5 backdrop-blur-xl">
      {nav.map(item => { const Icon = item.icon; const active = item.href === "/app" ? path === "/app" : path.startsWith(item.href); return <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className={cn("flex min-h-12 min-w-20 flex-col items-center justify-center gap-0.5 rounded-xl text-[10px] font-medium text-[var(--muted)] transition", active && "text-[var(--forest)]")}><span className={cn("grid size-7 place-items-center rounded-xl", active && "bg-[var(--sage-soft)]")}><Icon size={19}/></span>{item.label}</Link>; })}
    </nav>
  </div>;
}
