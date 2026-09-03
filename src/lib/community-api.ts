"use client";

import { useState, useCallback } from "react";
import type { ModerationStatus } from "./domain";

// ============================================================
// Block management — client-side demo state
// In production, these would be Supabase queries on user_blocks
// ============================================================

export function useUserBlocks() {
  const [blockedIds, setBlockedIds] = useState<string[]>([]);

  const block = useCallback((userId: string) => {
    setBlockedIds(prev => prev.includes(userId) ? prev : [...prev, userId]);
  }, []);

  const unblock = useCallback((userId: string) => {
    setBlockedIds(prev => prev.filter(id => id !== userId));
  }, []);

  const isBlocked = useCallback((userId: string) => blockedIds.includes(userId), [blockedIds]);

  return { blockedIds, block, unblock, isBlocked };
}

// ============================================================
// Content visibility checker — checks block status and moderation
// ============================================================

export function isContentVisible(
  authorId: string,
  moderationStatus: ModerationStatus | undefined,
  blockedUserIds: string[]
): boolean {
  // Blocked users' content is not visible
  if (blockedUserIds.includes(authorId)) return false;
  // Only VISIBLE or PENDING content shows on the square
  // (PENDING is visible to the author, but not on the public square)
  if (moderationStatus === "REJECTED" || moderationStatus === "REMOVED") return false;
  if (moderationStatus === "LIMITED") return false;
  return true;
}

export function isContentVisibleOnSquare(
  authorId: string,
  moderationStatus: ModerationStatus | undefined,
  blockedUserIds: string[],
  currentUserId: string
): boolean {
  // Own content always visible to author
  if (authorId === currentUserId) {
    return moderationStatus !== "REMOVED";
  }
  // Others' content: must pass block + moderation checks
  return isContentVisible(authorId, moderationStatus, blockedUserIds) &&
    moderationStatus === "VISIBLE";
}

// ============================================================
// Delete own content — checks permission
// ============================================================

export function canDeleteContent(authorId: string, currentUserId: string): boolean {
  return authorId === currentUserId;
}

export function canDeleteComment(commentAuthorId: string, currentUserId: string): boolean {
  return commentAuthorId === currentUserId;
}

// ============================================================
// Report validation
// ============================================================

const validReportReasons = [
  "内容不当", "虚假信息", "侵犯隐私", "广告引流",
  "言语不友善", "人身攻击", "垃圾信息",
  "骚扰", "不当行为", "虚假身份", "其他",
];

export function isValidReport(reason: string, detail: string): boolean {
  if (!reason || !validReportReasons.includes(reason)) return false;
  if (detail.length > 500) return false;
  return true;
}

// ============================================================
// Block validation
// ============================================================

export function canBlockUser(blockerId: string, blockedId: string): boolean {
  // Cannot block yourself
  return blockerId !== blockedId;
}

// ============================================================
// Post-purchase follow-up validation
// ============================================================

export function canAddFollowUp(
  hasResult: boolean,
  resultAge: number, // days since result was recorded
  hasExistingFollowUp: boolean
): boolean {
  if (!hasResult) return false;
  if (hasExistingFollowUp) return false;
  // Must wait at least 1 day after recording result
  return resultAge >= 1;
}

// ============================================================
// Notification preferences (demo state)
// ============================================================

export type NotificationCategory =
  | "friend_new_post"
  | "friend_opinion"
  | "public_reaction"
  | "public_comment"
  | "cooling_reminder"
  | "result_reminder"
  | "friend_result_update"
  | "moderation_result";

export const notificationCategoryLabels: Record<NotificationCategory, string> = {
  friend_new_post: "闺蜜发布了新的想买",
  friend_opinion: "闺蜜给出了意见",
  public_reaction: "有人回应了你的公开内容",
  public_comment: "有人评论了你的内容",
  cooling_reminder: "冷静期即将结束",
  result_reminder: "可以填写结果日记",
  friend_result_update: "闺蜜更新了购买结果",
  moderation_result: "公开内容审核结果",
};

export function useNotificationPreferences() {
  const [prefs, setPrefs] = useState<Record<NotificationCategory, boolean>>({
    friend_new_post: true,
    friend_opinion: true,
    public_reaction: true,
    public_comment: true,
    cooling_reminder: true,
    result_reminder: true,
    friend_result_update: true,
    moderation_result: true,
  });

  const toggle = useCallback((category: NotificationCategory) => {
    setPrefs(prev => ({ ...prev, [category]: !prev[category] }));
  }, []);

  const isOn = useCallback((category: NotificationCategory) => prefs[category], [prefs]);

  return { prefs, toggle, isOn };
}

// ============================================================
// Read state management for notifications
// ============================================================

export type AppNotification = {
  id: string;
  category: NotificationCategory;
  title: string;
  text: string;
  time: string;
  read: boolean;
};

export function useNotifications(initial: AppNotification[]) {
  const [notifications, setNotifications] = useState<AppNotification[]>(initial);

  const markRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return { notifications, markRead, markAllRead, unreadCount };
}
