import{describe,it,expect}from"vitest";import{canTransition}from"./domain";
describe("request state machine",()=>{it("allows review decisions",()=>expect(canTransition("PENDING_APPROVAL","COOLING_OFF")).toBe(true));it("blocks changes after purchase",()=>expect(canTransition("PURCHASED","CANCELLED")).toBe(false))});
