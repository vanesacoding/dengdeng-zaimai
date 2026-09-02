"use client";

import { useEffect, useState } from "react";
import { Download, Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import { basePath } from "@/lib/base-path";

interface InstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PwaManager() {
  const [prompt, setPrompt] = useState<InstallPromptEvent | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) navigator.serviceWorker.register(`${basePath}/sw.js`, { scope: `${basePath}/` }).catch(() => undefined);
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setPrompt(event as InstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  async function install() {
    if (!prompt) return setShowHelp(true);
    await prompt.prompt();
    const choice = await prompt.userChoice;
    if (choice.outcome === "accepted") setPrompt(null);
  }

  return <div className="mt-3">
    <Button variant="outline" className="w-full" onClick={install}><Download/>安装到手机桌面</Button>
    {showHelp && <div className="mt-3 rounded-2xl bg-[var(--sage-soft)] p-4 text-sm leading-6 text-[var(--forest-deep)]">
      <p className="flex items-center gap-2 font-semibold"><Share size={17}/>手机安装方法</p>
      <p className="mt-1">iPhone：用 Safari 打开，点击“分享”→“添加到主屏幕”。</p>
      <p>Android：用 Chrome 打开菜单，选择“安装应用”。</p>
    </div>}
  </div>;
}
