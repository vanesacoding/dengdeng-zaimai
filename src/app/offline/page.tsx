import Link from "next/link";
import { WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Offline() {
  return <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-6 text-center">
    <span className="grid size-20 place-items-center rounded-full bg-[var(--sage-soft)] text-[var(--forest)]"><WifiOff size={34}/></span>
    <h1 className="mt-6 text-3xl font-bold">现在没有网络</h1>
    <p className="mt-3 leading-7 text-[var(--muted)]">你的账户数据没有丢失。网络恢复后，再回来继续就好。</p>
    <Button asChild className="mt-7"><Link href="/">重新尝试</Link></Button>
  </main>;
}
