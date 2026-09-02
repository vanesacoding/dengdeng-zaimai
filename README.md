# 等等再买

移动端优先的朋友消费监督应用。用户提交购买理由与预算影响，朋友提供审批建议，并通过冷静期和月度复盘减少冲动消费。

## 本地运行

要求 Node.js 20+。

```bash
npm install
copy .env.example .env.local
npm run dev
```

打开 `http://localhost:3000`。不填写环境变量时会进入演示模式；首页、申请、审批、冷静期、预算与复盘均可直接浏览。

## Supabase 配置

1. 创建 Supabase 项目。
2. 在 SQL Editor 执行 `supabase/migrations/001_initial.sql`。
3. 在 Authentication 中启用 Email OTP，并把 `/auth/callback` 加入允许的重定向地址。
4. 创建名为 `product-images` 的私有 Storage bucket，限制为 JPEG/PNG/WebP，建议最大 5 MB。
5. 将 Project URL 和 anon key 写入 `.env.local`。

迁移包含 RLS、关系权限、单次审批约束、申请状态日志和 `confirm_purchase` 原子扣款 RPC。生产环境应只由服务端调用 OpenAI；不要把 `OPENAI_API_KEY` 写入 `NEXT_PUBLIC_*` 变量。

## OpenAI

配置 `OPENAI_API_KEY` 和可选的 `OPENAI_MODEL`。`POST /api/ai/analyze` 会先校验身份与输入，再要求结构化 JSON 输出。没有 Key 时返回温和的本地回退分析。

## 验证

```bash
npm test
npm run typecheck
npm run lint
npm run build
```

## 部署到 Vercel

将此目录推送到 Git 仓库，在 Vercel 导入项目，Root Directory 选择 `dengdeng-zaimai`，配置 `.env.example` 中的变量后部署。把正式域名加入 Supabase 的 Site URL 和 Redirect URLs。

## 目录

- `src/app`：App Router 页面与服务端接口
- `src/lib`：金额、风险、状态机、Supabase 与演示数据
- `src/components`：移动端布局和 shadcn 风格基础组件
- `supabase/migrations`：数据库、事务函数及 RLS

## 上线前检查

- 为 Storage 添加只允许申请双方读取的对象策略。
- 配置邮件模板、限流、错误监控和隐私政策。
- 用两个真实账户完整测试邀请、审批、解除关系和并发确认购买。
- 根据业务所在地完成个人信息保护和未成年人使用评估。
