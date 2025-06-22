// app/customs/page.tsx - パフォーマンス最適化版
import { Suspense } from "react";
import Image from "next/image";
import { articleType } from "@/types/types";
import ArticleCard from "@/components/articleCard/articleCard";
import { WhiteLine } from "@/components/whiteLine/whiteLine";
import { WAY_OF_LIFE } from "@/constants/constants";
import Redbubble from "@/components/redBubble/RedBubble";
import PaginationWrapper from "@/components/pagination-wrapper";
import { Breadcrumb } from "@/components/breadcrumb";
import { generateBreadcrumbStructuredData } from "@/components/breadcrumb/config";
import Script from "next/script";

// ページごとの記事数
const ARTICLES_PER_PAGE = 6;

// 📊 パフォーマンス改善: キャッシュ戦略最適化
async function getCustomsArticles(page = 1) {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.NODE_ENV === "development"
        ? "http://localhost:3000"
        : "https://yourwebsite.com");

    const res = await fetch(
      `${baseUrl}/api/articles?category=customs&published=true&page=${page}&pageSize=${ARTICLES_PER_PAGE}`,
      {
        next: {
          revalidate: 1800, // 30分キャッシュ
          tags: ["customs-articles", `customs-page-${page}`],
        },
        headers: {
          "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
        },
      }
    );

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    const articles = Array.isArray(data.articles) ? data.articles : [];

    return {
      articles,
      pagination: data.pagination || {
        total: articles.length,
        page: 1,
        pageSize: ARTICLES_PER_PAGE,
        pageCount: Math.ceil(articles.length / ARTICLES_PER_PAGE) || 1,
      },
    };
  } catch (error) {
    console.error("Failed to fetch customs articles:", error);
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

// 📱 ローディングスケルトン
function CustomsArticlesSkeleton() {
  return (
    <section className="py-16 md:px-16">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold mb-16 text-center bg-[#180614] py-2">
          Discover Japanese customs
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-gray-700 rounded-lg h-64 mb-4"></div>
              <div className="bg-gray-600 rounded h-6 mb-2"></div>
              <div className="bg-gray-600 rounded h-4 w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// 🚀 記事セクションの分離
async function CustomsArticlesSection({
  currentPage,
}: {
  currentPage: number;
}) {
  const { articles = [], pagination } = await getCustomsArticles(currentPage);
  const totalPages = pagination.pageCount;

  return (
    <section className="py-16 md:px-16">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold mb-16 text-center bg-[#180614] py-2">
          Discover Japanese customs
        </h2>

        {articles.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {articles.map((article: articleType) => (
                <ArticleCard
                  key={`${article.id}-${currentPage}`}
                  article={article}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-8">
                <PaginationWrapper
                  currentPage={currentPage}
                  totalPages={totalPages}
                  basePath="/customs"
                  prefetchRange={2}
                />
              </div>
            )}
          </>
        ) : (
          <div className="text-center">
            <p className="text-white mb-4">
              Customs posts will be available soon.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition-colors"
            >
              Retry
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

// 🎯 メインページコンポーネント
export default async function CustomsPage({
  searchParams,
}: {
  searchParams?: { page?: string };
}) {
  const currentPage = Math.max(
    1,
    searchParams?.page ? parseInt(searchParams.page) : 1
  );

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Customs", href: "/customs", isCurrentPage: true },
  ];

  // SEO: パンくずリスト用の構造化データ
  const breadcrumbJsonLd = generateBreadcrumbStructuredData(breadcrumbItems);

  return (
    <div>
      <Script
        id="breadcrumb-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className="container mx-auto px-4">
        <Breadcrumb customItems={breadcrumbItems} />
      </div>
      {/* ヘッダー */}
      <section className="relative bg-slate-900 pb-8">
        <div className="absolute inset-0 z-0 opacity-40">
          <Image
            src="/images/category-top/custom.jpg"
            alt="Japanese Customs"
            fill
            style={{ objectFit: "cover" }}
            priority={true}
            sizes="100vw"
          />
        </div>
        <div className="container mx-auto px-6 py-32 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Japanese Customs
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto text-left">
            Japanese customs and manners reflect the deep respect for others and
            harmony in society. From bowing to gift-giving, these traditions
            embody the spirit of Japanese culture and help maintain social
            harmony.
          </p>
        </div>
      </section>

      {/* 📱 Suspense による非同期読み込み最適化 */}
      <Suspense fallback={<CustomsArticlesSkeleton />}>
        <CustomsArticlesSection currentPage={currentPage} />
      </Suspense>

      <WhiteLine />

      {/* サブカテゴリ */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold mb-16 text-center bg-[#180614] py-2">
            Japanese Way of Life
          </h2>
          <div className="grid gap-6 grid-cols-[repeat(auto-fit,minmax(8rem,1fr))] justify-items-center">
            {WAY_OF_LIFE.map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-32 h-32 mx-auto bg-amber-100 rounded-full relative overflow-hidden">
                  <Image
                    src={item.img}
                    alt={item.label}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 8rem, 8rem"
                    loading="lazy"
                  />
                </div>
                <p className="mt-2 font-medium text-white">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <WhiteLine />
      <Redbubble />
    </div>
  );
}
