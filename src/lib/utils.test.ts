import{describe,it,expect}from"vitest";import{yuanToCents}from"./utils";describe("money",()=>it("converts yuan without float drift",()=>expect(yuanToCents(19.9)).toBe(1990)));
