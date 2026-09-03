"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, Ban, BookOpen, FileText, Shield, Trash2, UserX
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  useNotificationPreferences,
  notificationCategoryLabels,
  type NotificationCategory,
} from "@/lib/community-api";

// Demo blocked users
const demoBlockedUsers = [
  { id: "u5", name: "某用户", emoji: "🚫", blockedAt: "3 天前" },
];

export default function CommunitySettings() {
  const { isOn, toggle } = useNotificationPreferences();
  const [blockedUsers, setBlockedUsers] = useState(demoBlockedUsers);

  function unblock(id: string) {
    setBlockedUsers(prev => prev.filter(u => u.id !== id));
  }

  const categories = Object.keys(notificationCategoryLabels) as NotificationCategory[];

  return (
    <>
      <Link href="/app/settings" className="mb-5 inline-flex gap-2 text-sm text-[var(--muted)]">
        <ArrowLeft size={18}/>返回设置
      </Link>

      <h1 className="text-3xl font-black">社区与安全</h1>

      {/* Notification preferences */}
      <section className="mt-7">
        <h2 className="mb-3 font-bold">通知偏好</h2>
        <Card className="divide-y divide-[var(--line)]">
          {categories.map(cat => (
            <div key={cat} className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-medium">{notificationCategoryLabels[cat]}</p>
              </div>
              <button
                type="button"
                onClick={() => toggle(cat)}
                aria-label={isOn(cat) ? "关闭通知" : "开启通知"}
                className={`relative h-6 w-11 rounded-full transition ${
                  isOn(cat) ? "bg-[var(--forest)]" : "bg-[var(--line)]"
                }`}
              >
                <span
                  className={`absolute top-0.5 size-5 rounded-full bg-white transition-all ${
                    isOn(cat) ? "left-[22px]" : "left-0.5"
                  }`}
                />
              </button>
            </div>
          ))}
        </Card>
      </section>

      {/* Blocked users */}
      <section className="mt-7">
        <h2 className="mb-3 font-bold">已拉黑用户</h2>
        {blockedUsers.length === 0 ? (
          <Card className="p-5 text-center text-sm text-[var(--muted)]">
            <UserX size={24} className="mx-auto mb-2 opacity-40"/>
            还没有拉黑任何人
          </Card>
        ) : (
          <div className="space-y-2">
            {blockedUsers.map(user => (
              <Card key={user.id} className="flex items-center gap-3 p-4">
                <span className="grid size-11 place-items-center rounded-full bg-[var(--cream)] text-xl">
                  {user.emoji}
                </span>
                <div className="flex-1">
                  <b className="text-sm">{user.name}</b>
                  <p className="text-xs text-[var(--muted)]">拉黑于 {user.blockedAt}</p>
                </div>
                <Button
                  variant="outline"
                  className="min-h-9"
                  onClick={() => unblock(user.id)}
                >
                  解除拉黑
                </Button>
              </Card>
            ))}
          </div>
        )}
        <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
          拉黑后，对方的内容不会出现在你的广场和推荐中。对方不会收到拉黑通知。
        </p>
      </section>

      {/* Delete own content */}
      <section className="mt-7">
        <h2 className="mb-3 font-bold">我的内容</h2>
        <Link href="/app/requests">
          <Card className="flex items-center gap-3 p-4">
            <span className="grid size-11 place-items-center rounded-2xl bg-[var(--orange-soft)]">
              <Trash2 size={18} className="text-[var(--orange-deep)]"/>
            </span>
            <div className="flex-1">
              <b className="text-sm">删除我的想买记录</b>
              <p className="text-xs text-[var(--muted)]">在记录详情页底部可以删除</p>
            </div>
          </Card>
        </Link>
      </section>

      {/* Privacy & community guidelines */}
      <section className="mt-7">
        <h2 className="mb-3 font-bold">规则与隐私</h2>
        <div className="space-y-2">
          <Card className="flex items-center gap-3 p-4">
            <span className="grid size-11 place-items-center rounded-2xl bg-[var(--blue-soft)]">
              <Shield size={18} className="text-[var(--forest-deep)]"/>
            </span>
            <div className="flex-1">
              <b className="text-sm">隐私政策</b>
              <p className="text-xs text-[var(--muted)]">我们如何保护你的数据</p>
            </div>
          </Card>
          <Card className="flex items-center gap-3 p-4">
            <span className="grid size-11 place-items-center rounded-2xl bg-[var(--sage-soft)]">
              <BookOpen size={18} className="text-[var(--forest)]"/>
            </span>
            <div className="flex-1">
              <b className="text-sm">社区规范</b>
              <p className="text-xs text-[var(--muted)]">一起维护友好的社区氛围</p>
            </div>
          </Card>
          <Card className="flex items-center gap-3 p-4">
            <span className="grid size-11 place-items-center rounded-2xl bg-[var(--lemon-soft)]">
              <FileText size={18} className="text-[#67560f]"/>
            </span>
            <div className="flex-1">
              <b className="text-sm">内容审核说明</b>
              <p className="text-xs text-[var(--muted)]">公开内容如何被审核</p>
            </div>
          </Card>
        </div>
      </section>

      {/* Account deletion */}
      <section className="mt-7">
        <h2 className="mb-3 font-bold">账户</h2>
        <Card className="p-4">
          <b className="text-sm">注销账户与数据删除</b>
          <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
            注销后，你的所有数据将被永久删除，包括想买记录、评论、结果日记和闺蜜房关系。
            此操作不可撤销。
          </p>
          <Button variant="danger" className="mt-4 w-full min-h-12">
            <Ban size={16}/>申请注销账户
          </Button>
        </Card>
      </section>
    </>
  );
}
