import { z } from "zod";

export const requestStatuses = ["DRAFT","PENDING_APPROVAL","NEED_MORE_INFO","APPROVED","REJECTED","COOLING_OFF","READY_TO_BUY","PURCHASED","GIVEN_UP","CANCELLED","EXPIRED"] as const;
export type RequestStatus = typeof requestStatuses[number];
export const statusLabel: Record<RequestStatus, string> = { DRAFT:"草稿",PENDING_APPROVAL:"等待审批",NEED_MORE_INFO:"待补充",APPROVED:"已通过",REJECTED:"暂不建议",COOLING_OFF:"冷静期",READY_TO_BUY:"可以购买",PURCHASED:"已购买",GIVEN_UP:"决定不买",CANCELLED:"已取消",EXPIRED:"已超时" };

export const transitions: Record<RequestStatus, RequestStatus[]> = {
  DRAFT:["PENDING_APPROVAL","CANCELLED"], PENDING_APPROVAL:["NEED_MORE_INFO","APPROVED","REJECTED","COOLING_OFF","CANCELLED","EXPIRED"],
  NEED_MORE_INFO:["PENDING_APPROVAL","CANCELLED"], APPROVED:["COOLING_OFF","READY_TO_BUY","CANCELLED"],
  REJECTED:["GIVEN_UP","CANCELLED"], COOLING_OFF:["READY_TO_BUY","GIVEN_UP","CANCELLED"], READY_TO_BUY:["PURCHASED","GIVEN_UP","CANCELLED"],
  PURCHASED:[], GIVEN_UP:[], CANCELLED:[], EXPIRED:["PENDING_APPROVAL","CANCELLED"]
};
export function canTransition(from: RequestStatus, to: RequestStatus) { return transitions[from].includes(to); }

export const budgetSchema = z.object({
  livingAllowance: z.coerce.number().min(0), fixedExpenses: z.coerce.number().min(0), savingGoal: z.coerce.number().min(0),
  spentAmount: z.coerce.number().min(0), safeBalance: z.coerce.number().min(0), periodStart: z.string().min(1), periodEnd: z.string().min(1)
}).refine(v => v.livingAllowance >= v.fixedExpenses + v.savingGoal, { message:"生活费需覆盖固定支出和储蓄目标" });

export const purchaseSchema = z.object({
  itemName: z.string().trim().min(2,"请填写至少 2 个字"), priceYuan: z.coerce.number().positive("价格必须大于 0"),
  category: z.string().min(1), reason: z.string().trim().min(10,"再具体说一点吧（至少 10 个字）"), reviewerId: z.string().uuid().optional(),
  productUrl: z.string().url().or(z.literal("")).optional(), impactIfNotPurchased: z.string().optional(), hasSimilarItem: z.boolean().default(false),
  desiredHours: z.coerce.number().min(0).default(0), limitedPromotion: z.boolean().default(false), plannedPurchase: z.boolean().default(false), necessity: z.boolean().default(false), coolingHours: z.coerce.number().min(0).max(720).default(24)
});
