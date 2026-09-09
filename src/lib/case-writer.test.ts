import { describe, expect, it } from "vitest";
import { createLocalCaseDraft, isCaseWriterResult } from "./case-writer";

describe("case writer", () => {
  it("creates three concise editable title options", () => {
    const result = createLocalCaseDraft({ itemName: "美容仪", priceYuan: 1999, originalReason: "最近加班，想拯救一下皮肤", tone: "light" });
    expect(result.caseTitles).toHaveLength(3);
    expect(result.caseTitles.every(title => title.includes("美容仪"))).toBe(true);
    expect(result.caseStatement).toContain("最近加班");
    expect(isCaseWriterResult(result)).toBe(true);
  });

  it("changes the statement when the tone changes", () => {
    const input = { itemName: "空气炸锅", priceYuan: 399, originalReason: "想学做饭" };
    const dramatic = createLocalCaseDraft({ ...input, tone: "dramatic" });
    const light = createLocalCaseDraft({ ...input, tone: "light" });
    expect(dramatic.caseStatement).not.toBe(light.caseStatement);
    expect(dramatic.caseTitles).not.toEqual(light.caseTitles);
  });
});
