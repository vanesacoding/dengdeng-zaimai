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

// ── 法庭频道枚举 ──
export const channels = [
  "HOT_CASES",        // 今日热案
  "NEED_JURY",        // 等你参谋
  "COOLING_SENTENCE", // 判处冷静
  "GIVEN_UP",         // 成功拔草
  "PLOT_TWIST",       // 买后翻案
  "CLOSED",           // 已经结案
] as const;
export type Channel = typeof channels[number];
export const channelLabel: Record<Channel, string> = {
  HOT_CASES: "今日热案",
  NEED_JURY: "等你参谋",
  COOLING_SENTENCE: "判处冷静",
  GIVEN_UP: "成功拔草",
  PLOT_TWIST: "买后翻案",
  CLOSED: "已经结案",
};
export const channelEmoji: Record<Channel, string> = {
  HOT_CASES: "🔥",
  NEED_JURY: "⚖️",
  COOLING_SENTENCE: "🧊",
  GIVEN_UP: "🌿",
  PLOT_TWIST: "🔄",
  CLOSED: "📁",
};

// 旧中文频道 key → 新法庭频道枚举映射（兼容旧数据）
const legacyChannelMap: Record<string, Channel> = {
  "正在纠结": "NEED_JURY",
  "今日上头": "HOT_CASES",
  "成功拔草": "GIVEN_UP",
  "买后真香": "PLOT_TWIST",
  "买后后悔": "PLOT_TWIST",
  "姐妹求参谋": "NEED_JURY",
  // 兼容上一版枚举
  NEED_ADVICE: "NEED_JURY",
  THINKING: "NEED_JURY",
  PURCHASED: "CLOSED",
  LOVED: "PLOT_TWIST",
  REGRETTED: "PLOT_TWIST",
  TRENDING_TODAY: "HOT_CASES",
};
export function normalizeChannel(raw: string): Channel {
  if (channels.includes(raw as Channel)) return raw as Channel;
  return legacyChannelMap[raw] ?? "NEED_JURY";
}

// ── 购买意图分层 ──
export const purchaseIntents = [
  "BROWSING",       // 随便看看
  "INTERESTED",     // 有点心动
  "SAVED",          // 已收藏
  "CONSIDERING",    // 在考虑
  "READY_TO_BUY",   // 想清楚了
  "VIEWED_OFFERS",  // 看过优惠
  "PURCHASED",      // 已购买
] as const;
export type PurchaseIntent = typeof purchaseIntents[number];
export const purchaseIntentLabel: Record<PurchaseIntent, string> = {
  BROWSING: "随便看看",
  INTERESTED: "有点心动",
  SAVED: "已收藏",
  CONSIDERING: "在考虑",
  READY_TO_BUY: "想清楚了",
  VIEWED_OFFERS: "看过优惠",
  PURCHASED: "已购买",
};
export const purchaseIntentOrder: PurchaseIntent[] = [...purchaseIntents];

// ── 内容来源类型 ──
export const contentSources = ["USER", "EDITORIAL", "SPONSORED"] as const;
export type ContentSource = typeof contentSources[number];
export const contentSourceLabel: Record<ContentSource, string> = {
  USER: "用户分享",
  EDITORIAL: "编辑推荐",
  SPONSORED: "品牌内容",
};
export function isCommercialSource(source: ContentSource): boolean {
  return source === "SPONSORED";
}

// ── 购物案状态 ──
export const caseStatuses = ["OPEN","NEED_EVIDENCE","JURY_VOTING","COOLING","VERDICT_READY","CLOSED"] as const;
export type CaseStatus = typeof caseStatuses[number];
export const caseStatusLabel: Record<CaseStatus, string> = {
  OPEN: "正在审理",
  NEED_EVIDENCE: "证据不足",
  JURY_VOTING: "陪审团投票中",
  COOLING: "钱包保护期",
  VERDICT_READY: "判决已生成",
  CLOSED: "已结案",
};
export const caseStatusEmoji: Record<CaseStatus, string> = {
  OPEN: "📂",
  NEED_EVIDENCE: "❓",
  JURY_VOTING: "🗳️",
  COOLING: "🧊",
  VERDICT_READY: "📋",
  CLOSED: "📁",
};

