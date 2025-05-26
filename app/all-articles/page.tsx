// app/all-articles/page.tsx
import { Suspense } from "react";
import ArticlesLoader from "@/components/loaders/ArticlesLoader";
import Image from "next/image";
import ArticleCard from "@/components/articleCard/articleCard";
import AllArticlesCategoryFilter from "@/components/AllArticlesCategoryFilter";
import AllArticlesPaginationWrapper from "@/components/AllArticlesPaginationWrapper";
import { WhiteLine } from "@/components/whiteLine/whiteLine";
import Redbubble from "@/components/redBubble/RedBubble";
import { articleType } from "@/types/types";

// ISR設定 - 30分ごとに再生成
export const revalidate = 1800;

// 動的レンダリングを避けるため、一般的なパラメータを事前生成
export async function generateStaticParams() {
  return [
    {},
    { page: "1" },
    { category: "mythology" },
    { category: "festivals" },
    { category: "customs" },
    { category: "culture" },
  ];
}

// 最適化されたデータ取得関数
async function fetchArticlesData(
  page: number,
  category: string,
  pageSize: number = 12
) {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.NODE_ENV === "development" ? "http://localhost:3000" : "");

  try {
    // キャッシュ戦略を改善
    const cacheOption =
      process.env.NODE_ENV === "development" ? "no-store" : "force-cache";
    const revalidateTime = process.env.NODE_ENV === "development" ? 0 : 1800; // 30分

    // カテゴリー数を取得（長期キャッシュ）
    const countsPromise = fetch(`${baseUrl}/api/article-counts`, {
      cache: cacheOption,
      next: {
        revalidate: 3600, // 1時間キャッシュ
        tags: ["article-counts"],
      },
    });

    // 記事データを取得
    const params = new URLSearchParams({
      published: "true",
      page: page.toString(),
      pageSize: pageSize.toString(),
    });
    if (category) params.append("category", category);

    const articlesPromise = fetch(`${baseUrl}/api/articles?${params}`, {
      cache: cacheOption,
      next: {
        revalidate: revalidateTime,
        tags: ["articles", `articles-${category}`, `articles-page-${page}`],
      },
    });

    // 並列実行
    const [countsResponse, articlesResponse] = await Promise.all([
      countsPromise,
      articlesPromise,
    ]);

    // エラーハンドリング - 部分的な成功でも対応
    let categoryCounts = {};

    if (countsResponse.ok) {
      const countsData = await countsResponse.json();
      categoryCounts = countsData.counts || {};
    } else {
      console.warn(`Category counts fetch failed: ${countsResponse.status}`);
    }

    let articles = [];
    let pagination = { total: 0, page, pageSize, pageCount: 1 };

    if (articlesResponse.ok) {
      const articlesData = await articlesResponse.json();
      articles = articlesData.articles || [];
      pagination = articlesData.pagination || pagination;
    } else {
      console.warn(`Articles fetch failed: ${articlesResponse.status}`);
    }

    return {
      articles,
      pagination,
      categoryCounts,
    };
  } catch (error) {
    console.error("データ取得エラー:", error);

    // フォールバックデータ
    return {
      articles: [],
      pagination: { total: 0, page, pageSize, pageCount: 1 },
      categoryCounts: {},
    };
  }
}

// メインのページコンポーネント
export default async function AllArticlesPage({
  searchParams,
}: {
  searchParams?: { page?: string; category?: string };
}) {
  const page = searchParams?.page ? parseInt(searchParams.page) : 1;
  const category = searchParams?.category || "";
  const pageSize = 12;

  // サーバーサイドでデータを取得
  const { articles, pagination, categoryCounts } = await fetchArticlesData(
    page,
    category,
    pageSize
  );

  return (
    <div className="min-h-screen">
      <Suspense fallback={<ArticlesLoader fullPage />}>
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
            {/* 🚀 カテゴリーフィルター（クライアントコンポーネント） */}
            <AllArticlesCategoryFilter
              currentCategory={category}
              totalCount={Object.values(
                categoryCounts as Record<string, number>
              ).reduce((sum, count) => sum + count, 0)}
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
                      Showing {(page - 1) * pageSize + 1} -
                      {Math.min(page * pageSize, pagination.total)} of{" "}
                      {pagination.total} articles
                    </p>
                    {category && (
                      <p className="text-gray-400 text-sm mt-1">
                        Category:{" "}
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </p>
                    )}
                  </div>

                  {/* 🚀 ページネーション（mythology/page.tsx方式） */}
                  {pagination.pageCount > 1 && (
                    <AllArticlesPaginationWrapper
                      currentPage={page}
                      totalPages={pagination.pageCount}
                      currentCategory={category}
                    />
                  )}
                </>
              ) : (
                <div className="text-center py-20">
                  <p className="text-white text-xl">
                    {category
                      ? `No articles found in "${
                          category.charAt(0).toUpperCase() + category.slice(1)
                        }" category.`
                      : "No articles found."}
                  </p>
                  {category && (
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
        <Redbubble />
        <WhiteLine />
      </Suspense>
    </div>
  );
}

// 動的メタデータ生成
export async function generateMetadata({
  searchParams,
}: {
  searchParams?: { page?: string; category?: string };
}) {
  const category = searchParams?.category;
  const page = searchParams?.page;

  let title = "All Articles | Your Secret Japan";
  let description =
    "Browse all articles about Japanese mythology, culture, festivals, and customs.";

  if (category) {
    const categoryNames: { [key: string]: string } = {
      mythology: "Japanese Mythology",
      festivals: "Japanese Festivals",
      customs: "Japanese Customs",
      culture: "Japanese Culture",
    };
    const categoryName = categoryNames[category] || category;
    title = `${categoryName} Articles | Your Secret Japan`;
    description = `Explore ${categoryName.toLowerCase()} articles and discover the rich heritage of Japan.`;
  }

  if (page && parseInt(page) > 1) {
    title += ` - Page ${page}`;
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}
