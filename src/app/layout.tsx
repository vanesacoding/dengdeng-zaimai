import type { Metadata, Viewport } from "next";
import "./globals.css";
import { PwaManager } from "@/components/pwa-manager";

export const metadata: Metadata = {
  title: "等等再买｜和朋友一起理性消费",
  description: "先说清楚为什么想买，再和信任的人一起做决定。",
  icons: [{ rel: "icon", url: "/icon.svg" }],
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#f7f4ec" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}<div className="hidden"><PwaManager/></div></body></html>;
}
