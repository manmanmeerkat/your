// components/articlePageComponents/articleDetailLayout/ArticleDetailClient.tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { TableOfContents } from "@/components/ui/tableOfContents";
import type { TocItem } from "@/app/utils/toc";
import { useActiveHeading } from "@/app/hooks/useActiveHeading";

export default function ArticleDetailClient({
  tocItems,
  containerSelector,
  headerOffset,
  depsKey,
}: {
  tocItems: TocItem[];
  containerSelector: string;
  headerOffset: number;
  depsKey: string;
}) {
  const { activeId, scrollToHeading } = useActiveHeading(depsKey, {
    containerSelector,
    headerOffset,
  });

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

  return (
    <>
      <TableOfContents items={tocItems} activeId={activeId} onClickItem={scrollToHeading} />

      {showScrollTop && (
        <Button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 z-50"
          aria-label="ページトップへ戻る"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6 mx-auto">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </Button>
      )}
    </>
  );
}
