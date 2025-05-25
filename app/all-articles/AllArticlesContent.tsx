"use client";

import { useMemo, useCallback, memo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import ArticleCard from "@/components/articleCard/articleCard";
import { articleType } from "@/types/types";
import { Pagination } from "@/components/pagination/Pagination";
import { WhiteLine } from "@/components/whiteLine/whiteLine";
import Image from "next/image";
import { CATEGORIES } from "@/constants/constants";
import Redbubble from "@/components/redBubble/RedBubble";
import useSWR from "swr";

// 🚀 超高速フェッチャー関数
const fetcher = async (url: string) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "Cache-Control": "max-age=600", // 10分キャッシュ
      },
    });
    clearTimeout(timeoutId);

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

// 🚀 メモ化された超高速カテゴリボタン
const CategoryButton = memo(
  ({
    category,
    currentCategory,
    count,
    onClick,
  }: {
    category: { id: string; name: string } | null;
    currentCategory: string;
    count: number;
    onClick: () => void;
  }) => {
    const isActive = category
      ? currentCategory === category.id
      : !currentCategory;
    const label = category ? category.name : "All";

    return (
      <Button
        variant={isActive ? "default" : "outline"}
        className={
          isActive
            ? "bg-rose-700 text-white hover:bg-rose-800"
            : "text-white border-white hover:bg-white hover:text-slate-900"
        }
        onClick={onClick}
      >
        {label} ({count})
      </Button>
    );
  }
);

CategoryButton.displayName = "CategoryButton";

interface AllArticlesContentProps {
  initialArticles: articleType[];
  initialPagination: {
    total: number;
    page: number;
    pageSize: number;
    pageCount: number;
  };
  initialCategoryCounts: Record<string, number>;
  initialPage: number;
  initialCategory: string;
}

