// app/all-articles/AllArticlesContent.tsx
"use client";

import { useEffect, useState, useMemo } from "react";
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
const fetcher = (url: string) => fetch(url).then((res) => res.json());

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
  const searchParams = useSearchParams();
  const router = useRouter();

  const currentPage = Number(searchParams.get("page") || initialPage);
  const currentCategory = searchParams.get("category") || initialCategory;

  // 記事データのSWRキャッシュ
  const articlesParams = useMemo(() => {
    const params = new URLSearchParams({
      published: "true",
      page: currentPage.toString(),
      pageSize: initialPagination.pageSize.toString(),
    });
    if (currentCategory) params.append("category", currentCategory);
    return params.toString();
  }, [currentPage, currentCategory, initialPagination.pageSize]);

  const {
    data: articlesData,
    error: articlesError,
    isLoading: articlesLoading,
    mutate: mutateArticles,
  } = useSWR(`/api/articles?${articlesParams}`, fetcher, {
    fallbackData: {
      articles: initialArticles,
      pagination: initialPagination,
    },
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 30000, // 30秒間の重複排除
    refreshInterval: 0, // 自動更新無効
  });

  // カテゴリー数のSWRキャッシュ
  const { data: countsData, error: countsError } = useSWR(
    "/api/article-counts",
    fetcher,
    {
      fallbackData: { counts: initialCategoryCounts },
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 300000, // 5分間の重複排除
      refreshInterval: 0,
    }
  );

  // メモ化された値
  const { articles, pagination, categoryCounts, totalCount } = useMemo(() => {
    const counts = countsData?.counts || initialCategoryCounts;
    const calculatedTotalCount = Object.values(counts).reduce(
      (sum: number, count) => sum + (count as number),
      0
    );

    return {
      articles: articlesData?.articles || initialArticles,
      pagination: articlesData?.pagination || initialPagination,
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

  // 隣接ページのプリフェッチ
  useEffect(() => {
    if (!articlesLoading && pagination) {
      const prefetchPage = (page: number) => {
        const params = new URLSearchParams({
          published: "true",
          page: page.toString(),
          pageSize: pagination.pageSize.toString(),
        });
        if (currentCategory) params.append("category", currentCategory);

        // プリフェッチ（キャッシュに保存のみ、画面更新なし）
        mutateArticles(`/api/articles?${params.toString()}`, {
          revalidate: false,
        });
      };

      // 前後のページをプリフェッチ
      if (currentPage > 1) {
        prefetchPage(currentPage - 1);
      }
      if (currentPage < pagination.pageCount) {
        prefetchPage(currentPage + 1);
      }
    }
  }, [
    currentPage,
    currentCategory,
    pagination,
    articlesLoading,
    mutateArticles,
  ]);

  const updateQuery = (key: string, value: string) => {
    setIsTransitioning(true);

    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    if (key !== "page") params.set("page", "1");

    // 新しいページのデータをプリフェッチ
    if (key === "category" || key === "page") {
      const newPage = key === "page" ? value : "1";
      const newCategory = key === "category" ? value : currentCategory;

      const prefetchParams = new URLSearchParams({
        published: "true",
        page: newPage,
        pageSize: pagination.pageSize.toString(),
      });
      if (newCategory) prefetchParams.append("category", newCategory);

      // プリフェッチして即座にページ遷移
      mutateArticles(`/api/articles?${prefetchParams.toString()}`, {
        revalidate: false,
      });
    }

    router.push(`/all-articles?${params.toString()}`, { scroll: false });

    // 遷移アニメーション
    setTimeout(() => setIsTransitioning(false), 200);
  };

  // エラーハンドリング
  if (articlesError || countsError) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center text-white">
          <p className="text-xl mb-4">記事の読み込みに失敗しました</p>
          <Button
            onClick={() => {
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

  const isLoading = articlesLoading && !articles.length;

  return (
    <div
      className={`transition-opacity duration-200 ${
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
          {/* カテゴリーフィルター - スティッキー */}
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

          {/* 記事グリッド */}
          <div className="flex-1 overflow-y-auto px-4 py-8">
            {isLoading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white" />
              </div>
            ) : articles.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {articles.map((article: articleType) => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
                </div>

                {/* 記事数表示 */}
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

            {/* ページネーション */}
            {pagination.pageCount > 1 && (
              <div className="mt-12 flex justify-center">
                <Pagination
                  currentPage={currentPage}
                  totalPages={pagination.pageCount}
                  onPageChange={(page) => updateQuery("page", page.toString())}
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
