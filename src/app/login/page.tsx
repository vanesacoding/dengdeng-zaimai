"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, HeartHandshake, KeyRound, LoaderCircle, Sparkles, UserRound } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type Mode = "choose" | "create" | "join";
type Relation = { id: string; inviter_id: string; invitee_id: string | null; status: "PENDING" | "ACTIVE" };
function errorMessage(error: unknown) {
  if (error && typeof error === "object" && "message" in error && typeof error.message === "string") return error.message;
  return "暂时没能完成，请稍后再试。";
}

export default function Login() {
  const [nickname, setNickname] = useState("");
  const [phrase, setPhrase] = useState("");
  const [mode, setMode] = useState<Mode>("choose");
  const [relation, setRelation] = useState<Relation | null>(null);
  const [userId, setUserId] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();
  const relationId = relation?.id;
  const relationStatus = relation?.status;

  useEffect(() => {
    if (!relationId || relationStatus === "ACTIVE") return;
    const supabase = createClient();
    if (!supabase) return;
    const timer = window.setInterval(async () => {
      const { data } = await supabase.from("supervision_relationships").select("id,inviter_id,invitee_id,status").eq("id", relationId).single();
      if (data) setRelation(data as Relation);
    }, 2000);
    return () => window.clearInterval(timer);
  }, [relationId, relationStatus]);

  async function ensureAnonymousUser() {
    const supabase = createClient();
    if (!supabase) throw new Error("Supabase 尚未连接");
    let { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      const { data, error } = await supabase.auth.signInAnonymously({ options: { data: { nickname: nickname.trim() } } });
      if (error) throw error;
      sessionData = { session: data.session };
    }
    const id = sessionData.session?.user.id;
    if (!id) throw new Error("无法创建临时账户");
    const { error: profileError } = await supabase.from("profiles").update({ nickname: nickname.trim() }).eq("id", id);
    if (profileError) throw profileError;
    setUserId(id);
    return { supabase, id };
  }

  async function submit() {
    if (nickname.trim().length < 2) return setMessage("先告诉朋友怎么称呼你吧（至少 2 个字）。");
    if (phrase.replace(/\s/g, "").length < 4) return setMessage("共同暗号至少需要 4 个字。 ");
    setBusy(true); setMessage("");
    try {
      const { supabase } = await ensureAnonymousUser();
      const fn = mode === "create" ? "create_pairing_phrase" : "join_pairing_phrase";
      const args = mode === "create" ? { p_phrase: phrase, p_relationship_name: "省钱搭子" } : { p_phrase: phrase };
      const { data: id, error } = await supabase.rpc(fn, args);
      if (error) throw error;
      const { data, error: readError } = await supabase.from("supervision_relationships").select("id,inviter_id,invitee_id,status").eq("id", id).single();
      if (readError) throw readError;
      setRelation(data as Relation);
    } catch (error) {
      setMessage(errorMessage(error));
    } finally { setBusy(false); }
  }

  async function confirm() {
    if (!relation) return;
    setBusy(true); setMessage("");
    const supabase = createClient();
    const { error } = supabase ? await supabase.rpc("confirm_pairing", { p_relationship_id: relation.id }) : { error: new Error("Supabase 尚未连接") };
    setBusy(false);
    if (error) return setMessage(error.message);
    setRelation({ ...relation, status: "ACTIVE" });
  }

  if (relation) {
    const isCreator = relation.inviter_id === userId;
    const friendArrived = Boolean(relation.invitee_id);
    const active = relation.status === "ACTIVE";
    return <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6 py-10 text-center">
      <span className="mx-auto grid size-20 place-items-center rounded-full bg-[var(--sage-soft)] text-[var(--forest)]">{active ? <Check size={38}/> : <HeartHandshake size={36}/>}</span>
      <h1 className="mt-6 text-3xl font-bold">{active ? "你们已经绑定好啦" : friendArrived ? "朋友已经找到你" : "正在等待朋友"}</h1>
      <p className="mt-3 leading-7 text-[var(--muted)]">{active ? "以后可以互相提交购买申请，也可以随时解除关系。" : isCreator ? friendArrived ? "确认这是你邀请的朋友后，就可以开始互相陪伴。" : "让朋友在自己的设备上输入同一个暗号。暗号 10 分钟后失效。" : "已通知暗号发起人，等待对方确认。"}</p>
      {!active && isCreator && !friendArrived && <Card className="mt-6"><p className="text-sm text-[var(--muted)]">你们的共同暗号</p><p className="mt-2 break-all text-2xl font-bold text-[var(--forest)]">{phrase}</p><p className="mt-3 text-xs text-[var(--muted)]">请当面或通过可信聊天发送给朋友</p></Card>}
      {!active && isCreator && friendArrived && <Button className="mt-7 w-full" onClick={confirm} disabled={busy}>{busy ? <LoaderCircle className="animate-spin"/> : <Check/>}确认是我的朋友</Button>}
      {active && <Button className="mt-7 w-full" onClick={() => router.push("/app")}>进入等等再买</Button>}
      {message && <p role="alert" className="mt-4 rounded-2xl bg-[#fce8e3] p-4 text-sm text-[#9d3b2b]">{message}</p>}
    </main>;
  }

  return <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6 py-10">
    <Link href="/" className="mb-8 text-sm text-[var(--forest)]">← 返回</Link>
    <span className="grid size-12 place-items-center rounded-2xl bg-[var(--forest)] font-bold text-white">等</span>
    <h1 className="mt-5 text-4xl font-bold">先认识一下</h1>
    <p className="mt-3 leading-7 text-[var(--muted)]">不用邮箱。取一个朋友认得出的昵称，再用只有你们知道的暗号碰头。</p>
    <label className="mt-7 mb-2 text-sm font-semibold">朋友怎么称呼你？</label>
    <div className="relative"><UserRound className="absolute left-4 top-3.5 text-[var(--muted)]" size={20}/><Input className="pl-12" value={nickname} onChange={e => setNickname(e.target.value)} placeholder="例如：小满" maxLength={20}/></div>
    {mode === "choose" ? <div className="mt-6 grid gap-3">
      <Button className="h-14" onClick={() => setMode("create")}><Sparkles/>创建共同暗号</Button>
      <Button className="h-14" variant="outline" onClick={() => setMode("join")}><KeyRound/>输入朋友的暗号</Button>
    </div> : <>
      <label className="mt-6 mb-2 text-sm font-semibold">{mode === "create" ? "设置一个共同暗号" : "朋友告诉你的暗号"}</label>
      <Input value={phrase} onChange={e => setPhrase(e.target.value)} placeholder="例如：麻利麻利哄" maxLength={30}/>
      <p className="mt-2 text-xs text-[var(--muted)]">4～20 个字，10 分钟有效；不要使用银行卡或账户密码。</p>
      <Button className="mt-5 w-full" onClick={submit} disabled={busy}>{busy ? <LoaderCircle className="animate-spin"/> : <HeartHandshake/>}{mode === "create" ? "生成暗号并等待朋友" : "用暗号找到朋友"}</Button>
      <Button className="mt-2 w-full" variant="ghost" onClick={() => { setMode("choose"); setMessage(""); }}>换一种方式</Button>
    </>}
    {message && <p role="alert" className="mt-4 rounded-2xl bg-[#fce8e3] p-4 text-sm text-[#9d3b2b]">{message}</p>}
    <p className="mt-6 text-center text-xs leading-5 text-[var(--muted)]">当前设备会保存临时账户。正式使用前可绑定手机号或邮箱，以便换设备后找回。</p>
  </main>;
}
