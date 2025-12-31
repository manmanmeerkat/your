"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useTransition } from "react";
import { Pagination } from "@/components/pagination/Pagination";
const PAGINATION_SCROLL_FLAG = "pagination-scroll-intent";

interface PaginationWrapperProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
  prefetchRange?: number;

  // スクロール先（このIDに確実にスクロールさせる）
  scrollToElementId?: string;
  scrollOffset?: number;

  // 神々戻りなどで自動スクロールを止めたい時のフラグキー
  disableScrollStorageKey?: string; // default: "disable-pagination-scroll"
}

export default function PaginationWrapper({
  currentPage,
  totalPages,
  basePath,
  prefetchRange = 2,
  scrollToElementId = "articles-section",
  scrollOffset = 80,
  disableScrollStorageKey = "disable-pagination-scroll",
}: PaginationWrapperProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const scrollTimerRef = useRef<number | null>(null);

  const isScrollDisabled = useCallback(() => {
    if (typeof window === "undefined") return true;
    return sessionStorage.getItem(disableScrollStorageKey) === "true";
  }, [disableScrollStorageKey]);

  const scrollToTarget = useCallback(
    (smooth = true) => {
      if (typeof window === "undefined") return;
      if (isScrollDisabled()) return;

      if (scrollTimerRef.current) {
        window.clearTimeout(scrollTimerRef.current);
      }

      scrollTimerRef.current = window.setTimeout(() => {
        if (isScrollDisabled()) return;

        // 1) 指定IDを最優先
        let targetElement = document.getElementById(scrollToElementId) as HTMLElement | null;

        // 2) 見つからない場合だけフォールバック
        if (!targetElement) {
          const gridSelectors = [
            ".grid.grid-cols-1",
            '[data-scroll-target="articles"]',
            ".articles-grid",
            ".container .grid",
            "section .grid",
          ];

          for (const selector of gridSelectors) {
            const el = document.querySelector(selector);
            if (el) {
              targetElement = el as HTMLElement;
              break;
            }
          }
        }

        if (!targetElement) return;

        const top =
          targetElement.getBoundingClientRect().top + window.scrollY - scrollOffset;

        window.scrollTo({
          top: Math.max(0, top),
          behavior: smooth ? "smooth" : "auto",
        });
      }, 120);

    },
    [scrollToElementId, scrollOffset, isScrollDisabled]
  );

  const buildHref = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", String(page));
      return `${basePath}?${params.toString()}`;
    },
    [basePath, searchParams]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      if (page < 1 || page > totalPages) return;
      if (page === currentPage) return;

      if (typeof window !== "undefined") {
        sessionStorage.setItem(PAGINATION_SCROLL_FLAG, "true");
      }

      startTransition(() => {
        router.push(buildHref(page), { scroll: false });
      });
    },
    [currentPage, totalPages, router, buildHref]
  );

  // ✅ ページ変更後スクロール（2ページ目以降だけ）
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isPending) return;
    if (isScrollDisabled()) return;

    const intent = sessionStorage.getItem(PAGINATION_SCROLL_FLAG) === "true";
    if (!intent) return; // ← 更新/直リンク/戻る ではスクロールしない

    scrollToTarget(true);

    // 一度使ったら消す（更新で再発しない）
    sessionStorage.removeItem(PAGINATION_SCROLL_FLAG);
  }, [isPending, searchParams, scrollToTarget, isScrollDisabled]);

  // ✅ prefetch（近傍だけ）
  const prefetchPages = useMemo(() => {
    const pages: number[] = [];
    const start = Math.max(1, currentPage - prefetchRange);
    const end = Math.min(totalPages, currentPage + prefetchRange);
    for (let p = start; p <= end; p++) {
      if (p !== currentPage) pages.push(p);
    }
    return pages;
  }, [currentPage, totalPages, prefetchRange]);

  useEffect(() => {
    prefetchPages.forEach((p) => router.prefetch(buildHref(p)));
  }, [prefetchPages, router, buildHref]);

  const handlePageHover = useCallback(
    (page: number) => {
      if (page < 1 || page > totalPages) return;
      if (page === currentPage) return;
      router.prefetch(buildHref(page));
    },
    [router, buildHref, totalPages, currentPage]
  );

  // ✅ キーボード（最低限：PageUp/PageDown）
  useEffect(() => {
    if (typeof window === "undefined") return;

    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea") return;

      if (e.key === "PageUp" && currentPage > 1) {
        e.preventDefault();
        handlePageChange(currentPage - 1);
      }
      if (e.key === "PageDown" && currentPage < totalPages) {
        e.preventDefault();
        handlePageChange(currentPage + 1);
      }
    };

    window.addEventListener("keydown", onKeyDown, { passive: false });
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [currentPage, totalPages, handlePageChange]);

  useEffect(() => {
    return () => {
      if (scrollTimerRef.current) {
        window.clearTimeout(scrollTimerRef.current);
      }
    };
  }, []);

  if (!totalPages || totalPages <= 1) return null;

  return (
    <div className="relative">
      {isPending && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded bg-black/25">
          <div className="rounded-lg bg-white/90 p-3 shadow">
            <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-blue-600" />
          </div>
        </div>
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        onPageHover={handlePageHover}
        disabled={isPending}
        showQuickJumper
      />
    </div>
  );
}

