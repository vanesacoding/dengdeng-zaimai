import { z } from "zod";

export const requestStatuses = ["DRAFT","PENDING_APPROVAL","NEED_MORE_INFO","APPROVED","REJECTED","COOLING_OFF","READY_TO_BUY","PURCHASED","GIVEN_UP","CANCELLED","EXPIRED"] as const;
export type RequestStatus = typeof requestStatuses[number];
export const statusLabel: Record<RequestStatus, string> = { DRAFT:"还没发出",PENDING_APPROVAL:"等闺蜜参谋",NEED_MORE_INFO:"等你补充",APPROVED:"她觉得可以买",REJECTED:"她劝你再想想",COOLING_OFF:"冷静盒里",READY_TO_BUY:"想清楚啦",PURCHASED:"买了",GIVEN_UP:"成功拔草",CANCELLED:"暂时收起",EXPIRED:"等太久啦" };

export const moods = ["HAPPY","REWARD_MYSELF","STRESSED","SEEDED_BY_OTHERS","LIMITED_TIME_FOMO","ACTUAL_NEED","BORED","OTHER"] as const;
export type PurchaseMood = typeof moods[number];
export const moodLabel: Record<PurchaseMood, string> = {
  HAPPY:"开心想庆祝", REWARD_MYSELF:"想奖励自己", STRESSED:"最近有点压力", SEEDED_BY_OTHERS:"被别人种草了",
  LIMITED_TIME_FOMO:"限时优惠让我上头", ACTUAL_NEED:"确实有实际需要", BORED:"有点无聊想逛逛", OTHER:"其他",
};

export const visibilities = ["PRIVATE","FRIENDS","PUBLIC"] as const;
export type RequestVisibility = typeof visibilities[number];
export const visibilityLabel: Record<RequestVisibility, string> = { PRIVATE:"仅自己可见", FRIENDS:"只给闺蜜看", PUBLIC:"发到想买广场" };

export function friendlyRiskLabel(score: number) {
  if (score < 25) return "比较安心";
  if (score < 50) return "可以再想想";
  if (score < 75) return "可能有点上头";
  return "建议多给自己一点时间";
}

// ── 结果类型（后来怎么样了）──
export const resultTypes = ["PURCHASED_LOVED","PURCHASED_REGRETTED","STILL_THINKING","GIVEN_UP","BOUGHT_ALTERNATIVE","POSTPONED"] as const;
export type ResultType = typeof resultTypes[number];
export const resultLabel: Record<ResultType, string> = {
  PURCHASED_LOVED:"买了，真香", PURCHASED_REGRETTED:"买了，有点后悔", STILL_THINKING:"还在纠结",
  GIVEN_UP:"成功拔草", BOUGHT_ALTERNATIVE:"换了更合适的", POSTPONED:"暂时搁置",
};

// ── 互动类型（广场态度）──
export const reactionTypes = ["WORTH_IT","WAIT","RUN_AWAY","SAME_DESIRE","FOLLOW_UP","SAVE"] as const;
export type ReactionType = typeof reactionTypes[number];
export const reactionLabel: Record<ReactionType, string> = {
  WORTH_IT:"值得买", WAIT:"先等等", RUN_AWAY:"快跑", SAME_DESIRE:"我也想买", FOLLOW_UP:"蹲后续", SAVE:"收藏",
};

// ── 内容审核状态 ──
export const moderationStatuses = ["PENDING","VISIBLE","LIMITED","REJECTED","REMOVED"] as const;
export type ModerationStatus = typeof moderationStatuses[number];

// ── 时间感知问候 ──
export function getGreeting(date: Date = new Date()): string {
  const h = date.getHours();
  if (h < 6) return "夜深了";
  if (h < 11) return "早上好";
  if (h < 14) return "中午好";
  if (h < 18) return "下午好";
  if (h < 22) return "晚上好";
  return "夜深了";
}

