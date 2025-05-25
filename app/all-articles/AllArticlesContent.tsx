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

// フェッチャー関数
const fetcher = async (url: string) => {
  const response = await fetch(url, {
    headers: { "Cache-Control": "max-age=600" },
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
};

// メモ化されたカテゴリボタン
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

  // 🚀 初期データの存在確認
  const hasInitialData = initialArticles.length > 0;

  // 🚀 PaginationWrapper級の即座表示用データ
  const quickTotalPages = useMemo(() => {
    if (!hasInitialData) return 1; // 初期データがない場合はデフォルト値

    if (initialCategory !== currentCategory) {
      // カテゴリが変わった場合のみ再計算
      const filtered = initialArticles.filter(
        (article: articleType) => article.category === currentCategory
      );
      return Math.ceil(filtered.length / pageSize);
    }
    // 初期状態では既に計算済みの値を使用（PaginationWrapper方式）
    return initialPagination.pageCount;
  }, [
    hasInitialData,
    initialCategory,
    currentCategory,
    initialArticles,
    pageSize,
    initialPagination.pageCount,
  ]);

  // 🚀 初期データで即座表示（mythology/page.tsx方式）
  const currentDisplayData = useMemo(() => {
    if (!hasInitialData) {
      // 初期データがない場合は空の表示データを返す
      return {
        articles: [],
        filteredCount: 0,
        totalCount: 0,
        categoryCounts: initialCategoryCounts,
      };
    }

    const filtered = currentCategory
      ? initialArticles.filter(
          (article: articleType) => article.category === currentCategory
        )
      : initialArticles;

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginated = filtered.slice(startIndex, endIndex);

    const totalCount =
      Object.values(initialCategoryCounts).reduce(
        (sum: number, count) => sum + (count as number),
        0
      ) || initialArticles.length;

    return {
      articles: paginated,
      filteredCount: filtered.length,
      totalCount,
      categoryCounts: initialCategoryCounts,
    };
  }, [
    hasInitialData,
    currentCategory,
    currentPage,
    pageSize,
    initialArticles,
    initialCategoryCounts,
  ]);

  // 🚀 背景でフルデータ読み込み（表示には影響しない）
  const { data: fullData } = useSWR(
    "/api/articles?published=true&pageSize=1000",
    fetcher,
    {
      fallbackData: { articles: initialArticles },
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 600000,
      refreshInterval: 0,
    }
  );

  const { data: countsData } = useSWR("/api/article-counts", fetcher, {
    fallbackData: { counts: initialCategoryCounts },
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 600000,
    refreshInterval: 0,
  });

  // 🚀 フルデータ読み込み後の更新表示データ（背景更新）
  const enhancedDisplayData = useMemo(() => {
    if (!hasInitialData) return currentDisplayData; // 初期データがない場合は現在のデータを返す

    if (
      !fullData?.articles ||
      fullData.articles.length <= initialArticles.length
    ) {
      return currentDisplayData; // 初期データ表示を継続
    }

    const allArticles = fullData.articles;
    const counts = countsData?.counts || initialCategoryCounts;

    const filtered = currentCategory
      ? allArticles.filter(
          (article: articleType) => article.category === currentCategory
        )
      : allArticles;

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginated = filtered.slice(startIndex, endIndex);

    const totalCount = Object.values(counts).reduce(
      (sum: number, count) => sum + (count as number),
      0
    );

    return {
      articles: paginated,
      filteredCount: filtered.length,
      totalCount,
      categoryCounts: counts,
    };
  }, [
    hasInitialData,
    fullData,
    countsData,
    currentCategory,
    currentPage,
    pageSize,
    initialArticles,
    initialCategoryCounts,
    currentDisplayData,
  ]);

  // 🚀 フルデータ読み込み後のページ数計算
  const enhancedTotalPages = useMemo(() => {
    if (!hasInitialData) return quickTotalPages; // 初期データがない場合はデフォルト値

    if (
      !fullData?.articles ||
      fullData.articles.length <= initialArticles.length
    ) {
      return quickTotalPages; // 初期計算値を使用
    }

    const allArticles = fullData.articles;
    const filtered = currentCategory
      ? allArticles.filter(
          (article: articleType) => article.category === currentCategory
        )
      : allArticles;

    return Math.ceil(filtered.length / pageSize);
  }, [
    hasInitialData,
    fullData,
    currentCategory,
    pageSize,
    initialArticles,
    quickTotalPages,
  ]);

  // 表示用データ
  const displayData = enhancedDisplayData;
  const displayTotalPages = enhancedTotalPages;

  // ナビゲーション
  const navigateToPage = useCallback(
    (page: number, category: string) => {
      const params = new URLSearchParams();
      params.set("page", page.toString());
      if (category) params.set("category", category);
      router.push(`/all-articles?${params.toString()}`, { scroll: false });
    },
    [router]
  );

  const handleCategoryChange = useCallback(
    (categoryId: string) => {
      navigateToPage(1, categoryId);
    },
    [navigateToPage]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      navigateToPage(page, currentCategory);
    },
    [navigateToPage, currentCategory]
  );

  // カテゴリボタンハンドラー
  const categoryHandlers = useMemo(() => {
    const handlers: Record<string, () => void> = {
      "": () => handleCategoryChange(""),
    };
    CATEGORIES.forEach((category) => {
      handlers[category.id] = () => handleCategoryChange(category.id);
    });
    return handlers;
  }, [handleCategoryChange]);

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
          {/* カテゴリーフィルター */}
          <div className="sticky top-16 z-20 bg-slate-950 py-4 shadow-md">
            <div className="flex flex-wrap justify-start md:justify-center gap-3">
              <CategoryButton
                category={null}
                currentCategory={currentCategory}
                count={hasInitialData ? displayData.totalCount : 0}
                onClick={categoryHandlers[""]}
              />

              {CATEGORIES.map((category) => (
                <CategoryButton
                  key={category.id}
                  category={category}
                  currentCategory={currentCategory}
                  count={
                    hasInitialData
                      ? displayData.categoryCounts[category.id] || 0
                      : 0
                  }
                  onClick={categoryHandlers[category.id]}
                />
              ))}
            </div>
          </div>

          {/* 記事コンテンツ */}
          <div className="flex-1 overflow-y-auto px-4 py-8">
            {/* 🚀 初期データ読み込み中はローディング表示 */}
            {!hasInitialData ? (
              <div className="flex justify-center py-20">
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
                  <span className="text-white">Loading articles...</span>
                </div>
              </div>
            ) : displayData.articles.length > 0 ? (
              <>
                {/* 記事グリッド */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {displayData.articles.map((article: articleType) => (
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
                    {Math.min(
                      currentPage * pageSize,
                      displayData.filteredCount
                    )}{" "}
                    of {displayData.filteredCount} articles
                  </p>
                  {currentCategory && (
                    <p className="text-gray-400 text-sm mt-1">
                      Category:{" "}
                      {CATEGORIES.find((c) => c.id === currentCategory)?.name}
                    </p>
                  )}
                </div>

                {/* 🚀 PaginationWrapper級の即座表示ページネーション */}
                {displayTotalPages > 1 && (
                  <div className="mt-12 flex justify-center">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={displayTotalPages}
                      onPageChange={handlePageChange}
                    />
                  </div>
                )}
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
          </div>
        </div>
      </section>

      <WhiteLine />
      <Redbubble />
      <WhiteLine />
    </div>
  );
}
