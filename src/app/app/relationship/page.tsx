"use client";

import { useState } from "react";
import {
  Bell, ChevronRight, Copy, Link2, LogOut,
  Palette, Plus, Shield
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatMoney } from "@/lib/utils";

// Demo data — will be replaced by Supabase queries when available
const roomData = {
  name: "我们的小房间",
  avatarEmoji: "👭",
  themeColor: "#4F7559",
  members: [
    { id: "u1", name: "我", emoji: "✨", role: "admin", joinedDays: 7 },
    { id: "u2", name: "小满", emoji: "🌸", role: "member", joinedDays: 7 },
  ],
  stats: {
    consecutiveDays: 7,
    monthlyPullGrassCents: 29900,
    mutualReviews: 5,
    sharedWishlist: 3,
  },
  wishlist: [
    { emoji: "📷", name: "口袋照片打印机", priceCents: 69900, who: "我" },
    { emoji: "🎨", name: "水彩颜料套装", priceCents: 26800, who: "小满" },
    { emoji: "🎧", name: "降噪耳机", priceCents: 89900, who: "我" },
  ],
  recentActivity: [
    { type: "review", text: "小满对你的「降噪耳机」说：不拦你，但答应我多想一天", time: "12 分钟前" },
    { type: "result", text: "小满成功拔草了「咖啡机」", time: "2 小时前" },
    { type: "new", text: "小满晒了新的想买：手工巧克力礼盒", time: "3 小时前" },
  ],
};

