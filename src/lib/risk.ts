export type RiskInput = { priceCents:number; remainingCents:number; safeBalanceCents:number; hasSimilarItem:boolean; desiredHours:number; limitedPromotion:boolean; plannedPurchase:boolean; necessity:boolean };
export type RiskResult = { score:number; level:"低风险"|"中风险"|"高风险"|"极高风险"; reasons:string[]; ratio:number };
export function calculateRisk(v: RiskInput): RiskResult {
  let score=0; const reasons:string[]=[]; const ratio=v.remainingCents > 0 ? v.priceCents/v.remainingCents : 1;
  if (ratio>.5) {score+=35;reasons.push("价格超过剩余预算的一半");} else if(ratio>.3){score+=25;reasons.push("价格超过剩余预算的 30%");} else if(ratio>.1){score+=10;reasons.push("价格超过剩余预算的 10%");}
  if(v.remainingCents-v.priceCents<v.safeBalanceCents){score+=25;reasons.push("购买后将低于安全余额");}
  if(v.hasSimilarItem){score+=20;reasons.push("已有类似物品");} if(v.desiredHours<24){score+=15;reasons.push("产生购买想法不足 24 小时");}
  if(v.limitedPromotion){score+=15;reasons.push("受到限时促销影响");} if(v.plannedPurchase){score-=20;reasons.push("属于计划内消费");} if(v.necessity){score-=25;reasons.push("属于生活必需品");}
  score=Math.max(0,Math.min(100,score)); const level=score>=75?"极高风险":score>=50?"高风险":score>=25?"中风险":"低风险";
  return {score,level,reasons,ratio};
}
