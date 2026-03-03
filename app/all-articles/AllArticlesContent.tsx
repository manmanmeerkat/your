// app/all-articles/page.tsx (サーバーコンポーネント版)
import Image from "next/image";
import ArticleCard from "@/components/articleCard/articleCard";
import { articleType } from "@/types/types";
import { WhiteLine } from "@/components/whiteLine/whiteLine";
import { CATEGORIES } from "@/constants/constants";
// import Redbubble from "@/components/redBubble/RedBubble";
import AllArticlesPaginationWrapper from "@/components/allArticlesComponents/AllArticlesPaginationWrapper";
import AllArticlesCategoryFilter from "@/components/allArticlesComponents/allArticlesCategoryFilter/AllArticlesCategoryFilter";
import {
  PAGE_DYNAMIC,
  PAGE_REVALIDATE,
  PAGE_FETCH_CACHE,
  FETCH_CACHE,
} from "@/lib/cachePolicy/cachePolicy";

// Dev/Preview: 即反映（毎回最新）
// Prod: 静的（デプロイで更新）
export const dynamic = PAGE_DYNAMIC;
export const revalidate = PAGE_REVALIDATE;
export const fetchCache = PAGE_FETCH_CACHE;

const FETCH_INIT = FETCH_CACHE.pageData;

// ページごとの記事数
const ARTICLES_PER_PAGE = 6;

// 記事取得関数（サーバーサイド）
async function getAllArticles(
  page = 1,
  category = ""
): Promise<{
  articles: articleType[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    pageCount: number;
  };
}> {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.NODE_ENV === "development"
        ? "http://localhost:3000"
        : "https://yourwebsite.com");

    const params = new URLSearchParams({
      published: "true",
      page: page.toString(),
      pageSize: ARTICLES_PER_PAGE.toString(),
    });

    if (category) params.append("category", category);

    const res = await fetch(`${baseUrl}/api/articles?${params.toString()}`, FETCH_INIT);

    if (!res.ok) {
      return {
        articles: [],
        pagination: {
          total: 0,
          page: 1,
          pageSize: ARTICLES_PER_PAGE,
          pageCount: 1,
        },
      };
    }

    const data = await res.json();
    return {
      articles: Array.isArray(data.articles) ? data.articles : [],
      pagination: data.pagination || {
        total: 0,
        page: 1,
        pageSize: ARTICLES_PER_PAGE,
        pageCount: 1,
      },
    };
  } catch (error) {
    console.error("Failed to fetch articles:", error);
    return {
      articles: [],
      pagination: {
        total: 0,
        page: 1,
        pageSize: ARTICLES_PER_PAGE,
        pageCount: 1,
      },
    };
  }
}

// カテゴリ数取得関数（サーバーサイド）
async function getCategoryCounts(): Promise<Record<string, number>> {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.NODE_ENV === "development"
        ? "http://localhost:3000"
        : "https://yourwebsite.com");

    const res = await fetch(`${baseUrl}/api/article-counts`, FETCH_INIT);

    if (res.ok) {
      const data = await res.json();
      return data.counts || {};
    }
    return {};
  } catch (error) {
    console.error("Failed to fetch category counts:", error);
    return {};
  }
}

export default async function AllArticlesPage({
  searchParams,
}: {
  searchParams?: { page?: string; category?: string };
}) {
  // 🚀 サーバーサイドでパラメータ処理（mythology/page.tsx方式）
  const currentPage = searchParams?.page ? parseInt(searchParams.page) : 1;
  const currentCategory = searchParams?.category || "";

  // 🚀 サーバーサイドで並列データ取得（mythology/page.tsx方式）
  const [{ articles, pagination }, categoryCounts] = await Promise.all([
    getAllArticles(currentPage, currentCategory),
    getCategoryCounts(),
  ]);

  // 総記事数計算
  const totalCount =
    Object.values(categoryCounts).reduce(
      (sum: number, count) => sum + (count as number),
      0
    ) || articles.length;

  return (
    <div>
      <section className="relative bg-slate-950 text-white pt-16 pb-16 overflow-hidden">
        {/* background layer（装飾） */}
        <div className="absolute inset-0" aria-hidden="true">
          <Image
            src="/images/category-top/all-posts.jpg"
            alt=""
            fill
            className="object-cover opacity-30"
            priority
            fetchPriority="high"
            sizes="100vw"
            quality={60}
          />
          {/* overlay（読みやすさを自然に） */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/45 to-black/65" />
        </div>

        {/* content layer */}
        <div className="relative container mx-auto px-6 py-24 z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">All Posts</h1>

          <p className="text-lg md:text-xl max-w-2xl mx-auto text-justify text-white/85">
            Browse all articles and discover stories from Japanese mythology,
            culture, festivals, and customs.
          </p>
        </div>
      </section>

      <section className="py-16 bg-slate-950 md:px-16">
        <div className="container mx-auto px-4">
          {/* 🚀 カテゴリーフィルター（クライアントコンポーネント） */}
          <AllArticlesCategoryFilter
            currentCategory={currentCategory}
            totalCount={totalCount}
            categoryCounts={categoryCounts}
          />

          {/* 記事コンテンツ */}
          <div className="flex-1 overflow-y-auto px-4 py-8">
            {articles.length > 0 ? (
              <>
                {/* 🚀 記事グリッド（サーバーサイドレンダリング） */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {articles.map((article: articleType) => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
                </div>

                {/* 結果表示 */}
                <div className="mt-8 text-center text-white">
                  <p>
                    Showing {(currentPage - 1) * ARTICLES_PER_PAGE + 1} -
                    {Math.min(
                      currentPage * ARTICLES_PER_PAGE,
                      pagination.total
                    )}{" "}
                    of {pagination.total} articles
                  </p>
                  {currentCategory && (
                    <p className="text-gray-400 text-sm mt-1">
                      Category:{" "}
                      {CATEGORIES.find((c) => c.id === currentCategory)?.name}
                    </p>
                  )}
                </div>

                {/* 🚀 ページネーション（mythology/page.tsx方式） */}
                {pagination.pageCount > 1 && (
                  <AllArticlesPaginationWrapper
                    currentPage={currentPage}
                    totalPages={pagination.pageCount}
                    currentCategory={currentCategory}
                  />
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
                  <div className="mt-4">
                    <a
                      href="/all-articles"
                      className="inline-block bg-rose-700 hover:bg-rose-800 text-white px-4 py-2 rounded-md transition-colors"
                    >
                      View all articles
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      <WhiteLine />
      {/* <Redbubble /> */}
      <WhiteLine />
    </div>
  );
}