// ── 判决类型 ──
export const verdictTypes = ["APPROVED_BY_JURY","COOLING_RECOMMENDED","WALLET_PROTECTED","MORE_EVIDENCE_NEEDED","JURY_DIVIDED"] as const;
export type VerdictType = typeof verdictTypes[number];
export const verdictLabel: Record<VerdictType, string> = {
  APPROVED_BY_JURY: "陪审团多数批准",
  COOLING_RECOMMENDED: "判处冷静 72 小时",
  WALLET_PROTECTED: "建议保护钱包",
  MORE_EVIDENCE_NEEDED: "证据不足，请当事人补充",
  JURY_DIVIDED: "陪审团意见严重分裂",
};
export const verdictEmoji: Record<VerdictType, string> = {
  APPROVED_BY_JURY: "✅",
  COOLING_RECOMMENDED: "🧊",
  WALLET_PROTECTED: "🛡️",
  MORE_EVIDENCE_NEEDED: "❓",
  JURY_DIVIDED: "⚔️",
};

// ── 证据类型 ──
export const evidenceTypes = [
  "HAS_SIMILAR_ITEM","NEW_DESIRE","LIMITED_PROMOTION","PLANNED_PURCHASE",
  "NECESSITY","LONG_CONSIDERATION","BUDGET_COMFORTABLE","BUDGET_CONSIDER","BUDGET_TIGHT","CUSTOM",
] as const;
export type EvidenceType = typeof evidenceTypes[number];
export const evidenceLabel: Record<EvidenceType, string> = {
  HAS_SIMILAR_ITEM: "家里已有类似物品",
  NEW_DESIRE: "购物欲产生不足 24 小时",
  LIMITED_PROMOTION: "受限时促销影响",
  PLANNED_PURCHASE: "属于计划内消费",
  NECESSITY: "属于生活必需品",
  LONG_CONSIDERATION: "已经考虑很久",
  BUDGET_COMFORTABLE: "本月预算比较宽松",
  BUDGET_CONSIDER: "本月预算需要稍微考虑",
  BUDGET_TIGHT: "本月预算有点紧",
  CUSTOM: "其他证据",
};

// ── 证词角色 ──
export const witnessRoles = [
  "SAME_ITEM_OWNER","DEFENSE","COOLING_ADVISER","PURCHASED_USER","ALTERNATIVE_SCOUT","EVIDENCE_PROVIDER","NONE",
] as const;
export type WitnessRole = typeof witnessRoles[number];
export const witnessRoleLabel: Record<WitnessRole, string> = {
  SAME_ITEM_OWNER: "同款证人",
  DEFENSE: "为她辩护",
  COOLING_ADVISER: "劝她冷静",
  PURCHASED_USER: "买后体验者",
  ALTERNATIVE_SCOUT: "平替推荐官",
  EVIDENCE_PROVIDER: "关键证据",
  NONE: "普通证词",
};
export const witnessRoleEmoji: Record<WitnessRole, string> = {
  SAME_ITEM_OWNER: "👀",
  DEFENSE: "⚖️",
  COOLING_ADVISER: "🧊",
  PURCHASED_USER: "📦",
  ALTERNATIVE_SCOUT: "🔄",
  EVIDENCE_PROVIDER: "🔍",
  NONE: "💬",
};

// ── 陪审团投票展示文案（复用现有互动类型）──
export const juryVoteLabel: Record<ReactionType, string> = {
  WORTH_IT: "批准！她值得",
  WAIT: "判处冷静三天",
  RUN_AWAY: "驳回！保护钱包",
  SAME_DESIRE: "本陪审员也想买",
  FOLLOW_UP: "蹲一个案件后续",
  SAVE: "收藏本案",
};
// 判决计算只使用这四种投票
export const verdictVoteTypes: ReactionType[] = ["WORTH_IT", "WAIT", "RUN_AWAY"];
// 这些投票不计入判决比例
export const nonVerdictVoteTypes: ReactionType[] = ["SAME_DESIRE", "FOLLOW_UP", "SAVE"];

