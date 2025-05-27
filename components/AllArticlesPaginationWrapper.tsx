// components/AllArticlesPaginationWrapper.tsx (最終版)
"use client";

import React, { useEffect, Suspense } from "react";
import { Pagination } from "@/components/pagination/Pagination";
import { usePaginationOptimization } from "@/app/hooks/usePaginationOptimization";

interface AllArticlesPaginationWrapperProps {
  currentPage: number;
  totalPages: number;
  currentCategory: string;
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
}: AllArticlesPaginationWrapperProps) {
  const {
    handlePageChange,
    prefetchAdjacentPages,
    handleKeyboardNavigation,
    isPending,
  } = usePaginationOptimization({
    currentPage,
    totalPages,
    basePath: "/all-articles",
  });

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
        {/* ローディングインジケーター */}
        {isPending && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
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
      prevProps.currentCategory === nextProps.currentCategory
    );
  }
);
