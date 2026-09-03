import { describe, it, expect } from "vitest";
import {
  generateCaseNumber,
  formatCaseNumberDisplay,
  normalizeChannel,
  caseStatusLabel,
  caseStatuses,
  verdictLabel,
  verdictTypes,
  evidenceLabel,
  evidenceTypes,
  witnessRoleLabel,
  witnessRoles,
  juryVoteLabel,
  verdictVoteTypes,
  nonVerdictVoteTypes,
  summarizeVerdict,
  detectPlotTwist,
  closedCaseLabel,
  generateTitleCandidates,
  isSafeTitle,
  isSafeComment,
  getCustomVoteOptions,
  isCommercialSource,
  normalizeCaseRecord,
  type VoteCounts,
} from "./domain";

describe("case number generation", () => {
  it("generates DD-YYYY-XXXX format", () => {
    const num = generateCaseNumber();
    expect(num).toMatch(/^DD-\d{4}-\d{4}$/);
  });
  it("does not directly expose a database primary key", () => {
    const num = generateCaseNumber();
    expect(num.split("-").length).toBe(3);
    expect(num).not.toContain("uuid");
    // Random part should be 4 digits, not a long sequential ID
    const parts = num.split("-");
    expect(parts[2].length).toBe(4);
  });
  it("formats case number for display", () => {
    expect(formatCaseNumberDisplay("DD-2026-0826")).toBe("第 0826 号购物案");
    expect(formatCaseNumberDisplay("DD-2026-0001")).toBe("第 0001 号购物案");
  });
  it("handles malformed case number gracefully", () => {
    expect(formatCaseNumberDisplay("invalid")).toBe("invalid");
  });
});

describe("legacy channel compatibility mapping", () => {
  it("maps old Chinese channel keys to new court channels", () => {
    expect(normalizeChannel("正在纠结")).toBe("NEED_JURY");
    expect(normalizeChannel("今日上头")).toBe("HOT_CASES");
    expect(normalizeChannel("成功拔草")).toBe("GIVEN_UP");
    expect(normalizeChannel("买后真香")).toBe("PLOT_TWIST");
    expect(normalizeChannel("买后后悔")).toBe("PLOT_TWIST");
    expect(normalizeChannel("姐妹求参谋")).toBe("NEED_JURY");
  });
  it("maps previous enum values to new court channels", () => {
    expect(normalizeChannel("NEED_ADVICE")).toBe("NEED_JURY");
    expect(normalizeChannel("THINKING")).toBe("NEED_JURY");
    expect(normalizeChannel("PURCHASED")).toBe("CLOSED");
    expect(normalizeChannel("LOVED")).toBe("PLOT_TWIST");
    expect(normalizeChannel("REGRETTED")).toBe("PLOT_TWIST");
    expect(normalizeChannel("TRENDING_TODAY")).toBe("HOT_CASES");
  });
  it("passes through valid new channel values", () => {
    expect(normalizeChannel("HOT_CASES")).toBe("HOT_CASES");
    expect(normalizeChannel("CLOSED")).toBe("CLOSED");
  });
  it("defaults to NEED_JURY for unknown values", () => {
    expect(normalizeChannel("unknown")).toBe("NEED_JURY");
  });
});

describe("case status labels", () => {
  it("has all 6 statuses", () => {
    expect(caseStatuses).toHaveLength(6);
    expect(caseStatuses).toContain("OPEN");
    expect(caseStatuses).toContain("CLOSED");
  });
  it("maps labels correctly", () => {
    expect(caseStatusLabel.OPEN).toBe("正在审理");
    expect(caseStatusLabel.CLOSED).toBe("已结案");
    expect(caseStatusLabel.COOLING).toBe("钱包保护期");
  });
});

describe("verdict labels", () => {
  it("has all 5 verdict types", () => {
    expect(verdictTypes).toHaveLength(5);
  });
  it("maps labels correctly", () => {
    expect(verdictLabel.APPROVED_BY_JURY).toBe("陪审团多数批准");
    expect(verdictLabel.WALLET_PROTECTED).toBe("建议保护钱包");
    expect(verdictLabel.JURY_DIVIDED).toBe("陪审团意见严重分裂");
  });
});

