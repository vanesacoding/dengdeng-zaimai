declare const Deno: {
  env: { get(name: string): string | undefined };
  serve(handler: (request: Request) => Response | Promise<Response>): void;
};

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

    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) return json({ error: "AI 服务尚未配置" }, 503);

    const prompt = `你是“等等法庭”的AI购物案书记员。把用户原话包装成适合年轻女性社区展示的购物案，但不得虚构事实、羞辱用户或替用户决定买不买。幽默只针对购物理由中的矛盾。\n商品：${itemName}\n价格：${Number(priceYuan) || 0}元\n用户原话：${originalReason}\n语气：${tone}\n生成3个12至28字的标题、1段40至70字案情陈述、1条10至20字案由。`;
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: Deno.env.get("OPENAI_MODEL") || "gpt-5-mini",
        input: prompt,
        text: { format: { type: "json_schema", name: "shopping_case", strict: true, schema: {
          type: "object", additionalProperties: false,
          properties: {
            caseTitles: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 3 },
            caseStatement: { type: "string" },
            oneLineSummary: { type: "string" },
            tone: { type: "string", enum: ["light", "dramatic", "official"] },
          },
          required: ["caseTitles", "caseStatement", "oneLineSummary", "tone"],
        } } },
      }),
    });
    const result = await response.json();
    if (!response.ok) return json({ error: "书记员暂时离席，请稍后再试" }, 502);
    const text = result.output?.flatMap((item: { content?: Array<{ type?: string; text?: string }> }) => item.content || []).find((item: { type?: string }) => item.type === "output_text")?.text;
    if (!text) return json({ error: "没有生成有效内容" }, 502);
    return json(JSON.parse(text));
  } catch {
    return json({ error: "书记员暂时离席，请稍后再试" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}
