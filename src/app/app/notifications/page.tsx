"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CheckCheck, ChevronRight, Clock3, Heart,
  MessageCircle, Settings, Sparkles, UserPlus
} from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  useNotifications,
  type AppNotification,
  type NotificationCategory,
} from "@/lib/community-api";

const demoNotifications: AppNotification[] = [
  { id: "n1", category: "friend_opinion", title: "小满来参谋啦", text: "她建议把「亚麻连衣裙」放进冷静盒", time: "10 分钟前", read: false },
  { id: "n2", category: "cooling_reminder", title: "冷静盒快到时间了", text: "明天下午，再看看你是不是还心动", time: "2 小时前", read: false },
  { id: "n3", category: "friend_new_post", title: "小满晒了新的想买", text: "她正在纠结一套水彩颜料，去看看？", time: "5 小时前", read: false },
  { id: "n4", category: "public_reaction", title: "有人觉得你值得买", text: "晚风对你的「降噪耳机」点了值得买", time: "昨天", read: true },
  { id: "n5", category: "public_comment", title: "有人评论了你的内容", text: "阿鹿：我觉得可以先去店里试试再决定", time: "昨天", read: true },
  { id: "n6", category: "result_reminder", title: "可以填写结果日记了", text: "冷静期已结束，后来怎么样了？", time: "2 天前", read: true },
  { id: "n7", category: "friend_result_update", title: "小满成功拔草了", text: "她把「咖啡机」成功拔草了，花了 72 小时冷静", time: "2 天前", read: true },
];

const categoryIcons: Record<NotificationCategory, React.ReactNode> = {
  friend_new_post: <UserPlus size={18}/>,
  friend_opinion: <MessageCircle size={18}/>,
  public_reaction: <Heart size={18}/>,
  public_comment: <MessageCircle size={18}/>,
  cooling_reminder: <Clock3 size={18}/>,
  result_reminder: <Sparkles size={18}/>,
  friend_result_update: <Sparkles size={18}/>,
  moderation_result: <Settings size={18}/>,
};

const filters = [
  { label: "全部", value: "all" as const },
  { label: "闺蜜", value: "friend" as const },
  { label: "广场", value: "public" as const },
  { label: "提醒", value: "reminder" as const },
];

function categoryFilter(category: NotificationCategory, filter: string): boolean {
  if (filter === "all") return true;
  if (filter === "friend") return ["friend_new_post", "friend_opinion", "friend_result_update"].includes(category);
  if (filter === "public") return ["public_reaction", "public_comment", "moderation_result"].includes(category);
  if (filter === "reminder") return ["cooling_reminder", "result_reminder"].includes(category);
  return true;
}

export default function Notifications() {
  const [filter, setFilter] = useState<string>("all");
  const { notifications, markRead, markAllRead, unreadCount } = useNotifications(demoNotifications);

  const filtered = notifications.filter(n => categoryFilter(n.category, filter));

  return (
    <>
      <header>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black">消息</h1>
            <p className="mt-1 text-sm text-[var(--muted)]">
              每一句参谋和每一个后续，都在这里。
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllRead}
              className="flex min-h-11 items-center gap-1.5 rounded-full bg-[var(--sage-soft)] px-3 text-sm font-semibold text-[var(--forest)]"
            >
              <CheckCheck size={16}/>全部已读
            </button>
          )}
        </div>
      </header>

      {/* Filter tabs */}
      <div className="-mx-5 mt-5 flex gap-2 overflow-x-auto px-5 pb-2">
        {filters.map(f => (
          <button
            type="button"
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`min-h-11 shrink-0 rounded-full px-4 text-sm font-semibold transition ${
              filter === f.value ? "bg-[var(--forest)] text-white" : "bg-white text-[var(--muted)]"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Unread badge */}
      {unreadCount > 0 && (
        <div className="mt-4 rounded-2xl bg-[var(--lemon-soft)] px-4 py-2 text-sm text-[#67560f]">
          {unreadCount} 条未读消息
        </div>
      )}

      {/* Notification list */}
      <div className="mt-4 space-y-3">
        {filtered.length === 0 && (
          <div className="mt-12 flex flex-col items-center gap-3 text-[var(--muted)]">
            <span className="text-4xl">📭</span>
            <p className="text-sm">这里暂时没有消息</p>
          </div>
        )}

        {filtered.map(n => (
          <button
            type="button"
            key={n.id}
            onClick={() => markRead(n.id)}
            className="block w-full text-left"
          >
            <Card
              className={`flex gap-3 p-4 transition ${
                !n.read ? "border-l-4 border-l-[var(--forest)]" : ""
              }`}
            >
              <span className={`grid size-11 shrink-0 place-items-center rounded-2xl ${
                !n.read ? "bg-[var(--sage-soft)] text-[var(--forest)]" : "bg-[var(--cream)] text-[var(--muted)]"
              }`}>
                {categoryIcons[n.category]}
              </span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <b className="text-sm">{n.title}</b>
                  {!n.read && <span className="size-2 rounded-full bg-[var(--orange)]"/>}
                </div>
                <p className="mt-1 text-sm text-[var(--muted)]">{n.text}</p>
                <p className="mt-2 text-xs text-[var(--muted)] opacity-60">{n.time}</p>
              </div>
              {!n.read && <ChevronRight size={16} className="mt-2 text-[var(--muted)]"/>}
            </Card>
          </button>
        ))}
      </div>

      {/* Notification preferences link */}
      <Link href="/app/settings/community">
        <Card className="mt-6 flex items-center gap-3 p-4">
          <span className="grid size-11 place-items-center rounded-2xl bg-[var(--blue-soft)]">
            <Settings size={18} className="text-[var(--forest-deep)]"/>
          </span>
          <div className="flex-1">
            <b className="text-sm">通知偏好设置</b>
            <p className="text-xs text-[var(--muted)]">选择你想收到的通知类型</p>
          </div>
          <ChevronRight size={18} className="text-[var(--muted)]"/>
        </Card>
      </Link>

      {/* Realtime indicator */}
      <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-[var(--muted)]">
        <span className="size-2 rounded-full bg-[var(--forest)] animate-pulse"/>
        实时接收中 · 有新消息会自动更新
      </div>
    </>
  );
}