export default function Relationship() {
  const [code, setCode] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [roomName, setRoomName] = useState(roomData.name);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  return (
    <>
      <header>
        <p className="text-sm text-[var(--muted)]">闺蜜房</p>
        <h1 className="mt-1 text-3xl font-black">{roomData.name}</h1>
      </header>

      {/* Room hero card */}
      <Card className="mt-6 border-0 bg-[var(--lemon-soft)] p-6 text-center">
        <span
          className="mx-auto grid size-16 place-items-center rounded-full bg-white text-3xl"
          style={{ boxShadow: `0 4px 20px ${roomData.themeColor}22` }}
        >
          {roomData.avatarEmoji}
        </span>
        <h2 className="mt-4 text-xl font-bold">{roomData.name}</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          {roomData.members.map(m => m.name).join(" · ")}
        </p>

        {/* Stats row */}
        <div className="mt-5 grid grid-cols-3 gap-2">
          <div className="rounded-2xl bg-white/60 p-3">
            <p className="text-lg font-black text-[var(--forest)]">{roomData.stats.consecutiveDays}</p>
            <p className="text-xs text-[var(--muted)]">连续天</p>
          </div>
          <div className="rounded-2xl bg-white/60 p-3">
            <p className="text-lg font-black text-[var(--forest)]">{formatMoney(roomData.stats.monthlyPullGrassCents)}</p>
            <p className="text-xs text-[var(--muted)]">本月拔草</p>
          </div>
          <div className="rounded-2xl bg-white/60 p-3">
            <p className="text-lg font-black text-[var(--forest)]">{roomData.stats.mutualReviews}</p>
            <p className="text-xs text-[var(--muted)]">互相参谋</p>
          </div>
        </div>
      </Card>

      {/* Room settings toggle */}
      <button
        type="button"
        onClick={() => setShowSettings(!showSettings)}
        className="mt-4 flex min-h-12 w-full items-center justify-between text-left"
      >
        <span className="flex items-center gap-2 font-bold text-sm">
          <Palette size={16}/>房间设置
        </span>
        <ChevronRight size={16} className={`transition ${showSettings ? "rotate-90" : ""}`}/>
      </button>

      {showSettings && (
        <Card className="mt-2 space-y-4 p-5">
          <div>
            <label className="text-sm font-semibold">房间名称</label>
            <Input
              className="mt-2"
              value={roomName}
              onChange={e => setRoomName(e.target.value)}
              placeholder="给你们的房间起个名字"
            />
          </div>
          <div>
            <label className="text-sm font-semibold">主题色</label>
            <div className="mt-2 flex gap-2">
              {["#4F7559", "#F29A62", "#AFC9D6", "#F4D66D", "#E8B4B8"].map(color => (
                <button
                  type="button"
                  key={color}
                  className="size-10 rounded-full border-2 transition"
                  style={{
                    backgroundColor: color,
                    borderColor: roomData.themeColor === color ? "var(--forest)" : "transparent",
                  }}
                />
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between rounded-2xl bg-[var(--cream)] p-3">
            <span className="flex items-center gap-2 text-sm">
              <Bell size={16}/>房间通知
            </span>
            <button type="button" className="relative h-6 w-11 rounded-full bg-[var(--forest)]">
              <span className="absolute right-0.5 top-0.5 size-5 rounded-full bg-white"/>
            </button>
          </div>
        </Card>
      )}

      {/* Members */}
      <section className="mt-7">
        <h2 className="mb-3 font-bold">成员</h2>
        <div className="space-y-2">
          {roomData.members.map(member => (
            <Card key={member.id} className="flex items-center gap-3 p-4">
              <span className="grid size-11 place-items-center rounded-full bg-[var(--sage-soft)] text-xl">
                {member.emoji}
              </span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <b className="text-sm">{member.name}</b>
                  {member.role === "admin" && (
                    <span className="rounded-full bg-[var(--lemon-soft)] px-2 py-0.5 text-xs text-[#67560f]">房主</span>
                  )}
                </div>
                <p className="text-xs text-[var(--muted)]">加入 {member.joinedDays} 天</p>
              </div>
            </Card>
          ))}
          {/* Future member slot */}
          {roomData.members.length < 6 && (
            <button
              type="button"
              className="flex min-h-16 w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-[var(--line)] text-sm text-[var(--muted)]"
            >
              <Plus size={16}/>还有空位（最多 6 人）
            </button>
          )}
        </div>
      </section>

      {/* Shared wishlist */}
      <section className="mt-7">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-bold">共同心愿单</h2>
          <span className="text-xs text-[var(--muted)]">{roomData.stats.sharedWishlist} 件</span>
        </div>
        <div className="space-y-2">
          {roomData.wishlist.map((item, i) => (
            <Card key={i} className="flex items-center gap-3 p-3">
              <span className="grid size-12 place-items-center rounded-xl bg-[var(--sage-soft)] text-2xl">
                {item.emoji}
              </span>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <b className="text-sm">{item.name}</b>
                  <b className="text-sm">{formatMoney(item.priceCents)}</b>
                </div>
                <p className="text-xs text-[var(--muted)]">{item.who} 想买的</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Recent activity */}
      <section className="mt-7">
        <h2 className="mb-3 font-bold">房间动态</h2>
        <div className="space-y-2">
          {roomData.recentActivity.map((activity, i) => (
            <div key={i} className="flex items-start gap-2.5 rounded-2xl bg-white p-3 text-sm">
              <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-[var(--blue-soft)]">
                {activity.type === "review" ? "💬" : activity.type === "result" ? "🌿" : "✨"}
              </span>
              <div>
                <p className="leading-6 text-[var(--muted)]">{activity.text}</p>
                <p className="mt-0.5 text-xs text-[var(--muted)] opacity-60">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Invite section */}
      <section className="mt-7">
        <h2 className="mb-3 font-bold">邀请朋友加入</h2>
        <Card className="p-4">
          <p className="text-sm leading-6 text-[var(--muted)]">
            把暗号告诉你想邀请的朋友，她输入暗号就能加入你们的闺蜜房。
          </p>
          <Button variant="outline" className="mt-3 w-full">
            <Copy/>复制邀请暗号（7 天有效）
          </Button>
          <div className="my-4 flex items-center gap-3 text-xs text-[var(--muted)]">
            <span className="h-px flex-1 bg-[var(--line)]"/>或输入朋友的暗号<span className="h-px flex-1 bg-[var(--line)]"/>
          </div>
          <Input
            value={code}
            onChange={e => setCode(e.target.value)}
            placeholder="输入暗号"
          />
          <Button className="mt-3 w-full" disabled={!code.trim()}>
            <Link2/>加入闺蜜房
          </Button>
          <div className="mt-3 space-y-1.5">
            <p className="flex items-start gap-1.5 text-xs text-[var(--muted)]">
              <Shield size={12} className="mt-0.5 shrink-0"/>
              暗号有时效限制，过期后需要重新生成
            </p>
            <p className="flex items-start gap-1.5 text-xs text-[var(--muted)]">
              <Shield size={12} className="mt-0.5 shrink-0"/>
              暗号不会明文保存，不要使用银行卡或账户密码
            </p>
            <p className="flex items-start gap-1.5 text-xs text-[var(--muted)]">
              <Shield size={12} className="mt-0.5 shrink-0"/>
              双方确认后才正式完成绑定
            </p>
          </div>
        </Card>
      </section>

      {/* Exit room */}
      <section className="mt-8">
        {!showExitConfirm ? (
          <Button
            variant="ghost"
            className="w-full text-[var(--muted)]"
            onClick={() => setShowExitConfirm(true)}
          >
            <LogOut size={16}/>退出闺蜜房
          </Button>
        ) : (
          <Card className="border-2 border-[var(--orange)] p-5 text-center">
            <p className="font-semibold text-[var(--orange-deep)]">确定要退出闺蜜房吗？</p>
            <p className="mt-2 text-sm text-[var(--muted)]">
              退出后将无法看到对方的新发布和私密意见。历史记录仍会保留。
            </p>
            <div className="mt-4 flex gap-3">
              <Button
                variant="ghost"
                className="flex-1"
                onClick={() => setShowExitConfirm(false)}
              >
                再想想
              </Button>
              <Button variant="danger" className="flex-1">
                确认退出
              </Button>
            </div>
          </Card>
        )}
      </section>

      {/* Privacy notice */}
      <p className="mt-6 text-center text-xs leading-5 text-[var(--muted)]">
        闺蜜房内的内容仅对成员可见。退出后，你将无法查看对方后续发布的新内容。
        <br/>
        <Link2 size={10} className="inline"/> 了解更多关于隐私保护
      </p>
    </>
  );
}
