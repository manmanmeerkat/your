"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import ArticleCard from "@/components/articleCard/articleCard";
import { articleType } from "@/types/types";
import { Pagination } from "@/components/pagination/Pagination";
import { WhiteLine } from "@/components/whiteLine/whiteLine";
import Image from "next/image";
import { CATEGORIES } from "@/constants/constants";
import Redbubble from "@/components/redBubble/RedBubble";

// サーバーからのデータを受け取るための型
export type ArticlesPaginationType = {
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

export type CategoryCountsType = Record<string, number>;

type AllArticlesContentProps = {
  initialArticles: articleType[];
  initialPagination: ArticlesPaginationType;
  initialCategoryCounts: CategoryCountsType;
  initialTotalCount: number;
  initialPage: number;
  initialCategory: string;
};

// クライアントコンポーネント
export default function AllArticlesContent({
  initialArticles,
  initialPagination,
  initialCategoryCounts,
  initialTotalCount,
  initialPage,
  initialCategory,
}: AllArticlesContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 現在の状態を取得
  const currentPage = Number(
    searchParams.get("page") || initialPage.toString()
  );
  const currentCategory = searchParams.get("category") || initialCategory;

  // URL変更時にルーターで新しいページを表示
  const updateQuery = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);

    // カテゴリー変更時はページを1に戻す
    if (key !== "page") params.set("page", "1");

    router.push(`/all-articles?${params.toString()}`);
  };

  return (
    <div>
      <section className="relative bg-slate-950 text-white pt-16 pb-16">
        <div className="absolute inset-0 z-0 opacity-30">
          <Image
            src="/images/category-top/all-posts.jpg"
            alt="Japanese Customs"
            fill
            style={{ objectFit: "cover" }}
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
          <div className="sticky top-16 z-20 bg-slate-950 py-4 shadow-md flex flex-wrap justify-start md:justify-center gap-3">
            <Button
              variant={!currentCategory ? "default" : "outline"}
              className={
                !currentCategory
                  ? "bg-rose-700 text-white hover:bg-rose-800"
                  : "text-white border-white hover:bg-white hover:text-slate-900"
              }
              onClick={() => updateQuery("category", "")}
            >
              All ({initialTotalCount})
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
              >
                {name} ({initialCategoryCounts[id] || 0})
              </Button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-8">
            {initialArticles && initialArticles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {initialArticles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
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
                  >
                    View all articles
                  </Button>
                )}
              </div>
            )}

            {initialArticles &&
              initialArticles.length > 0 &&
              initialPagination && (
                <div className="mt-8 text-center text-white">
                  Showing {(currentPage - 1) * initialPagination.pageSize + 1} -
                  {Math.min(
                    currentPage * initialPagination.pageSize,
                    initialPagination.total
                  )}{" "}
                  of {initialPagination.total} articles
                </div>
              )}

            {initialPagination && initialPagination.pageCount > 1 && (
              <div className="mt-12 flex justify-center">
                <Pagination
                  currentPage={currentPage}
                  totalPages={initialPagination.pageCount}
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