describe("jury vote counting", () => {
  const baseVotes: VoteCounts = {
    WORTH_IT: 0, WAIT: 0, RUN_AWAY: 0, SAME_DESIRE: 0, FOLLOW_UP: 0, SAVE: 0,
  };

  it("counts only WORTH_IT, WAIT, RUN_AWAY as verdict votes", () => {
    const votes: VoteCounts = { ...baseVotes, WORTH_IT: 10, WAIT: 5, RUN_AWAY: 5, SAME_DESIRE: 20, FOLLOW_UP: 15, SAVE: 10 };
    const summary = summarizeVerdict(votes);
    expect(summary.totalVerdictVotes).toBe(20);
    expect(summary.approvePct).toBe(50);
    expect(summary.coolingPct).toBe(25);
    expect(summary.rejectPct).toBe(25);
  });

  it("SAME_DESIRE does not count toward verdict", () => {
    const votes: VoteCounts = { ...baseVotes, WORTH_IT: 10, SAME_DESIRE: 100 };
    const summary = summarizeVerdict(votes);
    expect(summary.totalVerdictVotes).toBe(10);
    expect(summary.approvePct).toBe(100);
  });

  it("FOLLOW_UP does not count toward verdict", () => {
    const votes: VoteCounts = { ...baseVotes, WORTH_IT: 10, FOLLOW_UP: 100 };
    const summary = summarizeVerdict(votes);
    expect(summary.totalVerdictVotes).toBe(10);
  });

  it("SAVE does not count toward verdict", () => {
    const votes: VoteCounts = { ...baseVotes, WORTH_IT: 10, SAVE: 100 };
    const summary = summarizeVerdict(votes);
    expect(summary.totalVerdictVotes).toBe(10);
  });

  it("returns MORE_EVIDENCE_NEEDED when no verdict votes", () => {
    const votes: VoteCounts = { ...baseVotes, SAME_DESIRE: 50, FOLLOW_UP: 30, SAVE: 20 };
    const summary = summarizeVerdict(votes);
    expect(summary.majorityVerdict).toBe("MORE_EVIDENCE_NEEDED");
    expect(summary.totalVerdictVotes).toBe(0);
  });

  it("returns APPROVED_BY_JURY when approve > 50%", () => {
    const votes: VoteCounts = { ...baseVotes, WORTH_IT: 11, WAIT: 5, RUN_AWAY: 4 };
    const summary = summarizeVerdict(votes);
    expect(summary.majorityVerdict).toBe("APPROVED_BY_JURY");
  });

  it("returns COOLING_RECOMMENDED when cooling is highest", () => {
    const votes: VoteCounts = { ...baseVotes, WORTH_IT: 4, WAIT: 10, RUN_AWAY: 3 };
    const summary = summarizeVerdict(votes);
    expect(summary.majorityVerdict).toBe("COOLING_RECOMMENDED");
  });

  it("returns WALLET_PROTECTED when reject is highest", () => {
    const votes: VoteCounts = { ...baseVotes, WORTH_IT: 3, WAIT: 4, RUN_AWAY: 10 };
    const summary = summarizeVerdict(votes);
    expect(summary.majorityVerdict).toBe("WALLET_PROTECTED");
  });

  it("returns JURY_DIVIDED when no clear majority", () => {
    const votes: VoteCounts = { ...baseVotes, WORTH_IT: 5, WAIT: 5, RUN_AWAY: 5 };
    const summary = summarizeVerdict(votes);
    expect(summary.majorityVerdict).toBe("JURY_DIVIDED");
  });

  it("nonVerdictVoteTypes excludes SAME_DESIRE, FOLLOW_UP, SAVE", () => {
    expect(nonVerdictVoteTypes).not.toContain("WORTH_IT");
    expect(nonVerdictVoteTypes).not.toContain("WAIT");
    expect(nonVerdictVoteTypes).not.toContain("RUN_AWAY");
    expect(nonVerdictVoteTypes).toContain("SAME_DESIRE");
    expect(nonVerdictVoteTypes).toContain("FOLLOW_UP");
    expect(nonVerdictVoteTypes).toContain("SAVE");
  });

  it("verdictVoteTypes only includes WORTH_IT, WAIT, RUN_AWAY", () => {
    expect(verdictVoteTypes).toHaveLength(3);
    expect(verdictVoteTypes).toContain("WORTH_IT");
    expect(verdictVoteTypes).toContain("WAIT");
    expect(verdictVoteTypes).toContain("RUN_AWAY");
  });
});

