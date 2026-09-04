"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Copy, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getLocalPairing, type LocalPairing } from "@/lib/local-pairing";
import { useLocalUser } from "@/lib/use-local-user";

export default function Relationship() {
  const nickname = useLocalUser();
  const [pairing, setPairing] = useState<LocalPairing | null>(null);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPairing(getLocalPairing());
  }, []);
  const friend = pairing?.inviterNickname === nickname ? pairing.inviteeNickname : pairing?.inviterNickname;

  async function copyPhrase() {
    if (!pairing?.phrase) return;
    await navigator.clipboard.writeText(pairing.phrase);
    setCopied(true);
  }

  return <>
    <header><p className="text-[11px] text-[var(--muted)]">我的</p><h1 className="mt-0.5 font-black">我的闺蜜</h1></header>
    <section className="mt-4 rounded-2xl border border-[var(--line)] bg-white p-4 text-center">
      <div className="mx-auto grid size-14 place-items-center rounded-full bg-[var(--sage-soft)] text-2xl">{friend ? "👭" : "✨"}</div>
      <b className="mt-2 block text-[14px]">{friend || "还没有绑定闺蜜"}</b>
      <p className="mt-1 text-[11px] text-[var(--muted)]">{friend ? "你们正在互相参谋" : "设置共同暗号，就能找到彼此"}</p>
      {pairing?.phrase ? <Button variant="outline" className="mt-4 w-full" onClick={copyPhrase}><Copy size={15}/>{copied ? "已复制" : `复制暗号：${pairing.phrase}`}</Button> : <Button asChild className="mt-4 w-full"><Link href="/login"><UserPlus size={15}/>去绑定闺蜜</Link></Button>}
    </section>
  </>;
}
