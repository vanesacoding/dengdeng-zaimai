"use client";

import { useEffect, useState } from "react";

/**
 * Reads the logged-in user's nickname from localStorage.
 * Returns "新朋友" during SSR / first paint, then updates after hydration.
 */
export function useLocalUser() {
  const [nickname, setNickname] = useState("新朋友");

  useEffect(() => {
    try {
      const raw = localStorage.getItem("ddzm:user");
      if (raw) {
        const user = JSON.parse(raw);
        if (user?.nickname) {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setNickname(user.nickname);
        }
      }
    } catch {
      /* ignore */
    }
  }, []);

  return nickname;
}
