"use client";

import { useEffect, useState } from "react";
import { Download, Share, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { basePath } from "@/lib/base-path";

interface InstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "ddzm:install-dismissed";

export function InstallPrompt() {
  const [promptEvt, setPromptEvt] = useState<InstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register(`${basePath}/sw.js`, { scope: `${basePath}/` }).catch(() => {});
    }

    // Check if already dismissed
    try {
      if (localStorage.getItem(DISMISS_KEY)) return;
    } catch { return; }

    // Listen for native install prompt
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setPromptEvt(e as InstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);

    // Show banner after a short delay (let the page settle)
    const timer = window.setTimeout(() => setVisible(true), 1200);

    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.clearTimeout(timer);
    };
  }, []);

  function dismiss() {
    setVisible(false);
    try { localStorage.setItem(DISMISS_KEY, "1"); } catch {}
  }

  async function install() {
    if (promptEvt) {
      await promptEvt.prompt();
      const choice = await promptEvt.userChoice;
      if (choice.outcome === "accepted") {
        setVisible(false);
        try { localStorage.setItem(DISMISS_KEY, "1"); } catch {}
      }
      setPromptEvt(null);
    } else {
      setShowHelp(s => !s);
    }
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-4">
      <div className="flex w-full max-w-md items-center gap-3 rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-4 shadow-lg">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--forest)] text-white">
          <Download size={20}/>
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">安装到手机桌面</p>
          <p className="truncate text-xs text-[var(--muted)]">像 App 一样全屏打开，更沉浸</p>
          {showHelp && (
            <div className="mt-2 text-xs leading-5 text-[var(--muted)]">
              <p className="flex items-center gap-1"><Share size={13}/> iPhone：Safari 打开 → 分享 → 添加到主屏幕</p>
              <p>Android：Chrome 菜单 → 安装应用</p>
            </div>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button size="sm" onClick={install}>安装</Button>
          <button onClick={dismiss} className="grid size-8 place-items-center rounded-full text-[var(--muted)] hover:bg-[var(--cream)]">
            <X size={18}/>
          </button>
        </div>
      </div>
    </div>
  );
}
