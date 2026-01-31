// components/articlePageComponents/articleDetailLayout/ArticleDetailClient.tsx
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { TableOfContents } from "@/components/ui/tableOfContents";
import { useActiveHeading } from "@/app/hooks/useActiveHeading";
import { buildTocFromDom, type TocItem } from "@/app/utils/toc";

export default function ArticleDetailClient({
  containerSelector,
  headerOffset,
  depsKey,
}: {
  containerSelector: string;
  headerOffset: number;
  depsKey: string;
}) {
  const [tocItems, setTocItems] = useState<TocItem[]>([]);

  // ✅ DOM描画後にTOCを作る（画像/トリビア差し込み後）
  useEffect(() => {
    // requestAnimationFrame 2回で “描画が落ち着いてから”
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setTocItems(buildTocFromDom(containerSelector));
      });
    });
  }, [containerSelector, depsKey]);

  const { activeId } = useActiveHeading(depsKey, {
    headerOffset,
  });

  useEffect(() => {
  const fix = () => {
    const id = location.hash.slice(1);
    const el = id ? document.getElementById(id) : null;
    if (!el) return;

    const header = document.querySelector("header") as HTMLElement | null;
    const offset = Math.round((header ? header.getBoundingClientRect().height : headerOffset)) + 16;

    const delta = el.getBoundingClientRect().top - offset;
    if (Math.abs(delta) > 6) window.scrollBy({ top: delta, behavior: "auto" });
  };

  const onHash = () => {
    requestAnimationFrame(fix);
    setTimeout(fix, 150);
    setTimeout(fix, 350);
  };

  window.addEventListener("hashchange", onHash);
  if (location.hash) onHash();

  return () => window.removeEventListener("hashchange", onHash);
}, [headerOffset]);


  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const y = document.scrollingElement?.scrollTop ?? 0;
      setShowScrollTop(y > 300);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = useCallback(() => {
    (document.scrollingElement as HTMLElement)?.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  if (tocItems.length === 0) return null;

  return (
    <>
      <TableOfContents
        items={tocItems}
        activeId={activeId}
      />

      {showScrollTop && (
        <Button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 z-50"
          aria-label="ページトップへ戻る"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="w-6 h-6 mx-auto"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 15l7-7 7 7"
            />
          </svg>
        </Button>
      )}
    </>
  );
}

