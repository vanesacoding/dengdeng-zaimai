"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CaseDetail } from "./case-detail";

// 法庭详情页：静态路由 + 查询参数传 id。
// 之前的动态路由 /app/explore/[id] 在静态导出（GitHub Pages）下无法为
// 用户运行时提交的单子生成 HTML，点击会 404/无响应；改成 ?id= 查询参数后
// 页面是静态的，id 在客户端从 localStorage 里查。
export default function CaseDetailPage() {
  return <Suspense fallback={<div className="py-20 text-center"><p className="text-[var(--muted)]">载入中…</p></div>}>
    <CaseRoute />
  </Suspense>;
}

function CaseRoute() {
  const params = useSearchParams();
  const id = params.get("id") ?? "";
  return <CaseDetail id={id} />;
}
