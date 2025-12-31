// components/AllArticlesPaginationWrapper.tsx
"use client";

import React, {
  Suspense,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { Pagination } from "@/components/pagination/Pagination";
import { usePaginationOptimization } from "@/app/hooks/usePaginationOptimization";

type Props = {
  currentPage: number;
  totalPages: number;
  currentCategory: string;
  scrollToElementId?: string;
  scrollOffset?: number;
};

function PaginationSkeleton() {
  return (
    <div className="mt-12 flex justify-center">
      <div className="flex items-center space-x-2 py-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-9 w-9 bg-white/10 rounded animate-pulse" />
        ))}
      </div>
    </div>
  );
}

/**
 * 記事一覧へスクロールするための「ターゲット要素」を見つける
 * - なるべく安定するセレクタ（id → data属性 → gridクラス）順に探索
 */
function findScrollTarget(scrollToElementId: string): HTMLElement | null {
  const selectors = [
    `#${scrollToElementId}`,
    '[data-scroll-target="articles"]',
    ".articles-grid",
    // 既存の grid（Allページで使っている想定）
    ".grid.grid-cols-1",
  ];

  for (const sel of selectors) {
    const el = document.querySelector(sel);
    if (el instanceof HTMLElement) return el;
  }
  return null;
}

function scrollToElement(el: HTMLElement, offset: number, smooth: boolean) {
  const top = el.getBoundingClientRect().top + window.scrollY;
  const y = Math.max(0, top - offset);
  window.scrollTo({ top: y, behavior: smooth ? "smooth" : "auto" });
}

function PaginationContent({
  currentPage,
  totalPages,
  currentCategory,
  scrollToElementId = "articles-grid",
  scrollOffset = 150,
}: Props) {
  const {
    handlePageChange: originalHandlePageChange,
    prefetchAdjacentPages,
    handleKeyboardNavigation,
    isPending,
  } = usePaginationOptimization({
    currentPage,
    totalPages,
    basePath: "/all-articles",
  });

  // 「Pagination を押した時だけスクロール」用フラグ
  const requestedScrollRef = useRef(false);

  // スクロールの setTimeout をクリーンにするため
  const timerRef = useRef<number | null>(null);

  const doScroll = useCallback(
    (smooth = true) => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }

      // DOM更新後に少しだけ待ってからスクロール（表示の安定優先）
      timerRef.current = window.setTimeout(() => {
        const target = findScrollTarget(scrollToElementId);
        if (target) {
          scrollToElement(target, scrollOffset, smooth);
        }
      }, 120);
    },
    [scrollToElementId, scrollOffset]
  );

  // Pagination クリック時だけ scroll 予約
  const handlePageChange = useCallback(
    (page: number) => {
      requestedScrollRef.current = true;
      originalHandlePageChange(page);
    },
    [originalHandlePageChange]
  );

  // 遷移完了後、予約がある時だけスクロール
  useEffect(() => {
    if (isPending) return;
    if (!requestedScrollRef.current) return;

    requestedScrollRef.current = false;
    doScroll(true);
  }, [isPending, currentPage, doScroll]);

  // 近いページをプリフェッチ（初期表示を邪魔しないよう遅延）
  useEffect(() => {
    const t = window.setTimeout(() => prefetchAdjacentPages(), 500);
    return () => window.clearTimeout(t);
  }, [prefetchAdjacentPages]);

  // キーボードナビゲーション
  useEffect(() => {
    document.addEventListener("keydown", handleKeyboardNavigation);
    return () => document.removeEventListener("keydown", handleKeyboardNavigation);
  }, [handleKeyboardNavigation]);

  // unmount cleanup
  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  // 1ページなら表示しない
  if (totalPages <= 1) return null;

  const opacityClass = isPending ? "opacity-50" : "opacity-100";

  return (
    <div className={`mt-12 flex justify-center transition-opacity duration-200 ${opacityClass}`}>
      <div className="relative">
        {isPending && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-10 rounded">
            <div className="bg-white p-3 rounded-lg shadow-lg flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#df7163]" />
            </div>
          </div>
        )}

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          showQuickJumper={true}
        />
      </div>

      {/* SR only */}
      <div className="sr-only" aria-live="polite">
        Currently viewing page {currentPage} of {totalPages}
        {currentCategory ? ` (Category: ${currentCategory})` : ""}
      </div>
    </div>
  );
}

function AllArticlesPaginationWrapper(props: Props) {
  return (
    <Suspense fallback={<PaginationSkeleton />}>
      <PaginationContent {...props} />
    </Suspense>
  );
}

// props比較は軽めでOK（必要十分）
export default React.memo(AllArticlesPaginationWrapper, (a, b) => {
  return (
    a.currentPage === b.currentPage &&
    a.totalPages === b.totalPages &&
    a.currentCategory === b.currentCategory &&
    a.scrollToElementId === b.scrollToElementId &&
    a.scrollOffset === b.scrollOffset
  );
});
