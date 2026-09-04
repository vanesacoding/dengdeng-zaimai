"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, HeartHandshake, ListChecks, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useLocalUser } from "@/lib/use-local-user";

export default function Settings() {
  const nickname = useLocalUser();
  const router = useRouter();

  async function signOut() {
    localStorage.removeItem("ddzm:user");
    const supabase = createClient();
    if (supabase) await supabase.auth.signOut();
    router.replace("/login");
  }

  return <>
    <div className="flex items-center gap-3">
      <span className="grid size-11 place-items-center rounded-full bg-[var(--sage-soft)] text-lg">🌿</span>
      <div><h1 className="font-bold">{nickname}</h1><p className="mt-0.5 text-[11px] text-[var(--muted)]">和闺蜜互相参谋中</p></div>
    </div>

    <div className="mt-5 overflow-hidden rounded-2xl border border-[var(--line)] bg-white">
      <Item href="/app/relationship" icon={<HeartHandshake size={17}/>} title="我的闺蜜" />
      <Item href="/app/requests" icon={<ListChecks size={17}/>} title="我的记录" last />
    </div>

    <button type="button" onClick={signOut} className="mt-5 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl text-xs text-[var(--muted)]">
      <LogOut size={15}/>退出登录
    </button>
  </>;
}

function Item({ href, icon, title, last = false }: { href: string; icon: React.ReactNode; title: string; last?: boolean }) {
  return <Link href={href} className={`flex min-h-14 items-center gap-3 px-4 ${last ? "" : "border-b border-[var(--line)]"}`}>
    <span className="text-[var(--forest)]">{icon}</span><b className="flex-1 text-[13px]">{title}</b><ChevronRight size={15} className="text-[var(--muted)]"/>
  </Link>;
}