// ── 案件编号生成 ──
// 使用随机序号，不连续，不暴露业务量
export function generateCaseNumber(): string {
  const year = new Date().getFullYear();
  const randomPart = Math.floor(Math.random() * 9000) + 1000; // 1000-9999
  return `DD-${year}-${randomPart}`;
}
export function formatCaseNumberDisplay(caseNumber: string): string {
  // DD-2026-0826 → 第 0826 号购物案
  const parts = caseNumber.split("-");
  if (parts.length >= 3) {
    return `第 ${parts[parts.length - 1]} 号购物案`;
  }
  return caseNumber;
}

// ── 搞笑案件标题模板 ──
export const caseTitleTemplates = [
  "《关于我试图用买东西改变人生的申请》",
  "《已有八个，但这个颜色确实没有》",
  "《只要买下它，我就会开始运动》",
  "《这不是冲动，是限时优惠先动的手》",
  "《工作已经很苦了，申请给自己一点甜》",
  "《虽然用不到，但它真的很适合放在家里》",
  "《买了不一定快乐，不买今晚肯定惦记》",
  "《我的闺蜜劝我别买，所以申请社会评议》",
  "《这是刚需，只是这个刚需有一点贵》",
  "《申请用下个月的钱安慰今天的自己》",
  "《如果买完会吃灰，那也是高级的灰》",
  "《本人郑重申请拥有第九个同类物品》",
];

// 本地标题生成（不依赖 AI）
export function generateTitleCandidates(reason: string, hasSimilarItem: boolean, limitedPromotion: boolean, category: string): string[] {
  const candidates: string[] = [];
  if (hasSimilarItem) {
    candidates.push("《已有八个，但这个颜色确实没有》");
    candidates.push("《本人郑重申请拥有第九个同类物品》");
  }
  if (limitedPromotion) {
    candidates.push("《这不是冲动，是限时优惠先动的手》");
  }
  if (category === "运动" || category === "健身") {
    candidates.push("《只要买下它，我就会开始运动》");
  }
  if (reason.includes("压力") || reason.includes("苦") || reason.includes("累")) {
    candidates.push("《工作已经很苦了，申请给自己一点甜》");
  }
  if (reason.includes("放") || reason.includes("摆") || reason.includes("装饰")) {
    candidates.push("《虽然用不到，但它真的很适合放在家里》");
  }
  // 通用候选
  candidates.push("《关于我试图用买东西改变人生的申请》");
  candidates.push("《买了不一定快乐，不买今晚肯定惦记》");
  // 去重，最多返回 3 个
  return [...new Set(candidates)].slice(0, 3);
}

// ── 内容安全：禁止羞辱性文案 ──
const bannedPhrases = [
  "穷还买", "败家", "没救了", "智商税用户", "月薪这么低还敢买",
  "女人就是爱乱花钱", "不配买", "活该后悔", "脑子进水",
  "有罪", "犯罪", "罪犯",
];
export function isSafeTitle(title: string): boolean {
  const lower = title.toLowerCase();
  return !bannedPhrases.some(phrase => lower.includes(phrase.toLowerCase()));
}
export function isSafeComment(content: string): boolean {
  const lower = content.toLowerCase();
  return !bannedPhrases.some(phrase => lower.includes(phrase.toLowerCase()));
}

// ── 结案展示文案（公域包装，不影响底层 resultType）──
export const closedCaseLabel: Record<ResultType, string> = {
  PURCHASED_LOVED: "买了，判决正确",
  PURCHASED_REGRETTED: "买了，但想申请重审",
  STILL_THINKING: "本案继续审理",
  GIVEN_UP: "没买，钱包成功获救",
  BOUGHT_ALTERNATIVE: "改判平替方案",
  POSTPONED: "延期审理",
};

// ── 反转判断 ──
export type PlotTwistType =
  | "JURY_WRONG_LOVED"    // 陪审团劝不买，但买后真香
  | "JURY_WRONG_REGRETTED" // 陪审团批准，但买后后悔
  | "COOLING_WORKED"      // 冷静期立功，成功拔草
  | "ALTERNATIVE_WON"    // 平替成功上位
  | "NEED_REVIEW";       // 本案申请重审

export const plotTwistLabel: Record<PlotTwistType, string> = {
  JURY_WRONG_LOVED: "陪审团猜错了",
  JURY_WRONG_REGRETTED: "陪审团猜错了",
  COOLING_WORKED: "冷静期立功",
  ALTERNATIVE_WON: "平替成功上位",
  NEED_REVIEW: "本案申请重审",
};

