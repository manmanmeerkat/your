"use client";

import { useEffect } from "react";

type ExactScrollData = {
  originalScrollY: number;
  shouldRestorePosition: boolean;
  timestamp: number;
};

export default function ScrollHandler() {
  useEffect(() => {
    const raw = sessionStorage.getItem("exact-scroll-restore");
    if (!raw) return;

    try {
      const data: ExactScrollData = JSON.parse(raw);

      // 5分以内だけ有効
      const isRecent = Date.now() - data.timestamp < 5 * 60 * 1000;
      if (!isRecent || !data.shouldRestorePosition) {
        sessionStorage.removeItem("exact-scroll-restore");
        return;
      }

      sessionStorage.removeItem("exact-scroll-restore");

      // 1回だけ復元（DOM更新後）
      requestAnimationFrame(() => {
        window.scrollTo({ top: data.originalScrollY, left: 0, behavior: "auto" });
      });
    } catch {
      sessionStorage.removeItem("exact-scroll-restore");
    }
  }, []);

  return null;
}