// ── 模糊预算描述（公域安全）──
export function publicBudgetLabel(remainingCents: number, priceCents: number): string {
  if (remainingCents <= 0) return "这个月预算有点紧";
  const ratio = priceCents / remainingCents;
  if (ratio < 0.15) return "预算比较宽松";
  if (ratio < 0.4) return "需要稍微考虑";
  return "这个月预算有点紧";
}

// ── 旧记录兼容助手 ──
// 确保缺少新字段的旧记录不会导致前端崩溃
export function normalizeRequest(r: Record<string, unknown>): {
  mood?: PurchaseMood;
  visibility?: RequestVisibility;
} {
  return {
    mood: typeof r.mood === "string" && moods.includes(r.mood as PurchaseMood) ? r.mood as PurchaseMood : undefined,
    visibility: typeof r.visibility === "string" && visibilities.includes(r.visibility as RequestVisibility) ? r.visibility as RequestVisibility : undefined,
  };
}

export const transitions: Record<RequestStatus, RequestStatus[]> = {
  DRAFT:["PENDING_APPROVAL","CANCELLED"], PENDING_APPROVAL:["NEED_MORE_INFO","APPROVED","REJECTED","COOLING_OFF","CANCELLED","EXPIRED"],
  NEED_MORE_INFO:["PENDING_APPROVAL","CANCELLED"], APPROVED:["COOLING_OFF","READY_TO_BUY","CANCELLED"],
  REJECTED:["GIVEN_UP","CANCELLED"], COOLING_OFF:["READY_TO_BUY","GIVEN_UP","CANCELLED"], READY_TO_BUY:["PURCHASED","GIVEN_UP","CANCELLED"],
  PURCHASED:[], GIVEN_UP:[], CANCELLED:[], EXPIRED:["PENDING_APPROVAL","CANCELLED"]
};
export function canTransition(from: RequestStatus, to: RequestStatus) { return transitions[from].includes(to); }

// ── 可见范围判断 ──
export function isPubliclyVisible(v: RequestVisibility | undefined): boolean {
  return v === "PUBLIC";
}
export function isFriendsVisible(v: RequestVisibility | undefined): boolean {
  return v === "FRIENDS" || v === "PUBLIC";
}

export const budgetSchema = z.object({
  livingAllowance: z.coerce.number().min(0), fixedExpenses: z.coerce.number().min(0), savingGoal: z.coerce.number().min(0),
  spentAmount: z.coerce.number().min(0), safeBalance: z.coerce.number().min(0), periodStart: z.string().min(1), periodEnd: z.string().min(1)
}).refine(v => v.livingAllowance >= v.fixedExpenses + v.savingGoal, { message:"生活费需覆盖固定支出和储蓄目标" });

export const purchaseSchema = z.object({
  itemName: z.string().trim().min(2,"请填写至少 2 个字"), priceYuan: z.coerce.number().positive("价格必须大于 0"),
  category: z.string().min(1), reason: z.string().trim().min(4,"再多说一点点吧（至少 4 个字）"), reviewerId: z.string().uuid().optional(),
  productUrl: z.string().url("链接格式好像不太对").or(z.literal("")).optional(), imageUrl: z.string().url().or(z.literal("")).optional(),
  impactIfNotPurchased: z.string().optional(), hasSimilarItem: z.boolean().default(false),
  desiredHours: z.coerce.number().min(0).default(0), limitedPromotion: z.boolean().default(false), plannedPurchase: z.boolean().default(false), necessity: z.boolean().default(false),
  coolingEnabled: z.boolean().default(true), coolingHours: z.coerce.number().min(0).max(720).default(24), countInBudget: z.boolean().default(true),
  mood: z.enum(moods).default("SEEDED_BY_OTHERS"), visibility: z.enum(visibilities).default("FRIENDS")
}).refine(v => Boolean(v.productUrl || v.imageUrl), { message:"添加一张商品图或商品链接吧", path:["productUrl"] });
