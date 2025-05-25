"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
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

// フェッチャー関数（3つ目ベース）
const fetcher = async (url: string) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "Cache-Control": "max-age=300",
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

  // APIキー生成（3つ目ベース）
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

  // SWR設定（3つ目ベース）
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
    revalidateOnMount: false,
    dedupingInterval: 60000,
    refreshInterval: 0,
    keepPreviousData: true,
    errorRetryCount: 2,
  });

  // カテゴリー数のSWR（3つ目ベース）
  const { data: countsData, error: countsError } = useSWR(
    "/api/article-counts",
    fetcher,
    {
      fallbackData: { counts: initialCategoryCounts },
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateOnMount: false,
      dedupingInterval: 300000,
      refreshInterval: 0,
    }
  );

  // データの安全な取得（3つ目ベース）
  const { articles, pagination, categoryCounts, totalCount } = useMemo(() => {
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
    };
  }, [
    articlesData,
    countsData,
    initialArticles,
    initialPagination,
    initialCategoryCounts,
    initialTotalCount,
  ]);

  // プリフェッチ関数（3つ目ベース）
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

  // プリフェッチ戦略（3つ目ベース）
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

  // ホバー時プリフェッチ（3つ目ベース）
  const handlePageHover = useCallback(
    (page: number) => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);

      hoverTimeoutRef.current = setTimeout(() => {
        prefetchPage(page);
      }, 150);
    },
    [prefetchPage]
  );

  // ページ遷移処理（3つ目ベース）
  const updateQuery = useCallback(
    async (key: string, value: string) => {
      if (isTransitioning) return;

      const newPage = key === "page" ? parseInt(value) : 1;

      setIsTransitioning(true);

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

  // クリーンアップ（3つ目ベース）
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  // エラーハンドリング（3つ目ベース）
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

  // ローディング判定（3つ目ベース）
  const isLoading = articlesLoading && !articles.length;

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
          <p className="text-lg md:text-xl max-w-2xl mx-auto text-justify">
            Browse all articles and discover stories from Japanese mythology,
            culture, festivals, and customs.
          </p>
        </div>
      </section>

      <section className="py-16 bg-slate-950 md:px-16">
        <div className="container mx-auto px-4">
          {/* カテゴリーフィルター（3つ目ベース） */}
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

          {/* 記事グリッド（3つ目ベース） */}
          <div className="flex-1 overflow-y-auto px-4 py-8">
            {isLoading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white" />
              </div>
            ) : articles.length > 0 ? (
              <>
                {/* 🚀 記事一覧表示部分（1つ目ファイルから採用） */}
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

            {/* ページネーション（3つ目ベース） */}
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
