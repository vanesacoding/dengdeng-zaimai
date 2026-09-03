import { describe, it, expect } from "vitest";
import {
  canTransition, friendlyRiskLabel, purchaseSchema, statusLabel,
  getGreeting, publicBudgetLabel, normalizeRequest,
  isPubliclyVisible, isFriendsVisible,
  resultTypes, resultLabel, reactionTypes, reactionLabel,
  visibilities, visibilityLabel,
} from "./domain";

describe("request state machine", () => {
  it("allows review decisions", () => {
    expect(canTransition("PENDING_APPROVAL", "COOLING_OFF")).toBe(true);
  });
  it("blocks changes after purchase", () => {
    expect(canTransition("PURCHASED", "CANCELLED")).toBe(false);
  });
  it("allows expired to re-pending", () => {
    expect(canTransition("EXPIRED", "PENDING_APPROVAL")).toBe(true);
  });
  it("blocks invalid from DRAFT", () => {
    expect(canTransition("DRAFT", "PURCHASED")).toBe(false);
  });
});

describe("friendly product language", () => {
  it("maps legacy states without changing stored values", () => {
    expect(statusLabel.PENDING_APPROVAL).toBe("等闺蜜参谋");
    expect(statusLabel.APPROVED).toBe("她觉得可以买");
    expect(statusLabel.GIVEN_UP).toBe("成功拔草");
    expect(statusLabel.COOLING_OFF).toBe("冷静盒里");
  });
  it("turns scores into supportive labels", () => {
    expect(friendlyRiskLabel(10)).toBe("比较安心");
    expect(friendlyRiskLabel(78)).toBe("建议多给自己一点时间");
    expect(friendlyRiskLabel(30)).toBe("可以再想想");
    expect(friendlyRiskLabel(60)).toBe("可能有点上头");
  });
});

describe("quick desire form", () => {
  const base = {
    itemName: "香薰蜡烛", priceYuan: 99, category: "家居",
    reason: "最近想让房间更舒服", productUrl: "https://example.com/item",
  };
  it("accepts the short first screen", () => {
    expect(purchaseSchema.safeParse(base).success).toBe(true);
  });
  it("needs either a product image or link", () => {
    expect(purchaseSchema.safeParse({ ...base, productUrl: "" }).success).toBe(false);
  });
});

describe("getGreeting", () => {
  it("returns morning greeting before 11", () => {
    expect(getGreeting(new Date("2025-01-01T08:00:00"))).toBe("早上好");
  });
  it("returns noon greeting 11-14", () => {
    expect(getGreeting(new Date("2025-01-01T12:30:00"))).toBe("中午好");
  });
  it("returns afternoon greeting 14-18", () => {
    expect(getGreeting(new Date("2025-01-01T16:00:00"))).toBe("下午好");
  });
  it("returns evening greeting 18-22", () => {
    expect(getGreeting(new Date("2025-01-01T20:00:00"))).toBe("晚上好");
  });
  it("returns late night greeting after 22", () => {
    expect(getGreeting(new Date("2025-01-01T23:00:00"))).toBe("夜深了");
  });
  it("returns late night greeting before 6", () => {
    expect(getGreeting(new Date("2025-01-01T03:00:00"))).toBe("夜深了");
  });
});

describe("publicBudgetLabel", () => {
  it("returns relaxed when ratio is low", () => {
    expect(publicBudgetLabel(100000, 5000)).toBe("预算比较宽松");
  });
  it("returns consider when ratio is moderate", () => {
    expect(publicBudgetLabel(100000, 30000)).toBe("需要稍微考虑");
  });
  it("returns tight when ratio is high", () => {
    expect(publicBudgetLabel(100000, 80000)).toBe("这个月预算有点紧");
  });
  it("returns tight when remaining is zero or negative", () => {
    expect(publicBudgetLabel(0, 1000)).toBe("这个月预算有点紧");
    expect(publicBudgetLabel(-1000, 100)).toBe("这个月预算有点紧");
  });
});

describe("normalizeRequest (old data compat)", () => {
  it("preserves valid mood and visibility", () => {
    const r = normalizeRequest({ mood: "HAPPY", visibility: "FRIENDS" });
    expect(r.mood).toBe("HAPPY");
    expect(r.visibility).toBe("FRIENDS");
  });
  it("returns undefined for missing fields", () => {
    const r = normalizeRequest({ itemName: "耳机" });
    expect(r.mood).toBeUndefined();
    expect(r.visibility).toBeUndefined();
  });
  it("returns undefined for invalid enum values", () => {
    const r = normalizeRequest({ mood: "EXCITED", visibility: "EVERYONE" });
    expect(r.mood).toBeUndefined();
    expect(r.visibility).toBeUndefined();
  });
});

describe("visibility checks", () => {
  it("isPubliclyVisible only true for PUBLIC", () => {
    expect(isPubliclyVisible("PUBLIC")).toBe(true);
    expect(isPubliclyVisible("FRIENDS")).toBe(false);
    expect(isPubliclyVisible("PRIVATE")).toBe(false);
    expect(isPubliclyVisible(undefined)).toBe(false);
  });
  it("isFriendsVisible true for FRIENDS and PUBLIC", () => {
    expect(isFriendsVisible("FRIENDS")).toBe(true);
    expect(isFriendsVisible("PUBLIC")).toBe(true);
    expect(isFriendsVisible("PRIVATE")).toBe(false);
    expect(isFriendsVisible(undefined)).toBe(false);
  });
});

describe("result types and labels", () => {
  it("has all 6 result types", () => {
    expect(resultTypes).toHaveLength(6);
    expect(resultTypes).toContain("PURCHASED_LOVED");
    expect(resultTypes).toContain("PURCHASED_REGRETTED");
    expect(resultTypes).toContain("STILL_THINKING");
    expect(resultTypes).toContain("GIVEN_UP");
    expect(resultTypes).toContain("BOUGHT_ALTERNATIVE");
    expect(resultTypes).toContain("POSTPONED");
  });
  it("maps labels correctly", () => {
    expect(resultLabel.PURCHASED_LOVED).toBe("买了，真香");
    expect(resultLabel.GIVEN_UP).toBe("成功拔草");
    expect(resultLabel.BOUGHT_ALTERNATIVE).toBe("换了更合适的");
    expect(resultLabel.POSTPONED).toBe("暂时搁置");
  });
});

describe("reaction types and labels", () => {
  it("has all 6 reaction types", () => {
    expect(reactionTypes).toHaveLength(6);
  });
  it("maps labels correctly", () => {
    expect(reactionLabel.WORTH_IT).toBe("值得买");
    expect(reactionLabel.RUN_AWAY).toBe("快跑");
    expect(reactionLabel.SAME_DESIRE).toBe("我也想买");
    expect(reactionLabel.FOLLOW_UP).toBe("蹲后续");
    expect(reactionLabel.SAVE).toBe("收藏");
  });
});

describe("visibility labels", () => {
  it("has all 3 visibilities", () => {
    expect(visibilities).toHaveLength(3);
  });
  it("maps labels correctly", () => {
    expect(visibilityLabel.PRIVATE).toBe("仅自己可见");
    expect(visibilityLabel.FRIENDS).toBe("只给闺蜜看");
    expect(visibilityLabel.PUBLIC).toBe("发到想买广场");
  });
});
