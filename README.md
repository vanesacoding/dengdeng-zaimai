# 等等再买

年轻女生的消费欲审判综艺。提交想买的商品和理由，让闺蜜和社区陪审团一起参谋，通过冷静期和回访减少冲动消费。

## 核心功能

**个人侧**：两段式发布流程（商品信息 + 心情 + 可见范围 + 上头提示），闺蜜参谋，冷静盒，结果日记，月度复盘。

**公域侧（等等法庭）**：购物案信息流，搞笑案件标题，案件编号，关键证据，陪审团投票，定制投票文案，证词角色，最佳证词，轻量判决，案件反转，分享判决书，案件回访，今日热案，品牌送审预留，案件解决方案入口。

## 本地运行

要求 Node.js 20+。

```bash
npm install
npm run dev
```

打开 `http://localhost:3000`。不填写环境变量时进入演示模式，所有页面均可直接浏览。

## 验证

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## 部署

项目使用 Next.js 静态导出适配 GitHub Pages。设置 `GITHUB_ACTIONS=true` 环境变量后，`next build` 会输出静态文件到 `out/` 目录，`basePath` 为 `/dengdeng-zaimai`。

GitHub Actions 工作流位于 `.github/workflows/deploy-pages.yml`，自动部署到 GitHub Pages。

## 目录

- `src/app`：App Router 页面
  - `app/`：主页、法庭（explore）、发布、参谋、请求详情
- `src/lib`：领域模型、风险计算、社区 API、案件演示数据、工具函数
- `src/components`：案件卡片、证据列表、陪审团摘要、判决分享卡、商品决策抽屉等
- `supabase/migrations`：数据库 schema（001-006），包含 RLS 策略
- `.github/workflows`：GitHub Pages 部署

## 数据安全

公域只展示模糊预算提示（宽松/需要考虑/有点紧），绝不暴露收入、生活费、储蓄金额等敏感数字。品牌送审内容必须明确标记，不影响自然排序和风险分析。社区判决仅代表意见，不替用户做消费决定。

## 演示数据说明

所有公域案件、证词、投票均为演示数据，标注为"体验案件"。不接入真实支付、真实下单、真实联盟营销或真实品牌后台。
