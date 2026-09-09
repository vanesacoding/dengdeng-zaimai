export type CaseWriterTone = "light" | "dramatic" | "official";

export type CaseWriterInput = {
  itemName: string;
  priceYuan: number;
  originalReason: string;
  tone: CaseWriterTone;
};

export type CaseWriterResult = {
  caseTitles: [string, string, string];
  caseStatement: string;
  oneLineSummary: string;
  tone: CaseWriterTone;
};

export const toneLabels: Record<CaseWriterTone, string> = {
  light: "轻轻吐槽",
  dramatic: "戏很多",
  official: "一本正经",
};

function trimReason(reason: string) {
  return reason.replace(/[。！？!?]+$/g, "").trim();
}

export function createLocalCaseDraft(input: CaseWriterInput): CaseWriterResult {
  const item = input.itemName.trim() || "这件东西";
  const reason = trimReason(input.originalReason) || "当事人表示它很有必要";
  const price = Number.isFinite(input.priceYuan) ? Math.max(0, input.priceYuan) : 0;
  const priceText = price > 0 ? `钱包拟支出 ${price} 元` : "钱包正在等待报价";

  const titles: Record<CaseWriterTone, [string, string, string]> = {
    light: [
      `买了${item}，生活真的会变好吗`,
      `关于${item}能否提升幸福感的申请`,
      `${item}已加入购物车，现申请一个理由`,
    ],
    dramatic: [
      `钱包告急，但${item}正在深情呼唤我`,
      `错过${item}，今晚还能不能睡着`,
      `当事人与${item}一见钟情案`,
    ],
    official: [
      `关于购置${item}必要性的审理申请`,
      `${item}是否属于合理开支的专项评议`,
      `钱包诉${item}疑似冲动消费案`,
    ],
  };
  const statements: Record<CaseWriterTone, string> = {
    dramatic: `当事人因“${reason}”与${item}一见钟情，${priceText}。购物车已经敲响升堂鼓，现请陪审团紧急审理。`,
    light: `当事人最近有个小小心愿：“${reason}。”${priceText}，想请大家帮忙看看，这次心动值不值得认真对待。`,
    official: `经当事人陈述，购置${item}的主要理由为“${reason}”。${priceText}，现就本次支出的必要性提请评议。`,
  };

  return {
    caseTitles: titles[input.tone],
    caseStatement: statements[input.tone],
    oneLineSummary: `申请购入${item}，理由是${reason}`.slice(0, 38),
    tone: input.tone,
  };
}

export function isCaseWriterResult(value: unknown): value is CaseWriterResult {
  if (!value || typeof value !== "object") return false;
  const data = value as Record<string, unknown>;
  return Array.isArray(data.caseTitles) && data.caseTitles.length === 3 && data.caseTitles.every(item => typeof item === "string") && typeof data.caseStatement === "string" && typeof data.oneLineSummary === "string";
}
