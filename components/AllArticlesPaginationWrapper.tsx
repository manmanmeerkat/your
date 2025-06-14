// components/AllArticlesPaginationWrapper.tsx (スマートスクロール機能付き最終版)
"use client";

import React, { useEffect, Suspense, useCallback, useRef } from "react";
import { Pagination } from "@/components/pagination/Pagination";
import { usePaginationOptimization } from "@/app/hooks/usePaginationOptimization";

interface AllArticlesPaginationWrapperProps {
  currentPage: number;
  totalPages: number;
  currentCategory: string;
  // 🎯 スクロール機能の追加
  scrollToElementId?: string;
  scrollOffset?: number;
}

// ローディング用のスケルトン
const PaginationSkeleton = () => (
  <div className="mt-12 flex justify-center">
    <div className="flex items-center space-x-2 py-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-9 w-9 bg-gray-200 rounded animate-pulse" />
      ))}
    </div>
  </div>
);

// メインのページネーションコンポーネント
function PaginationContent({
  currentPage,
  totalPages,
  currentCategory,
  scrollToElementId = "articles-grid",
  scrollOffset = 150, // さらに大きなデフォルトオフセット
}: AllArticlesPaginationWrapperProps) {
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
              'h2:contains("All Articles")',
              'h2:contains("Latest")',
              "h1, h2, h3", // 任意の見出し
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
            // 🎯 追加の余白を確保（記事タイトルや見出しが確実に見えるように）
            const extraPadding = 30; // より大きな追加余白
            const scrollToPosition = Math.max(
              0,
              elementTop - scrollOffset - extraPadding
            );

            console.log(
              `📍 スクロール実行: ${targetElement.tagName}.${
                targetElement.className
              } へ (${scrollToPosition}px, offset: ${
                scrollOffset + extraPadding
              }px)`
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

  // 🚀 スクロール機能付きページ変更処理
  const handlePageChange = useCallback(
    (page: number) => {
      // 元のページ変更処理を実行
      originalHandlePageChange(page);
    },
    [originalHandlePageChange]
  );

  // 🎯 ページ変更完了後のスクロール
  useEffect(() => {
    if (!isPending) {
      // トランジション完了後にスクロール
      scrollToArticlesSection(true);
    }
  }, [isPending, currentPage, scrollToArticlesSection]);

  // コンポーネントマウント時に隣接ページをプリフェッチ
  useEffect(() => {
    // 少し遅らせてプリフェッチ（初期レンダリング優先）
    const timer = setTimeout(() => {
      prefetchAdjacentPages();
    }, 500);

    return () => clearTimeout(timer);
  }, [prefetchAdjacentPages]);

  // キーボードナビゲーションの設定
  useEffect(() => {
    document.addEventListener("keydown", handleKeyboardNavigation);
    return () => {
      document.removeEventListener("keydown", handleKeyboardNavigation);
    };
  }, [handleKeyboardNavigation]);

  // 🧹 クリーンアップ
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // ページが1ページしかない場合は表示しない
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div
      className={`mt-12 flex justify-center transition-opacity duration-200 ${
        isPending ? "opacity-50" : "opacity-100"
      }`}
    >
      <div className="relative">
        {/* 🔄 ローディングインジケーター（アイコンのみ） */}
        {isPending && (
          <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center z-10 rounded">
            <div className="bg-white p-3 rounded-lg shadow-lg flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          </div>
        )}

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          siblingCount={1}
          showQuickJumper={true}
        />
      </div>

      {/* SEO向けの隠れたナビゲーション情報 */}
      <div className="sr-only" aria-live="polite">
        現在 {totalPages} ページ中 {currentPage} ページ目を表示中
        {currentCategory && ` (カテゴリー: ${currentCategory})`}
      </div>

      {/* 📋 使用方法ヒント（開発時のみ） */}
      {process.env.NODE_ENV === "development" && (
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-center text-xs text-gray-500">
          Scroll target: #{scrollToElementId} | Offset: {scrollOffset}px (+30px
          padding)
        </div>
      )}
    </div>
  );
}

// メインエクスポート（Suspense付き）
function AllArticlesPaginationWrapper(
  props: AllArticlesPaginationWrapperProps
) {
  return (
    <Suspense fallback={<PaginationSkeleton />}>
      <PaginationContent {...props} />
    </Suspense>
  );
}

// 高度なメモ化（深い比較）
export default React.memo(
  AllArticlesPaginationWrapper,
  (prevProps, nextProps) => {
    // より詳細な比較でパフォーマンスを最適化
    return (
      prevProps.currentPage === nextProps.currentPage &&
      prevProps.totalPages === nextProps.totalPages &&
      prevProps.currentCategory === nextProps.currentCategory &&
      prevProps.scrollToElementId === nextProps.scrollToElementId &&
      prevProps.scrollOffset === nextProps.scrollOffset
    );
  }
);
