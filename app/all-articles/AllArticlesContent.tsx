// app/all-articles/AllArticlesContent.tsx (最強版)
"use client";

import { useEffect, useState, useMemo, useCallback, useRef, memo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import ArticleCard from "@/components/articleCard/articleCard";
import { articleType } from "@/types/types";
import { Pagination } from "@/components/pagination/Pagination";
import { WhiteLine } from "@/components/whiteLine/whiteLine";
import Image from "next/image";
import { CATEGORIES } from "@/constants/constants";
import Redbubble from "@/components/redBubble/RedBubble";
import useSWR, { mutate } from "swr";

// 🚀 高速フェッチャー関数
const fetcher = async (url: string) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "Cache-Control": "max-age=300", // 5分キャッシュ
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

// 🚀 メモ化されたローディングコンポーネント
const LoadingState = memo(() => (
  <div className="py-8">
    <div className="flex justify-center py-20">
      <div className="flex items-center gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
        <span className="text-white">Loading articles...</span>
      </div>
    </div>
  </div>
));

LoadingState.displayName = "LoadingState";

interface AllArticlesContentProps {
  initialArticles: articleType[];
  initialPagination: {
    total: number;
    page: number;
    pageSize: number;
    pageCount: number;
  };
  initialCategoryCounts: Record<string, number>;
  initialTotalCount: number;
  initialPage: number;
  initialCategory: string;
}

export default function AllArticlesContent({
  initialArticles,
  initialPagination,
  initialCategoryCounts,
  initialTotalCount,
  initialPage,
  initialCategory,
}: AllArticlesContentProps) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [prefetchedPages, setPrefetchedPages] = useState(new Set<number>());
  const searchParams = useSearchParams();
  const router = useRouter();
  const hoverTimeoutRef = useRef<NodeJS.Timeout>();

  const currentPage = Number(searchParams.get("page") || initialPage);
  const currentCategory = searchParams.get("category") || initialCategory;

  // 🚀 APIキー生成（過去版の高速設定）
  const articlesParams = useMemo(() => {
    const params = new URLSearchParams({
      published: "true",
      page: currentPage.toString(),
      pageSize: initialPagination.pageSize.toString(),
    });
    if (currentCategory) params.append("category", currentCategory);
    return params.toString();
  }, [currentPage, currentCategory, initialPagination.pageSize]);

  const apiKey = `/api/articles?${articlesParams}`;

  // 🚀 高速SWR設定（過去版ベース）
  const {
    data: articlesData,
    error: articlesError,
    isLoading: articlesLoading,
    mutate: mutateArticles,
  } = useSWR(apiKey, fetcher, {
    fallbackData: {
      articles: initialArticles,
      pagination: initialPagination,
    },
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateOnMount: false, // 初期データがあるので再検証しない
    dedupingInterval: 60000, // 1分間キャッシュ
    refreshInterval: 0,
    keepPreviousData: true, // 🚀 重要：スムーズな遷移
    errorRetryCount: 2,
  });

  // カテゴリ数のSWR
  const { data: countsData, error: countsError } = useSWR(
    "/api/article-counts",
    fetcher,
    {
      fallbackData: { counts: initialCategoryCounts },
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateOnMount: false,
      dedupingInterval: 300000, // 5分間キャッシュ
      refreshInterval: 0,
    }
  );

  // 🚀 データの安全な取得（過去版ベース）
  const { articles, pagination, categoryCounts, totalCount, isDataReady } =
    useMemo(() => {
      // 初期データを基準に、新しいデータがあれば使用
      const safeArticles = articlesData?.articles?.length
        ? articlesData.articles
        : initialArticles;
      const safePagination = articlesData?.pagination || initialPagination;

      const counts = countsData?.counts || initialCategoryCounts;
      const calculatedTotalCount = Object.values(counts).reduce(
        (sum: number, count) => sum + (count as number),
        0
      );

      return {
        articles: safeArticles,
        pagination: safePagination,
        categoryCounts: counts,
        totalCount: calculatedTotalCount || initialTotalCount,
        isDataReady: safeArticles.length > 0,
      };
    }, [
      articlesData,
      countsData,
      initialArticles,
      initialPagination,
      initialCategoryCounts,
      initialTotalCount,
    ]);

  // 🚀 プリフェッチ関数（過去版の高速機能）
  const prefetchPage = useCallback(
    async (page: number) => {
      if (page < 1 || page > pagination.pageCount || prefetchedPages.has(page))
        return;

      const params = new URLSearchParams({
        published: "true",
        page: page.toString(),
        pageSize: pagination.pageSize.toString(),
      });
      if (currentCategory) params.append("category", currentCategory);

      const apiUrl = `/api/articles?${params.toString()}`;

      try {
        const data = await fetcher(apiUrl);
        await mutate(apiUrl, data, { revalidate: false });
        setPrefetchedPages((prev) => new Set([...prev, page]));
      } catch {
        // エラーは静かに処理
      }
    },
    [
      pagination.pageCount,
      pagination.pageSize,
      currentCategory,
      prefetchedPages,
    ]
  );

  // 🚀 プリフェッチ戦略（過去版の高速機能）
  useEffect(() => {
    if (pagination.pageCount > 1) {
      const pagesToPrefetch = [];

      if (currentPage > 1) {
        pagesToPrefetch.push({ page: currentPage - 1, delay: 0 });
      }
      if (currentPage < pagination.pageCount) {
        pagesToPrefetch.push({ page: currentPage + 1, delay: 50 });
      }

      if (currentPage > 2) {
        pagesToPrefetch.push({ page: currentPage - 2, delay: 200 });
      }
      if (currentPage + 2 <= pagination.pageCount) {
        pagesToPrefetch.push({ page: currentPage + 2, delay: 250 });
      }

      pagesToPrefetch.forEach(({ page, delay }) => {
        setTimeout(() => prefetchPage(page), delay);
      });
    }
  }, [currentPage, pagination.pageCount, prefetchPage]);

  // 🚀 ホバー時プリフェッチ（過去版の高速機能）
  const handlePageHover = useCallback(
    (page: number) => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);

      hoverTimeoutRef.current = setTimeout(() => {
        prefetchPage(page);
      }, 150);
    },
    [prefetchPage]
  );

  // 🚀 ページ遷移処理（過去版の高速機能）
  const updateQuery = useCallback(
    async (key: string, value: string) => {
      if (isTransitioning) return;

      const newPage = key === "page" ? parseInt(value) : 1;

      setIsTransitioning(true);

      // ページ変更時のプリフェッチ
      if (key === "page" && !prefetchedPages.has(newPage)) {
        try {
          await prefetchPage(newPage);
          await new Promise((resolve) => setTimeout(resolve, 100));
        } catch {
          // エラーは静かに処理
        }
      }

      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      if (key !== "page") params.set("page", "1");

      router.push(`/all-articles?${params.toString()}`, { scroll: false });

      const transitionTime =
        key === "page" && prefetchedPages.has(newPage) ? 100 : 250;
      setTimeout(() => setIsTransitioning(false), transitionTime);
    },
    [isTransitioning, searchParams, router, prefetchedPages, prefetchPage]
  );

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  // エラーハンドリング
  if (articlesError || countsError) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center text-white">
          <p className="text-xl mb-4">記事の読み込みに失敗しました</p>
          <Button
            onClick={() => {
              setPrefetchedPages(new Set());
              mutateArticles();
              window.location.reload();
            }}
            className="bg-rose-700 hover:bg-rose-800"
          >
            再読み込み
          </Button>
        </div>
      </div>
    );
  }

  // 🚀 ローディング判定（改善版）
  const isLoading = articlesLoading && !isDataReady;

  return (
    <div
      className={`transition-opacity duration-150 ${
        isTransitioning ? "opacity-75" : "opacity-100"
      }`}
    >
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
          <p className="text-lg md:text-xl max-w-2xl mx-auto">
            Browse all articles and discover stories from Japanese mythology,
            culture, festivals, and customs.
          </p>
        </div>
      </section>

      <section className="py-16 bg-slate-950 md:px-16">
        <div className="container mx-auto px-4">
          {/* 🚀 カテゴリーフィルター */}
          <div className="sticky top-16 z-20 bg-slate-950 py-4 shadow-md flex flex-wrap justify-start md:justify-center gap-3">
            <Button
              variant={!currentCategory ? "default" : "outline"}
              className={
                !currentCategory
                  ? "bg-rose-700 text-white hover:bg-rose-800"
                  : "text-white border-white hover:bg-white hover:text-slate-900"
              }
              onClick={() => updateQuery("category", "")}
              disabled={isTransitioning}
            >
              All ({totalCount})
            </Button>
            {CATEGORIES.map(({ id, name }) => (
              <Button
                key={id}
                variant={currentCategory === id ? "default" : "outline"}
                className={
                  currentCategory === id
                    ? "bg-rose-700 text-white hover:bg-rose-800"
                    : "text-white border-white hover:bg-white hover:text-slate-900"
                }
                onClick={() => updateQuery("category", id)}
                disabled={isTransitioning}
              >
                {name} ({categoryCounts[id] || 0})
              </Button>
            ))}
          </div>

          {/* 🚀 記事グリッド（改善されたローディング） */}
          <div className="flex-1 overflow-y-auto px-4 py-8">
            {isLoading ? (
              <LoadingState />
            ) : articles.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {articles.map((article: articleType) => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
                </div>

                <div className="mt-8 text-center text-white">
                  Showing {(currentPage - 1) * pagination.pageSize + 1} -
                  {Math.min(
                    currentPage * pagination.pageSize,
                    pagination.total
                  )}{" "}
                  of {pagination.total} articles
                </div>
              </>
            ) : (
              <div className="text-center py-20">
                <p className="text-white text-xl">
                  {currentCategory
                    ? `No articles found in the "${
                        CATEGORIES.find((c) => c.id === currentCategory)?.name
                      }" category.`
                    : "No articles found."}
                </p>
                {currentCategory && (
                  <Button
                    className="mt-4 bg-rose-700 hover:bg-rose-800 text-white"
                    onClick={() => updateQuery("category", "")}
                    disabled={isTransitioning}
                  >
                    View all articles
                  </Button>
                )}
              </div>
            )}

            {/* 🚀 ページネーション（高速プリフェッチ付き） */}
            {pagination.pageCount > 1 && (
              <div className="mt-12 flex justify-center">
                <Pagination
                  currentPage={currentPage}
                  totalPages={pagination.pageCount}
                  onPageChange={(page) => updateQuery("page", page.toString())}
                  onPageHover={handlePageHover}
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