export default function AllArticlesContent({
  initialArticles,
  initialPagination,
  initialCategoryCounts,
  initialPage,
  initialCategory,
}: AllArticlesContentProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const currentPage = Number(searchParams.get("page") || initialPage);
  const currentCategory = searchParams.get("category") || initialCategory;
  const pageSize = initialPagination.pageSize;

  // 🚀 全記事データを一括取得（超高速化の核心）
  const { data: allArticlesData, error: articlesError } = useSWR(
    "/api/articles?published=true&pageSize=1000", // 全件一括取得
    fetcher,
    {
      fallbackData: {
        articles: initialArticles,
        pagination: initialPagination,
      },
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 600000, // 10分間キャッシュ
      refreshInterval: 0,
    }
  );

  // カテゴリ数データ
  const { data: countsData } = useSWR("/api/article-counts", fetcher, {
    fallbackData: { counts: initialCategoryCounts },
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 600000, // 10分間キャッシュ
    refreshInterval: 0,
  });

  // 🚀 ハイブリッド方式：初期データ + 全データ読み込み
  const {
    paginatedArticles,
    totalPages,
    filteredCount,
    totalCount,
    categoryCounts,
    isDataReady,
  } = useMemo(() => {
    const allArticles = allArticlesData?.articles || initialArticles;
    const counts = countsData?.counts || initialCategoryCounts;
    const hasFullData = allArticlesData?.articles?.length > 0;

    // 🚀 フィルタリング（初期データまたは全データ）
    const filtered = currentCategory
      ? allArticles.filter(
          (article: articleType) => article.category === currentCategory
        )
      : allArticles;

    // 🚀 ページネーション
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginated = filtered.slice(startIndex, endIndex);

    // ページ数計算（初期データで即座計算、後で更新）
    const pages = Math.ceil(filtered.length / pageSize);

    // 総記事数の計算
    const total =
      Object.values(counts).reduce(
        (sum: number, count) => sum + (count as number),
        0
      ) || allArticles.length;

    return {
      paginatedArticles: paginated,
      totalPages: pages,
      filteredCount: filtered.length,
      totalCount: total,
      categoryCounts: counts,
      isDataReady: hasFullData, // 全データ読み込み完了フラグ
    };
  }, [
    allArticlesData,
    countsData,
    currentCategory,
    currentPage,
    pageSize,
    initialArticles,
    initialCategoryCounts,
  ]);

  // 🚀 瞬時ナビゲーション（APIコールなし）
  const navigateInstantly = useCallback(
    (page: number, category: string) => {
      const params = new URLSearchParams();
      params.set("page", page.toString());
      if (category) params.set("category", category);

      const newUrl = `/all-articles?${params.toString()}`;
      router.push(newUrl, { scroll: false });
    },
    [router]
  );

  // 🚀 瞬時カテゴリ変更ハンドラー
  const handleCategoryChange = useCallback(
    (categoryId: string) => {
      navigateInstantly(1, categoryId); // 常にページ1に戻る
    },
    [navigateInstantly]
  );

  // 🚀 瞬時ページ変更ハンドラー
  const handlePageChange = useCallback(
    (page: number) => {
      navigateInstantly(page, currentCategory);
    },
    [navigateInstantly, currentCategory]
  );

  // 🚀 カテゴリボタンハンドラーを事前生成（最適化）
  const categoryHandlers = useMemo(() => {
    const handlers: Record<string, () => void> = {
      "": () => handleCategoryChange(""), // All ボタン
    };

    CATEGORIES.forEach((category) => {
      handlers[category.id] = () => handleCategoryChange(category.id);
    });

    return handlers;
  }, [handleCategoryChange]);

  // エラーハンドリング
  if (articlesError) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center text-white">
          <p className="text-xl mb-4">記事の読み込みに失敗しました</p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-rose-700 hover:bg-rose-800"
          >
            再読み込み
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <section className="relative bg-slate-950 text-white pt-16 pb-16">
        <div className="absolute inset-0 z-0 opacity-30">
          <Image
            src="/images/category-top/all-posts.jpg"
            alt="All Posts"
            fill
            style={{ objectFit: "cover" }}
            priority
            sizes="100vw"
          />
        </div>
        <div className="container mx-auto px-6 py-24 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">All Posts</h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto text-justify">
            Browse all articles and discover stories from Japanese mythology,
            culture, festivals, and customs.
          </p>
        </div>
      </section>

      <section className="py-16 bg-slate-950 md:px-16">
        <div className="container mx-auto px-4">
          {/* 🚀 瞬時カテゴリーフィルター */}
          <div className="sticky top-16 z-20 bg-slate-950 py-4 shadow-md">
            <div className="flex flex-wrap justify-start md:justify-center gap-3">
              {/* All ボタン */}
              <CategoryButton
                category={null}
                currentCategory={currentCategory}
                count={totalCount}
                onClick={categoryHandlers[""]}
              />

              {/* カテゴリボタン */}
              {CATEGORIES.map((category) => (
                <CategoryButton
                  key={category.id}
                  category={category}
                  currentCategory={currentCategory}
                  count={categoryCounts[category.id] || 0}
                  onClick={categoryHandlers[category.id]}
                />
              ))}
            </div>
          </div>

          {/* 記事コンテンツ */}
          <div className="flex-1 overflow-y-auto px-4 py-8">
            {/* 🚀 全データ読み込み中のローディング */}
            {!isDataReady ? (
              <div className="flex justify-center py-20">
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
                  <span className="text-white">Loading all articles...</span>
                </div>
              </div>
            ) : paginatedArticles.length > 0 ? (
              <>
                {/* 🚀 記事グリッド（1つ目ファイルの高速レイアウト） */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedArticles.map((article: articleType) => (
                    <ArticleCard
                      key={`${article.id}-${currentPage}-${currentCategory}`}
                      article={article}
                    />
                  ))}
                </div>

                {/* 結果表示 */}
                <div className="mt-8 text-center text-white">
                  <p>
                    Showing {(currentPage - 1) * pageSize + 1} -
                    {Math.min(currentPage * pageSize, filteredCount)} of{" "}
                    {filteredCount} articles
                  </p>
                  {currentCategory && (
                    <p className="text-gray-400 text-sm mt-1">
                      Category:{" "}
                      {CATEGORIES.find((c) => c.id === currentCategory)?.name}
                    </p>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-20">
                <p className="text-white text-xl">
                  {currentCategory
                    ? `No articles found in "${
                        CATEGORIES.find((c) => c.id === currentCategory)?.name
                      }" category.`
                    : "No articles found."}
                </p>
                {currentCategory && (
                  <Button
                    className="mt-4 bg-rose-700 hover:bg-rose-800 text-white"
                    onClick={categoryHandlers[""]}
                  >
                    View all articles
                  </Button>
                )}
              </div>
            )}

            {/* 🚀 即座表示ページネーション（初期データ使用） */}
            {totalPages > 1 && (
              <div className="mt-12 flex justify-center">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        </div>
      </section>

      <WhiteLine />
      <Redbubble />
      <WhiteLine />
    </div>
  );
}