describe("plot twist detection", () => {
  it("detects JURY_WRONG_LOVED when jury says don't buy but result is loved", () => {
    expect(detectPlotTwist("WALLET_PROTECTED", "PURCHASED_LOVED")).toBe("JURY_WRONG_LOVED");
    expect(detectPlotTwist("COOLING_RECOMMENDED", "PURCHASED_LOVED")).toBe("JURY_WRONG_LOVED");
  });
  it("detects JURY_WRONG_REGRETTED when jury approves but result is regretted", () => {
    expect(detectPlotTwist("APPROVED_BY_JURY", "PURCHASED_REGRETTED")).toBe("JURY_WRONG_REGRETTED");
  });
  it("detects COOLING_WORKED when jury recommends cooling and user gave up", () => {
    expect(detectPlotTwist("COOLING_RECOMMENDED", "GIVEN_UP")).toBe("COOLING_WORKED");
  });
  it("detects ALTERNATIVE_WON when result is BOUGHT_ALTERNATIVE", () => {
    expect(detectPlotTwist("APPROVED_BY_JURY", "BOUGHT_ALTERNATIVE")).toBe("ALTERNATIVE_WON");
  });
  it("detects NEED_REVIEW for PURCHASED_REGRETTED without matching verdict", () => {
    expect(detectPlotTwist("WALLET_PROTECTED", "PURCHASED_REGRETTED")).toBe("NEED_REVIEW");
  });
  it("returns undefined when no result type", () => {
    expect(detectPlotTwist("APPROVED_BY_JURY", undefined)).toBeUndefined();
  });
  it("returns undefined when result is PURCHASED_LOVED and jury approved (no twist)", () => {
    expect(detectPlotTwist("APPROVED_BY_JURY", "PURCHASED_LOVED")).toBeUndefined();
  });
});

describe("closed case label mapping", () => {
  it("maps all result types to court-style labels", () => {
    expect(closedCaseLabel.PURCHASED_LOVED).toBe("买了，判决正确");
    expect(closedCaseLabel.PURCHASED_REGRETTED).toBe("买了，但想申请重审");
    expect(closedCaseLabel.GIVEN_UP).toBe("没买，钱包成功获救");
    expect(closedCaseLabel.BOUGHT_ALTERNATIVE).toBe("改判平替方案");
    expect(closedCaseLabel.POSTPONED).toBe("延期审理");
    expect(closedCaseLabel.STILL_THINKING).toBe("本案继续审理");
  });
});

describe("content safety validation", () => {
  it("rejects banned phrases in titles", () => {
    expect(isSafeTitle("穷还买什么")).toBe(false);
    expect(isSafeTitle("败家女申请")).toBe(false);
    expect(isSafeTitle("月薪这么低还敢买")).toBe(false);
    expect(isSafeTitle("脑子进水了")).toBe(false);
    expect(isSafeTitle("有罪")).toBe(false);
  });
  it("accepts safe titles", () => {
    expect(isSafeTitle("《关于我试图用买东西改变人生的申请》")).toBe(true);
    expect(isSafeTitle("《已有八个，但这个颜色确实没有》")).toBe(true);
  });
  it("rejects banned phrases in comments", () => {
    expect(isSafeComment("穷还买什么")).toBe(false);
    expect(isSafeComment("败家")).toBe(false);
    expect(isSafeComment("活该后悔")).toBe(false);
  });
  it("accepts safe comments", () => {
    expect(isSafeComment("我买了同款，用了三次开始积灰")).toBe(true);
    expect(isSafeComment("建议先去店里试试")).toBe(true);
  });
});

