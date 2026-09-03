"use client";

import { useState, useCallback } from "react";
import { publicBudgetLabel, type ReactionType } from "./domain";

// ============================================================
// Public field desensitization (公域字段脱敏)
// This is the CLIENT-SIDE layer. The real security is in RLS
// policies at the database level (see migration 005).
// This function ensures that even if a query accidentally returns
// sensitive fields, they will be stripped before rendering.
// ============================================================

export type PublicPost = {
  id: string;
  itemName: string;
  priceCents: number;
  userDisplayName: string;
  userAvatarEmoji: string;
  mood?: string;
  reason: string;
  tag: string;
  wait: string;
  worthIt: number;
  sameDesire: number;
  comments: number;
  hasResult: boolean;
  resultType?: string;
  // ⚠️ These fields must NEVER be included in public API responses
  // budgetRemainingCents, incomeCents, savingsGoalCents, etc.
  // are excluded at the query/RLS level, not hidden here.
  budgetHint?: string; // Only fuzzy label, never raw numbers
};

// Strip sensitive fields from a post before displaying on the square
export function sanitizePublicPost(post: Record<string, unknown>): PublicPost {
  return {
    id: String(post.id ?? ""),
    itemName: String(post.itemName ?? ""),
    priceCents: Number(post.priceCents ?? 0),
    userDisplayName: String(post.userDisplayName ?? post.display_name ?? "用户"),
    userAvatarEmoji: String(post.userAvatarEmoji ?? post.avatar_emoji ?? "✨"),
    mood: typeof post.mood === "string" ? post.mood : undefined,
    reason: String(post.reason ?? post.public_caption ?? ""),
    tag: String(post.tag ?? ""),
    wait: String(post.wait ?? ""),
    worthIt: Number(post.worthIt ?? 0),
    sameDesire: Number(post.sameDesire ?? 0),
    comments: Number(post.comments ?? 0),
    hasResult: Boolean(post.hasResult ?? false),
    resultType: typeof post.resultType === "string" ? post.resultType : undefined,
    // Only include fuzzy budget label, never raw budget numbers
    budgetHint: typeof post.remainingCents === "number"
      ? publicBudgetLabel(Number(post.remainingCents), Number(post.priceCents ?? 0))
      : undefined,
  };
}

// ============================================================
// Reaction deduplication helpers
// ============================================================

export function toggleReaction(
  active: ReactionType[],
  type: ReactionType
): ReactionType[] {
  return active.includes(type)
    ? active.filter(r => r !== type)
    : [...active, type];
}

export function toggleBookmark(savedIds: string[], id: string): string[] {
  return savedIds.includes(id)
    ? savedIds.filter(s => s !== id)
    : [...savedIds, id];
}

// ============================================================
// Comment data model (client-side demo)
// ============================================================

export type Comment = {
  id: string;
  userId: string;
  userDisplayName: string;
  userAvatarEmoji: string;
  content: string;
  parentId?: string;
  createdAt: string;
  isDeleted?: boolean;
};

// ============================================================
// useReactions hook — manages reaction state per post
// ============================================================

export function useReactions() {
  const [reactions, setReactions] = useState<Record<string, ReactionType[]>>({});

  const toggle = useCallback((postId: string, type: ReactionType) => {
    setReactions(prev => ({
      ...prev,
      [postId]: toggleReaction(prev[postId] ?? [], type),
    }));
  }, []);

  const has = useCallback((postId: string, type: ReactionType) => {
    return (reactions[postId] ?? []).includes(type);
  }, [reactions]);

  return { reactions, toggle, has };
}

// ============================================================
// useBookmarks hook — manages bookmark state
// ============================================================

export function useBookmarks() {
  const [saved, setSaved] = useState<string[]>([]);

  const toggle = useCallback((id: string) => {
    setSaved(prev => toggleBookmark(prev, id));
  }, []);

  const isSaved = useCallback((id: string) => saved.includes(id), [saved]);

  return { saved, toggle, isSaved };
}

// ============================================================
// useFollowUps hook — manages "蹲后续" subscriptions
// ============================================================

export function useFollowUps() {
  const [following, setFollowing] = useState<string[]>([]);

  const toggle = useCallback((id: string) => {
    setFollowing(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  }, []);

  const isFollowing = useCallback((id: string) => following.includes(id), [following]);

  return { following, toggle, isFollowing };
}
