export const demoBudget={ livingAllowance:600000,fixedExpenses:180000,savingGoal:120000,discretionaryBudget:300000,spentAmount:114000,remainingAmount:186000,safeBalance:50000 };
export const demoRequests=[
  {id:"headphones",itemName:"降噪耳机",priceCents:89900,category:"数码",reason:"通勤时想安静听播客，但家里已有一副普通耳机。",status:"PENDING_APPROVAL" as const,riskScore:60,createdAt:"今天 10:24",reviewer:"搭子",mood:"STRESSED" as const,visibility:"FRIENDS" as const},
  {id:"dress",itemName:"亚麻连衣裙",priceCents:42900,category:"服饰",reason:"下周参加朋友生日聚会，衣柜里没有适合夏天的浅色裙子。",status:"COOLING_OFF" as const,riskScore:35,createdAt:"昨天 21:10",reviewer:"搭子",mood:"HAPPY" as const,visibility:"FRIENDS" as const},
  {id:"coffee",itemName:"手冲咖啡套装",priceCents:29900,category:"家居",reason:"想在家学习手冲，已经连续考虑了两周。",status:"GIVEN_UP" as const,riskScore:25,createdAt:"8 月 12 日",reviewer:"搭子",mood:"ACTUAL_NEED" as const,visibility:"PRIVATE" as const}
];
