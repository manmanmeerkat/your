// components/pagination-wrapper.tsx - スマートスクロール対応版
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useTransition, useRef } from "react";
import { Pagination } from "@/components/pagination/Pagination";

interface PaginationWrapperProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
  prefetchRange?: number;
  // 🎯 新機能: スクロール対象の指定
  scrollToElementId?: string;
  scrollOffset?: number;
}

export default function PaginationWrapper({
  currentPage,
  totalPages,
  basePath,
  prefetchRange = 2,
  scrollToElementId = "articles-section", // デフォルトID
  scrollOffset = 80, // ヘッダー分のオフセット
}: PaginationWrapperProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();

  // 🎯 スマートスクロール関数
  const scrollToArticlesSection = useCallback(
    (smooth = true) => {
      // 既存のタイムアウトをクリア
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      const scrollToTarget = () => {
        try {
          // 1. 記事カードグリッドエリアを優先的に探す
          let targetElement = null;

          const gridSelectors = [
            ".grid.grid-cols-1", // 記事カードのグリッド
            '[data-scroll-target="articles"]', // カスタム属性
            `#${scrollToElementId}`, // 指定されたID
            ".articles-grid", // 記事グリッドクラス
            ".container .grid", // コンテナ内のグリッド
            "section .grid", // セクション内のグリッド
          ];

          // 記事カードグリッドを最優先で探す
          for (const selector of gridSelectors) {
            const element = document.querySelector(selector);
            if (element) {
              targetElement = element as HTMLElement;
              console.log(`🎯 記事グリッドを発見: ${selector}`);
              break;
            }
          }

          // 2. 見つからない場合は見出しを探す
          if (!targetElement) {
            const headingSelectors = [
              `#${scrollToElementId}`,
              'h2:contains("記事")',
              'h2:contains("articles")',
              'h2:contains("stories")',
              'h2:contains("charm")',
              'h2:contains("Discover")',
              'h2:contains("Festivals")',
            ];

            for (const selector of headingSelectors) {
              const element = document.querySelector(selector);
              if (element) {
                targetElement = element as HTMLElement;
                console.log(`📝 見出しを発見: ${selector}`);
                break;
              }
            }
          }

          // 3. ターゲット要素が見つかった場合
          if (targetElement) {
            const elementTop =
              targetElement.getBoundingClientRect().top + window.pageYOffset;
            const scrollToPosition = Math.max(0, elementTop - scrollOffset);

            console.log(
              `📍 スクロール実行: ${targetElement.tagName}.${targetElement.className} へ (${scrollToPosition}px)`
            );

            if (smooth) {
              window.scrollTo({
                top: scrollToPosition,
                behavior: "smooth",
              });
            } else {
              window.scrollTo(0, scrollToPosition);
            }
          } else {
            // 4. フォールバック: ページ上部へスクロール
            console.log(
              "⚠️ 記事エリアが見つからないため、ページ上部へスクロール"
            );
            window.scrollTo({
              top: 0,
              behavior: smooth ? "smooth" : "auto",
            });
          }
        } catch (error) {
          console.error("❌ スクロールエラー:", error);
          // エラー時はページ上部へ
          window.scrollTo({ top: 0, behavior: "auto" });
        }
      };

      // 5. DOM更新後にスクロール実行
      scrollTimeoutRef.current = setTimeout(scrollToTarget, 150);
    },
    [scrollToElementId, scrollOffset]
  );

  // 🚀 ページ変更処理の改善
  const handlePageChange = useCallback(
    (page: number) => {
      if (page === currentPage || page < 1 || page > totalPages) return;

      startTransition(() => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", page.toString());

        // ページ遷移実行
        router.push(`${basePath}?${params.toString()}`, { scroll: false });
      });
    },
    [currentPage, totalPages, searchParams, basePath, router]
  );

  // 🎯 ページ変更完了後のスクロール
  useEffect(() => {
    if (!isPending) {
      // トランジション完了後にスクロール
      scrollToArticlesSection(true);
    }
  }, [isPending, currentPage, scrollToArticlesSection]);

  // 🎯 プリフェッチ最適化
  const prefetchPages = useMemo(() => {
    const pages: number[] = [];
    const start = Math.max(1, currentPage - prefetchRange);
    const end = Math.min(totalPages, currentPage + prefetchRange);

    for (let i = start; i <= end; i++) {
      if (i !== currentPage) {
        pages.push(i);
      }
    }
    return pages;
  }, [currentPage, totalPages, prefetchRange]);

  // プリフェッチ実行
  useEffect(() => {
    prefetchPages.forEach((page) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", page.toString());
      router.prefetch(`${basePath}?${params.toString()}`);
    });
  }, [prefetchPages, basePath, router, searchParams]);

  // 🎯 ホバープリフェッチ
  const handlePageHover = useCallback(
    (page: number) => {
      if (page !== currentPage && page >= 1 && page <= totalPages) {
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", page.toString());
        router.prefetch(`${basePath}?${params.toString()}`);
      }
    },
    [currentPage, totalPages, searchParams, basePath, router]
  );

  // ⌨️ キーボードナビゲーション（スクロール対応）
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (event.key) {
        case "PageUp":
          if (currentPage > 1) {
            event.preventDefault();
            handlePageChange(currentPage - 1);
          }
          break;
        case "PageDown":
          if (currentPage < totalPages) {
            event.preventDefault();
            handlePageChange(currentPage + 1);
          }
          break;
        case "Home":
          if (event.ctrlKey && currentPage !== 1) {
            event.preventDefault();
            handlePageChange(1);
          }
          break;
        case "End":
          if (event.ctrlKey && currentPage !== totalPages) {
            event.preventDefault();
            handlePageChange(totalPages);
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentPage, totalPages, handlePageChange]);

  // 🧹 クリーンアップ
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="relative">
      {/* 📱 ローディング状態の表示 */}
      {isPending && (
        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center z-10 rounded">
          <div className="bg-white p-3 rounded-lg shadow-lg flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        </div>
      )}

      {/* 🎯 ページネーションコンポーネント */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        onPageHover={handlePageHover}
        disabled={isPending}
        siblingCount={2}
        showQuickJumper={true}
      />

      {/* 📋 使用方法ヒント */}
      <div className="mt-2 text-center text-sm text-gray-400">
        Use PageUp/PageDown keys • Ctrl+Home/End for first/last page
      </div>

      {/* 📊 デバッグ情報（開発時のみ） */}
      {process.env.NODE_ENV === "development" && (
        <div className="mt-2 text-center text-xs text-gray-500">
          Scroll target: #{scrollToElementId} | Offset: {scrollOffset}px |
          Prefetched: {prefetchPages.join(", ")}
        </div>
      )}
    </div>
  );
}
