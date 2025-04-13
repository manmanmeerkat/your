"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import ArticleCard from "@/components/articleCard/articleCard";
import { articleType } from "@/types/types";
import { Pagination } from "@/components/pagination/Pagination";
import { WhiteLine } from "@/components/whiteLine/whiteLine";

export default function AllArticlesPage() {
  const [articles, setArticles] = useState<articleType[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pageSize: 12,
    pageCount: 1,
  });
  // カテゴリーごとの記事数
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>(
    {}
  );

  const searchParams = useSearchParams();
  const router = useRouter();
  const currentPage = Number(searchParams.get("page") || "1");
  const currentCategory = searchParams.get("category") || "";

  // カテゴリーリスト
  const categories = [
    { id: "culture", name: "Culture" },
    { id: "mythology", name: "Mythology" },
    { id: "customs", name: "Customs" },
    { id: "festivals", name: "Festivals" },
  ];

  // カテゴリーごとの記事数を取得
  useEffect(() => {
    const fetchCategoryCounts = async () => {
      try {
        const baseUrl =
          process.env.NEXT_PUBLIC_SITE_URL ||
          (process.env.NODE_ENV === "development"
            ? "http://localhost:3000"
            : "https://yourwebsite.com");

        const res = await fetch(`${baseUrl}/api/article-counts`, {
          cache: "no-cache",
        });

        if (res.ok) {
          const data = await res.json();
          setCategoryCounts(data.counts || {});
        }
      } catch (e) {
        console.error("カテゴリー集計エラー:", e);
      }
    };

    fetchCategoryCounts();
  }, []);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);

        const baseUrl =
          process.env.NEXT_PUBLIC_SITE_URL ||
          (process.env.NODE_ENV === "development"
            ? "http://localhost:3000"
            : "https://yourwebsite.com");

        // クエリパラメータの構築
        const queryParams = new URLSearchParams();
        queryParams.append("published", "true");
        queryParams.append("page", currentPage.toString());
        queryParams.append("pageSize", pagination.pageSize.toString());

        // カテゴリーフィルターが指定されている場合
        if (currentCategory) {
          queryParams.append("category", currentCategory);
        }

        const res = await fetch(
          `${baseUrl}/api/articles?${queryParams.toString()}`,
          {
            cache: "no-cache",
          }
        );

        if (!res.ok) {
          throw new Error(`API error: ${res.status}`);
        }

        const data = await res.json();
        setArticles(data.articles || []);

        // ページネーション情報の更新
        if (data.pagination) {
          setPagination(data.pagination);
        }
      } catch (e) {
        console.error("記事取得エラー:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [currentPage, currentCategory, pagination.pageSize]);

  // ページ変更ハンドラー
  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`/all-articles?${params.toString()}`);
  };

  // カテゴリー変更ハンドラー
  const handleCategoryChange = (category: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (category) {
      params.set("category", category);
    } else {
      params.delete("category");
    }

    // カテゴリー変更時はページを1に戻す
    params.set("page", "1");

    router.push(`/all-articles?${params.toString()}`);
  };

  return (
    <div className="bg-slate-900 min-h-screen pb-16">
      {/* ヘッダーバナー */}
      <div className="bg-slate-800 py-16 text-center text-white">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">All Articles</h1>
          {currentCategory ? (
            <p className="text-xl text-gray-300">
              Browsing{" "}
              {categories.find((c) => c.id === currentCategory)?.name ||
                currentCategory}{" "}
              articles
            </p>
          ) : (
            <p className="text-xl text-gray-300">
              Total: {pagination.total} articles
            </p>
          )}
        </div>
      </div>

      <WhiteLine />

      {/* カテゴリーフィルター */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          <Button
            variant={!currentCategory ? "default" : "outline"}
            className={
              !currentCategory
                ? "bg-rose-700 text-white hover:bg-rose-800"
                : "text-white border-white hover:bg-white hover:text-slate-900"
            }
            onClick={() => handleCategoryChange("")}
          >
            All ({pagination.total})
          </Button>

          {categories.map((category) => (
            <Button
              key={category.id}
              variant={currentCategory === category.id ? "default" : "outline"}
              className={
                currentCategory === category.id
                  ? "bg-rose-700 text-white hover:bg-rose-800"
                  : "text-white border-white hover:bg-white hover:text-slate-900"
              }
              onClick={() => handleCategoryChange(category.id)}
            >
              {category.name} ({categoryCounts[category.id] || 0})
            </Button>
          ))}
        </div>

        {/* 記事一覧 */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white" />
          </div>
        ) : articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-white text-xl">
              {currentCategory
                ? `No articles found in the "${
                    categories.find((c) => c.id === currentCategory)?.name
                  }" category.`
                : "No articles found."}
            </p>
            {currentCategory && (
              <Button
                className="mt-4 bg-rose-700 hover:bg-rose-800 text-white"
                onClick={() => handleCategoryChange("")}
              >
                View all articles
              </Button>
            )}
          </div>
        )}

        {/* 現在のページ情報 */}
        {articles.length > 0 && (
          <div className="mt-8 text-center text-slate-400">
            Showing {(currentPage - 1) * pagination.pageSize + 1} -{" "}
            {Math.min(currentPage * pagination.pageSize, pagination.total)} of{" "}
            {pagination.total} articles
          </div>
        )}

        {/* ページネーション */}
        {pagination.pageCount > 1 && (
          <div className="mt-12 flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={pagination.pageCount}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>

      <WhiteLine />

      {/* バックリンク */}
      <div className="container mx-auto px-4 py-8 text-center">
        <Link href="/">
          <Button
            variant="outline"
            className="text-white border-white hover:bg-white hover:text-slate-900"
          >
            ← Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
