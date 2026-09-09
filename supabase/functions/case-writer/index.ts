declare const Deno: {
  env: { get(name: string): string | undefined };
  serve(handler: (request: Request) => Response | Promise<Response>): void;
};

// 豆包（火山方舟）版购物案书记员
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const token = request.headers.get("Authorization");
    if (!token) return json({ error: "请先登录" }, 401);

    const { itemName, priceYuan, originalReason, tone = "light" } = await request.json();
    if (typeof itemName !== "string" || typeof originalReason !== "string" || itemName.trim().length < 1 || originalReason.trim().length < 4) {
      return json({ error: "商品名称和购买理由不能为空" }, 400);
    }

    const apiKey = Deno.env.get("ARK_API_KEY");
    if (!apiKey) return json({ error: "AI 服务尚未配置" }, 503);
    const model = Deno.env.get("ARK_MODEL") || "doubao-seed-2-1-turbo-260628";

    const prompt = `你是“等等法庭”的AI购物案书记员。把用户原话包装成适合年轻女性社区展示的购物案，但不得虚构事实、羞辱用户或替用户决定买不买。幽默只针对购物理由中的矛盾。
商品：${itemName}
价格：${Number(priceYuan) || 0}元
用户原话：${originalReason}
语气：${tone}
只输出一个JSON对象，格式为 {"caseTitles":["标题1","标题2","标题3"],"caseStatement":"案情陈述","oneLineSummary":"案由","tone":"${tone}"}。其中3个标题各12至28字，案情陈述40至70字，案由10至20字。不要输出任何JSON以外的文字。`;

    const response = await fetch("https://ark.cn-beijing.volces.com/api/v3/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: "你是购物案书记员，只输出符合要求的JSON对象，不输出其他文字。" },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
      }),
    });
    const result = await response.json();
    if (!response.ok) return json({ error: "书记员暂时离席，请稍后再试", detail: `ark ${response.status}: ${JSON.stringify(result).slice(0, 300)}` }, 502);

    const content = result.choices?.[0]?.message?.content;
    if (typeof content !== "string") return json({ error: "没有生成有效内容" }, 502);

    const parsed = JSON.parse(content);
    // 兜底校验：标题补齐到 3 个
    const titles = Array.isArray(parsed.caseTitles) ? parsed.caseTitles.filter((t: unknown): t is string => typeof t === "string" && t.trim().length > 0) : [];
    while (titles.length < 3) titles.push(`${itemName}购买申请 ${["一", "二", "三"][titles.length] ?? ""}`.trim());
    return json({
      caseTitles: titles.slice(0, 3),
      caseStatement: typeof parsed.caseStatement === "string" ? parsed.caseStatement : "",
      oneLineSummary: typeof parsed.oneLineSummary === "string" ? parsed.oneLineSummary : `申请购入${itemName}`,
      tone: ["light", "dramatic", "official"].includes(parsed.tone) ? parsed.tone : tone,
    });
  } catch (err) {
    return json({ error: "书记员暂时离席，请稍后再试", detail: String(err).slice(0, 300) }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}
