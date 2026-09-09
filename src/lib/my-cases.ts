"use client";

import { useEffect, useState } from "react";
import { demoCases, type ShoppingCase } from "./case-demo-data";
import type { PurchaseRequest } from "./use-requests";
import type { CaseStatus, ReactionType } from "./domain";

// ── 用户提交的公开单 → 法庭案件 ──
// 用户在「发起评审」选公开评审后，单子存 localStorage（ddzm:requests），
// 这里把它转成法庭列表能读的 ShoppingCase，和演示案件合在一起展示。

const REQUESTS_KEY = "ddzm:requests";

const categoryEmoji: Record<string, string> = {
  数码: "🎧", 服饰: "👗", 家居: "🛋️", 美妆: "💄", 运动: "🏃", 图书: "📚", 美食: "🍜", 旅行: "🧳",
};

const categoryTint: Record<string, string> = {
  数码: "bg-[var(--blue-soft)]", 服饰: "bg-[#f3e9df]", 家居: "bg-[var(--sage-soft)]", 美妆: "bg-[var(--lemon-soft)]",
  运动: "bg-[var(--sage-soft)]", 图书: "bg-[var(--lemon-soft)]", 美食: "bg-[var(--orange-soft)]", 旅行: "bg-[#f3e9df]",
};

const statusMap: Record<string, CaseStatus> = {
  PENDING_APPROVAL: "JURY_VOTING",
  APPROVED: "VERDICT_READY",
  REJECTED: "VERDICT_READY",
  COOLING_OFF: "COOLING",
  PURCHASED: "CLOSED",
  GIVEN_UP: "CLOSED",
};

function pickEmoji(category: string, itemName: string): string {
  if (categoryEmoji[category]) return categoryEmoji[category];
  const name = itemName.toLowerCase();
  if (name.includes("耳机")) return "🎧";
  if (name.includes("手机")) return "📱";
  if (name.includes("电脑") || name.includes("键盘")) return "💻";
  if (name.includes("鞋")) return "👟";
  if (name.includes("包")) return "👜";
  if (name.includes("表")) return "⌚";
  if (name.includes("灯")) return "💡";
  if (name.includes("杯")) return "🥤";
  return "🛍️";
}

export function toShoppingCase(request: PurchaseRequest): ShoppingCase {
  const emoji = pickEmoji(request.category, request.itemName);
  const statement = request.caseStatement || request.reason;
  const title = (request.caseTitle || `《${request.itemName}的审判》`).replaceAll("《", "").replaceAll("》", "");
  return {
    caseId: request.id,
    caseNumber: `DD-${new Date().getFullYear()}-${String(1000 + Math.floor(Math.random() * 9000))}`,
    title,
    caseReason: request.reason,
    statement,
    evidence: request.hasAlternative ? [{ type: "CUSTOM", text: "当事人提到已有替代品" }] : [],
    itemName: request.itemName,
    itemEmoji: emoji,
    priceCents: request.priceCents,
    category: request.category,
    mood: request.mood ?? "",
    user: "我",
    userEmoji: "✨",
    channel: "NEED_JURY",
    caseStatus: statusMap[request.status] ?? "IN_REVIEW",
    contentSource: "USER",
    isDemo: false,
    isAnonymous: false,
    createdAt: request.createdAt || "刚刚",
    wait: "刚刚提交",
    tint: categoryTint[request.category] ?? "bg-[var(--cream)]",
    voteCounts: { WORTH_IT: 0, WAIT: 0, RUN_AWAY: 0 } as Record<ReactionType, number>,
    commentCount: 0,
    hasResult: false,
    imageUrl: request.imageUrl,
    statementSource: request.caseStatement ? "AI" : "USER",
  } as ShoppingCase & { imageUrl?: string; statementSource?: string };
}

function readMyPublicCases(): ShoppingCase[] {
  try {
    const raw = localStorage.getItem(REQUESTS_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw) as Record<string, unknown>[];
    return list
      .filter(r => r.visibility === "PUBLIC")
      .map(r => toShoppingCase({
        id: String(r.id ?? ""),
        itemName: String(r.itemName ?? ""),
        priceCents: Number(r.priceCents ?? 0),
        category: String(r.category ?? "其他"),
        reason: String(r.reason ?? ""),
        status: r.status as PurchaseRequest["status"],
        riskScore: Number(r.riskScore ?? 0),
        createdAt: String(r.createdAt ?? "刚刚"),
        reviewer: String(r.reviewer ?? ""),
        mood: r.mood as PurchaseRequest["mood"],
        visibility: r.visibility as PurchaseRequest["visibility"],
        productUrl: r.productUrl ? String(r.productUrl) : undefined,
        imageUrl: r.imageUrl ? String(r.imageUrl) : undefined,
        hasAlternative: Boolean(r.hasAlternative),
        caseTitle: r.caseTitle ? String(r.caseTitle) : undefined,
        caseStatement: r.caseStatement ? String(r.caseStatement) : undefined,
      }));
  } catch {
    return [];
  }
}

// 法庭列表数据源：用户提交的公开单置顶 + 演示案件
export function useCourtCases() {
  const [cases, setCases] = useState<ShoppingCase[]>(demoCases);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCases([...readMyPublicCases(), ...demoCases]);
    setReady(true);
  }, []);

  return { cases, ready };
}

// 详情页数据源：优先在用户提交的公开单里找，找不到再回落到演示案件
export function useCourtCaseById(id: string) {
  const { cases, ready } = useCourtCases();
  const caseData = cases.find(item => item.caseId === id);
  return { caseData, ready };
}
