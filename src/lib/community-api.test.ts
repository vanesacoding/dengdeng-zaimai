import { describe, it, expect } from "vitest";
import {
  isContentVisible,
  isContentVisibleOnSquare,
  canDeleteContent,
  canDeleteComment,
  isValidReport,
  canBlockUser,
  canAddFollowUp,
} from "./community-api";

describe("block visibility", () => {
  it("hides content from blocked users", () => {
    expect(isContentVisible("u2", "VISIBLE", ["u2"])).toBe(false);
  });
  it("shows content from non-blocked users", () => {
    expect(isContentVisible("u2", "VISIBLE", ["u3"])).toBe(true);
  });
  it("hides rejected/removed/limited content", () => {
    expect(isContentVisible("u2", "REJECTED", [])).toBe(false);
    expect(isContentVisible("u2", "REMOVED", [])).toBe(false);
    expect(isContentVisible("u2", "LIMITED", [])).toBe(false);
  });
  it("shows visible and pending content", () => {
    expect(isContentVisible("u2", "VISIBLE", [])).toBe(true);
    expect(isContentVisible("u2", "PENDING", [])).toBe(true);
  });
  it("shows undefined moderation as visible", () => {
    expect(isContentVisible("u2", undefined, [])).toBe(true);
  });
});

describe("square visibility (public square)", () => {
  it("shows own content if not removed", () => {
    expect(isContentVisibleOnSquare("me", "VISIBLE", [], "me")).toBe(true);
    expect(isContentVisibleOnSquare("me", "PENDING", [], "me")).toBe(true);
    expect(isContentVisibleOnSquare("me", "REMOVED", [], "me")).toBe(false);
  });
  it("shows others content only if VISIBLE", () => {
    expect(isContentVisibleOnSquare("other", "VISIBLE", [], "me")).toBe(true);
    expect(isContentVisibleOnSquare("other", "PENDING", [], "me")).toBe(false);
  });
  it("hides blocked users content on square", () => {
    expect(isContentVisibleOnSquare("blocked", "VISIBLE", ["blocked"], "me")).toBe(false);
  });
});

describe("delete content permissions", () => {
  it("allows deleting own content", () => {
    expect(canDeleteContent("me", "me")).toBe(true);
  });
  it("prevents deleting others content", () => {
    expect(canDeleteContent("me", "other")).toBe(false);
  });
  it("allows deleting own comments", () => {
    expect(canDeleteComment("me", "me")).toBe(true);
  });
  it("prevents deleting others comments", () => {
    expect(canDeleteComment("me", "other")).toBe(false);
  });
});

describe("report validation", () => {
  it("accepts valid reasons", () => {
    expect(isValidReport("内容不当", "")).toBe(true);
    expect(isValidReport("广告引流", "详细说明")).toBe(true);
  });
  it("rejects invalid reasons", () => {
    expect(isValidReport("随便举报", "")).toBe(false);
    expect(isValidReport("", "")).toBe(false);
  });
  it("rejects overly long detail", () => {
    expect(isValidReport("其他", "x".repeat(501))).toBe(false);
  });
  it("accepts max length detail", () => {
    expect(isValidReport("其他", "x".repeat(500))).toBe(true);
  });
});

describe("block validation", () => {
  it("prevents blocking self", () => {
    expect(canBlockUser("me", "me")).toBe(false);
  });
  it("allows blocking others", () => {
    expect(canBlockUser("me", "other")).toBe(true);
  });
});

describe("follow-up validation", () => {
  it("requires a result before follow-up", () => {
    expect(canAddFollowUp(false, 0, false)).toBe(false);
  });
  it("requires at least 1 day after result", () => {
    expect(canAddFollowUp(true, 0, false)).toBe(false);
    expect(canAddFollowUp(true, 1, false)).toBe(true);
  });
  it("prevents duplicate follow-ups", () => {
    expect(canAddFollowUp(true, 5, true)).toBe(false);
  });
  it("allows follow-up after sufficient time", () => {
    expect(canAddFollowUp(true, 30, false)).toBe(true);
  });
});
