"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, HeartHandshake, KeyRound, LoaderCircle, Sparkles, UserRound, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getLocalPairing, setLocalPairing, findLocalPairingByPhrase } from "@/lib/local-pairing";

type Mode = "choose" | "create" | "join";
type Relation = { id: string; inviter_id: string; invitee_id: string | null; status: "PENDING" | "ACTIVE" };

const LOCAL_USER_KEY = "ddzm:user";

function generateId() {
  return (crypto as Crypto).randomUUID?.() ?? `local-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function getLocalUser(): { id: string; nickname: string } | null {
  try { const raw = localStorage.getItem(LOCAL_USER_KEY); return raw ? JSON.parse(raw) : null; } catch { return null; }
}

function setLocalUser(user: { id: string; nickname: string }) {
  localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(user));
}

function isNetworkError(msg: string) {
  return /failed to fetch|networkerror|load failed|err_|no_supabase/i.test(msg);
}

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
  const [isLocalMode, setIsLocalMode] = useState(false);
  const router = useRouter();
  const relationId = relation?.id;
  const relationStatus = relation?.status;

  // Restore local session on mount
  useEffect(() => {
    const u = getLocalUser();
    if (u) { setNickname(u.nickname); setUserId(u.id); }
    // Also check if there's an existing local pairing to resume
    const lp = getLocalPairing();
    if (lp && u) {
      const isInviter = lp.inviterId === u.id;
      const isInvitee = lp.inviteeId === u.id;
      if (isInviter || isInvitee) {
        setRelation({
          id: "local-pairing",
          inviter_id: lp.inviterId,
          invitee_id: lp.inviteeId,
          status: lp.status,
        });
        setPhrase(lp.phrase);
        setIsLocalMode(true);
      }
    }
  }, []);

  // Poll for local pairing updates (when another tab/user joins)
  useEffect(() => {
    if (!isLocalMode || relationStatus === "ACTIVE") return;
    const timer = window.setInterval(() => {
      const lp = getLocalPairing();
      if (!lp) return;
      const current = relation;
      if (!current) return;
      const changed =
        (lp.inviteeId !== current.invitee_id) ||
        (lp.status !== current.status);
      if (changed) {
        setRelation({
          id: "local-pairing",
          inviter_id: lp.inviterId,
          invitee_id: lp.inviteeId,
          status: lp.status,
        });
      }
    }, 1500);
    return () => window.clearInterval(timer);
  }, [isLocalMode, relationStatus, relation]);

  /** "我还没有搭子" — create a local user and go straight to the app */
  function startSolo() {
    if (nickname.trim().length < 2) { setMessage("先起个昵称吧（至少 2 个字）。"); return; }
    const id = userId || generateId();
    setLocalUser({ id, nickname: nickname.trim() });
    router.push("/app");
  }

  /** Local fallback pairing when cloud is unreachable */
  function submitLocal() {
    const myId = userId || generateId();
    const myNickname = nickname.trim();
    setLocalUser({ id: myId, nickname: myNickname });
    setUserId(myId);

    if (mode === "create") {
      const existing = findLocalPairingByPhrase(phrase);
      if (existing) {
        setMessage("这个暗号已经被使用了，换一个吧。");
        return;
      }
      const pairing = {
        phrase,
        inviterId: myId,
        inviterNickname: myNickname,
        inviteeId: null,
        inviteeNickname: null,
        status: "PENDING" as const,
        createdAt: Date.now(),
      };
      setLocalPairing(pairing);
      setRelation({ id: "local-pairing", inviter_id: myId, invitee_id: null, status: "PENDING" });
      setIsLocalMode(true);
    } else {
      const existing = findLocalPairingByPhrase(phrase);
      if (!existing) {
        setMessage("没找到这个暗号。请检查输入是否正确，或让朋友先创建暗号。");
        return;
      }
      if (existing.inviterId === myId) {
        setMessage("不能加入自己创建的暗号哦。");
        return;
      }
      if (existing.inviteeId && existing.inviteeId !== myId) {
        setMessage("这个暗号已经被别人使用了。让朋友重新创建一个吧。");
        return;
      }
      const updated = { ...existing, inviteeId: myId, inviteeNickname: myNickname };
      setLocalPairing(updated);
      setRelation({ id: "local-pairing", inviter_id: existing.inviterId, invitee_id: myId, status: "PENDING" });
      setIsLocalMode(true);
    }
  }

  async function submit() {
    if (nickname.trim().length < 2) return setMessage("先起个昵称吧（至少 2 个字）。");
    if (phrase.replace(/\s/g, "").length < 4) return setMessage("共同暗号至少需要 4 个字。");
    setBusy(true); setMessage("");
    try {
      const supabase = createClient();
      if (!supabase) throw new Error("NO_SUPABASE");

      let { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        const { data, error } = await supabase.auth.signInAnonymously({ options: { data: { nickname: nickname.trim() } } });
        if (error) throw error;
        sessionData = { session: data.session };
      }
      const id = sessionData.session?.user.id;
      if (!id) throw new Error("无法创建临时账户");
      await supabase.from("profiles").update({ nickname: nickname.trim() }).eq("id", id);
      setUserId(id);

      const fn = mode === "create" ? "create_pairing_phrase" : "join_pairing_phrase";
      const args = mode === "create" ? { p_phrase: phrase, p_relationship_name: "省钱搭子" } : { p_phrase: phrase };
      const { data: relId, error } = await supabase.rpc(fn, args);
      if (error) throw error;
      const { data, error: readError } = await supabase.from("supervision_relationships").select("id,inviter_id,invitee_id,status").eq("id", relId).single();
      if (readError) throw readError;
      setRelation(data as Relation);
    } catch (error) {
      const msg = errorMessage(error);
      if (isNetworkError(msg)) {
        // Auto-fallback to local pairing mode
        submitLocal();
      } else {
        setMessage(msg);
      }
    } finally { setBusy(false); }
  }

  function confirmLocal() {
    const lp = getLocalPairing();
    if (!lp) return;
    const updated = { ...lp, status: "ACTIVE" as const };
    setLocalPairing(updated);
    setRelation({ id: "local-pairing", inviter_id: lp.inviterId, invitee_id: lp.inviteeId, status: "ACTIVE" });
  }

  async function confirm() {
    if (!relation) return;
    setBusy(true); setMessage("");
    if (isLocalMode) {
      confirmLocal();
      setBusy(false);
      return;
    }
    const supabase = createClient();
    if (supabase) {
      const { error } = await supabase.rpc("confirm_pairing", { p_relationship_id: relation.id });
      setBusy(false);
      if (error) {
        if (isNetworkError(error.message)) { confirmLocal(); return; }
        return setMessage(error.message);
      }
    } else {
      setBusy(false);
    }
    setRelation({ ...relation, status: "ACTIVE" });
  }

  // ---- Relation status screen (waiting / confirmed) ----
  if (relation) {
    const isCreator = relation.inviter_id === userId;
    const friendArrived = Boolean(relation.invitee_id);
    const active = relation.status === "ACTIVE";
    const lp = isLocalMode ? getLocalPairing() : null;
    const friendName = isLocalMode
      ? (isCreator ? lp?.inviteeNickname : lp?.inviterNickname) || "朋友"
      : "朋友";

    return (
      <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6 py-10 text-center">
        <span className="mx-auto grid size-20 place-items-center rounded-full bg-[var(--sage-soft)] text-[var(--forest)]">{active ? <Check size={38}/> : <HeartHandshake size={36}/>}</span>
        <h1 className="mt-6 text-3xl font-bold">{active ? "你们已经绑定好啦" : friendArrived ? "朋友已经找到你" : "正在等待朋友"}</h1>
        <p className="mt-3 leading-7 text-[var(--muted)]">
          {active
            ? "以后可以互相提交购买申请，也可以随时解除关系。"
            : isCreator
              ? friendArrived
                ? `确认这是${friendName}后，就可以开始互相陪伴。`
                : "让朋友在自己的设备上输入同一个暗号。暗号 10 分钟后失效。"
              : `已通知暗号发起人，等待对方确认。`}
        </p>
        {!active && isCreator && !friendArrived && (
          <Card className="mt-6">
            <p className="text-sm text-[var(--muted)]">你们的共同暗号</p>
            <p className="mt-2 break-all text-2xl font-bold text-[var(--forest)]">{phrase}</p>
            <p className="mt-3 text-xs text-[var(--muted)]">请当面或通过可信聊天发送给朋友</p>
          </Card>
        )}
        {isLocalMode && !active && (
          <div className="mt-4 rounded-2xl bg-[var(--sage-soft)] p-3 text-xs text-[var(--forest-deep)]">
            💡 本地体验模式：暗号只在当前浏览器有效。你可以打开一个新的隐身窗口，用另一个昵称输入同一暗号来模拟朋友加入。
          </div>
        )}
        {!active && isCreator && friendArrived && (
          <Button className="mt-7 w-full" onClick={confirm} disabled={busy}>{busy ? <LoaderCircle className="animate-spin"/> : <Check/>}确认是我的朋友</Button>
        )}
        {active && <Button className="mt-7 w-full" onClick={() => router.push("/app")}>进入等等再买</Button>}
        {!active && <Button variant="ghost" className="mt-3 w-full" onClick={startSolo}>先去体验</Button>}
        {message && <p role="alert" className="mt-4 rounded-2xl bg-[#fce8e3] p-4 text-sm text-[#9d3b2b]">{message}</p>}
      </main>
    );
  }

  // ---- Login form ----
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6 py-10">
      <Link href="/" className="mb-8 text-sm text-[var(--forest)]">← 返回</Link>
      <span className="grid size-12 place-items-center rounded-2xl bg-[var(--forest)] font-bold text-white">等</span>
      <h1 className="mt-5 text-4xl font-bold">先认识一下</h1>
      <p className="mt-3 leading-7 text-[var(--muted)]">不用邮箱。取一个朋友认得出的昵称，再选择你的开始方式。</p>
      <label className="mt-7 mb-2 text-sm font-semibold">朋友怎么称呼你？</label>
      <div className="relative"><UserRound className="absolute left-4 top-3.5 text-[var(--muted)]" size={20}/><Input className="pl-12" value={nickname} onChange={e => setNickname(e.target.value)} placeholder="例如：小满" maxLength={20}/></div>

      {mode === "choose" ? (
        <div className="mt-6 grid gap-3">
          <Button className="h-14" onClick={() => setMode("create")}><Sparkles/>创建共同暗号</Button>
          <Button className="h-14" variant="outline" onClick={() => setMode("join")}><KeyRound/>输入朋友的暗号</Button>
          <div className="mt-1 flex items-center gap-3">
            <span className="h-px flex-1 bg-[var(--line)]"/>
            <span className="text-xs text-[var(--muted)]">或者</span>
            <span className="h-px flex-1 bg-[var(--line)]"/>
          </div>
          <Button className="h-14" variant="ghost" onClick={startSolo}><Users/>我还没有搭子</Button>
        </div>
      ) : (
        <>
          <label className="mt-6 mb-2 text-sm font-semibold">{mode === "create" ? "设置一个共同暗号" : "朋友告诉你的暗号"}</label>
          <Input value={phrase} onChange={e => setPhrase(e.target.value)} placeholder="例如：麻利麻利哄" maxLength={30}/>
          <p className="mt-2 text-xs text-[var(--muted)]">4～20 个字，10 分钟有效；不要使用银行卡或账户密码。</p>
          <Button className="mt-5 w-full" onClick={submit} disabled={busy}>{busy ? <LoaderCircle className="animate-spin"/> : <HeartHandshake/>}{mode === "create" ? "生成暗号并等待朋友" : "用暗号找到朋友"}</Button>
          <Button className="mt-2 w-full" variant="ghost" onClick={() => { setMode("choose"); setMessage(""); }}>换一种方式</Button>
        </>
      )}
      {message && <p role="alert" className="mt-4 rounded-2xl bg-[#fce8e3] p-4 text-sm text-[#9d3b2b]">{message}</p>}
      <p className="mt-6 text-center text-xs leading-5 text-[var(--muted)]">当前设备会保存临时账户。正式使用前可绑定手机号或邮箱，以便换设备后找回。</p>
    </main>
  );
}