describe("title candidate generation", () => {
  it("generates titles for hasSimilarItem", () => {
    const candidates = generateTitleCandidates("想买", true, false, "服饰");
    expect(candidates.length).toBeGreaterThan(0);
    expect(candidates.some(t => t.includes("八个"))).toBe(true);
  });
  it("generates titles for limitedPromotion", () => {
    const candidates = generateTitleCandidates("限时优惠", false, true, "数码");
    expect(candidates.some(t => t.includes("限时优惠"))).toBe(true);
  });
  it("generates titles for 运动 category", () => {
    const candidates = generateTitleCandidates("想运动", false, false, "运动");
    expect(candidates.some(t => t.includes("运动"))).toBe(true);
  });
  it("generates titles for stress-related reason", () => {
    const candidates = generateTitleCandidates("工作压力很大", false, false, "生活必需");
    expect(candidates.some(t => t.includes("甜"))).toBe(true);
  });
  it("returns at most 3 candidates", () => {
    const candidates = generateTitleCandidates("test", true, true, "运动");
    expect(candidates.length).toBeLessThanOrEqual(3);
  });
  it("always includes generic candidates as fallback", () => {
    const candidates = generateTitleCandidates("random", false, false, "其他");
    expect(candidates.length).toBeGreaterThan(0);
  });
});

describe("custom vote options", () => {
  it("returns custom options for 运动 category", () => {
    const options = getCustomVoteOptions("运动");
    expect(options.length).toBe(3);
    expect(options[0].type).toBe("WORTH_IT");
  });
  it("returns custom options for 数码 category", () => {
    const options = getCustomVoteOptions("数码");
    expect(options.length).toBe(3);
  });
  it("returns empty for unknown category", () => {
    const options = getCustomVoteOptions("unknown");
    expect(options).toEqual([]);
  });
  it("all custom options map to valid reaction types", () => {
    const options = getCustomVoteOptions("运动");
    options.forEach(opt => {
      expect(["WORTH_IT", "WAIT", "RUN_AWAY"]).toContain(opt.type);
    });
  });
});

describe("content source commercial detection", () => {
  it("identifies SPONSORED as commercial", () => {
    expect(isCommercialSource("SPONSORED")).toBe(true);
  });
  it("identifies USER as non-commercial", () => {
    expect(isCommercialSource("USER")).toBe(false);
  });
  it("identifies EDITORIAL as non-commercial", () => {
    expect(isCommercialSource("EDITORIAL")).toBe(false);
  });
});

describe("normalize case record (old data compat)", () => {
  it("preserves valid case fields", () => {
    const r = normalizeCaseRecord({ caseNumber: "DD-2026-0001", title: "Test", caseStatus: "OPEN" });
    expect(r.caseNumber).toBe("DD-2026-0001");
    expect(r.title).toBe("Test");
    expect(r.caseStatus).toBe("OPEN");
  });
  it("returns undefined for missing fields", () => {
    const r = normalizeCaseRecord({ itemName: "耳机" });
    expect(r.caseNumber).toBeUndefined();
    expect(r.title).toBeUndefined();
    expect(r.caseStatus).toBeUndefined();
  });
  it("returns undefined for invalid caseStatus", () => {
    const r = normalizeCaseRecord({ caseStatus: "INVALID" });
    expect(r.caseStatus).toBeUndefined();
  });
});

describe("evidence and witness role enums", () => {
  it("has all evidence types", () => {
    expect(evidenceTypes).toHaveLength(10);
    expect(evidenceTypes).toContain("HAS_SIMILAR_ITEM");
    expect(evidenceTypes).toContain("CUSTOM");
  });
  it("maps evidence labels", () => {
    expect(evidenceLabel.HAS_SIMILAR_ITEM).toBe("家里已有类似物品");
    expect(evidenceLabel.BUDGET_TIGHT).toBe("本月预算有点紧");
  });
  it("has all witness roles", () => {
    expect(witnessRoles).toHaveLength(7);
    expect(witnessRoles).toContain("SAME_ITEM_OWNER");
    expect(witnessRoles).toContain("NONE");
  });
  it("maps witness role labels", () => {
    expect(witnessRoleLabel.SAME_ITEM_OWNER).toBe("同款证人");
    expect(witnessRoleLabel.NONE).toBe("普通证词");
  });
});

describe("jury vote display labels", () => {
  it("maps all reaction types to court-style labels", () => {
    expect(juryVoteLabel.WORTH_IT).toBe("批准！她值得");
    expect(juryVoteLabel.WAIT).toBe("判处冷静三天");
    expect(juryVoteLabel.RUN_AWAY).toBe("驳回！保护钱包");
    expect(juryVoteLabel.SAME_DESIRE).toBe("本陪审员也想买");
    expect(juryVoteLabel.FOLLOW_UP).toBe("蹲一个案件后续");
    expect(juryVoteLabel.SAVE).toBe("收藏本案");
  });
});