export function detectPlotTwist(
  majorityVerdict: VerdictType | undefined,
  resultType: ResultType | undefined,
): PlotTwistType | undefined {
  if (!resultType) return undefined;
  // 陪审团建议不买（WALLET_PROTECTED / COOLING_RECOMMENDED），但买后真香
  if ((majorityVerdict === "WALLET_PROTECTED" || majorityVerdict === "COOLING_RECOMMENDED") && resultType === "PURCHASED_LOVED") {
    return "JURY_WRONG_LOVED";
  }
  // 陪审团批准，但买后后悔
  if (majorityVerdict === "APPROVED_BY_JURY" && resultType === "PURCHASED_REGRETTED") {
    return "JURY_WRONG_REGRETTED";
  }
  // 冷静期立功，成功拔草
  if (majorityVerdict === "COOLING_RECOMMENDED" && resultType === "GIVEN_UP") {
    return "COOLING_WORKED";
  }
  // 平替成功上位
  if (resultType === "BOUGHT_ALTERNATIVE") {
    return "ALTERNATIVE_WON";
  }
  // 买了后悔 → 申请重审
  if (resultType === "PURCHASED_REGRETTED") {
    return "NEED_REVIEW";
  }
  return undefined;
}

// ── 陪审团判决统计 ──
export type VoteCounts = Record<ReactionType, number>;
export type VerdictSummary = {
  totalVerdictVotes: number;
  approvePct: number;
  coolingPct: number;
  rejectPct: number;
  majorityVerdict: VerdictType;
};
export function summarizeVerdict(votes: VoteCounts): VerdictSummary {
  const approve = votes["WORTH_IT"] ?? 0;
  const cooling = votes["WAIT"] ?? 0;
  const reject = votes["RUN_AWAY"] ?? 0;
  const total = approve + cooling + reject;
  const safe = total > 0 ? total : 1;
  const approvePct = Math.round((approve / safe) * 100);
  const coolingPct = Math.round((cooling / safe) * 100);
  const rejectPct = Math.round((reject / safe) * 100);
  let majorityVerdict: VerdictType;
  if (total === 0) {
    majorityVerdict = "MORE_EVIDENCE_NEEDED";
  } else if (approve > total / 2) {
    majorityVerdict = "APPROVED_BY_JURY";
  } else if (cooling > approve && cooling > reject) {
    majorityVerdict = "COOLING_RECOMMENDED";
  } else if (reject > approve && reject > cooling) {
    majorityVerdict = "WALLET_PROTECTED";
  } else {
    majorityVerdict = "JURY_DIVIDED";
  }
  return { totalVerdictVotes: total, approvePct, coolingPct, rejectPct, majorityVerdict };
}

// ── 定制投票文案模板（按商品分类）──
const customVoteTemplates: Record<string, { type: ReactionType; text: string }[]> = {
  "运动": [
    { type: "WORTH_IT", text: "批准，前提是一周跑三次" },
    { type: "WAIT", text: "建议先去楼下跑七天" },
    { type: "RUN_AWAY", text: "家里的衣架已经够用了" },
  ],
  "香薰": [
    { type: "WORTH_IT", text: "批准，情绪价值也是价值" },
    { type: "WAIT", text: "建议先点完家里的" },
    { type: "RUN_AWAY", text: "上次买的还没有拆" },
  ],
  "数码": [
    { type: "WORTH_IT", text: "批准，通勤安静很重要" },
    { type: "WAIT", text: "建议先试戴再决定" },
    { type: "RUN_AWAY", text: "现有耳机还能继续用" },
  ],
};
export function getCustomVoteOptions(category: string): { type: ReactionType; text: string }[] {
  return customVoteTemplates[category] ?? [];
}

// ── 旧购物案记录兼容 ──
export function normalizeCaseRecord(r: Record<string, unknown>): {
  caseNumber?: string;
  title?: string;
  caseStatus?: CaseStatus;
} {
  return {
    caseNumber: typeof r.caseNumber === "string" ? r.caseNumber : undefined,
    title: typeof r.title === "string" ? r.title : undefined,
    caseStatus: typeof r.caseStatus === "string" && caseStatuses.includes(r.caseStatus as CaseStatus) ? r.caseStatus as CaseStatus : undefined,
  };
}

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
