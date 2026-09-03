"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Home, MessageCircle, Plus, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/app", label: "首页", icon: Home },
  { href: "/app/explore", label: "逛逛", icon: Compass },
  { href: "/app/new", label: "想买", icon: Plus, main: true },
  { href: "/app/notifications", label: "消息", icon: MessageCircle },
  { href: "/app/settings", label: "我的", icon: UserRound },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  return <div className="mx-auto min-h-dvh max-w-[480px] bg-[var(--paper)] shadow-xl">
    <main className="min-h-dvh px-5 pb-28 pt-6">{children}</main>
    <nav aria-label="主导航" className="safe-bottom fixed bottom-0 left-1/2 z-30 flex w-full max-w-[480px] -translate-x-1/2 items-end justify-around border-t border-[var(--line)] bg-[var(--paper)]/95 px-2 pt-2 backdrop-blur-xl">
      {nav.map(item => { const Icon = item.icon; const active = item.href === "/app" ? path === "/app" : path.startsWith(item.href); return <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className={cn("flex min-h-12 min-w-14 flex-col items-center justify-center gap-1 rounded-2xl text-[11px] font-medium text-[var(--muted)] transition", active && "text-[var(--forest)]", item.main && "-mt-7")}><span className={cn("grid size-10 place-items-center rounded-2xl", item.main && "size-14 bg-[var(--forest)] text-white shadow-[0_8px_24px_rgba(79,117,89,.28)]", item.main && active && "bg-[var(--orange)]")}><Icon size={item.main ? 26 : 21}/></span>{item.label}</Link>; })}
    </nav>
  </div>;
}
