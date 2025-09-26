// app/culture/page.tsx - 既存コンポーネント活用改善版
import { Suspense } from "react";
import Image from "next/image";
import { articleType } from "@/types/types";
import ArticleCard from "../../components/articleCard/articleCard";
import { CULTURE_CATEGORIES } from "@/constants/constants";
// import RedBubble from "@/components/redBubble/RedBubble";
import { WhiteLine } from "@/components/whiteLine/whiteLine";
import PaginationWrapper from "@/components/pagination-wrapper";
import { Breadcrumb } from "@/components/breadcrumb";
import { generateBreadcrumbStructuredData } from "@/components/breadcrumb/config";
import Script from "next/script";
import { BackToHomeBtn } from "@/components/backToHomeBtn/BackToHomeBtn";

// ページごとの記事数
const ARTICLES_PER_PAGE = 6;

// 📊 パフォーマンス改善1: キャッシュ戦略の最適化
async function getCultureArticles(page = 1) {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.NODE_ENV === "development"
        ? "http://localhost:3000"
        : "https://yourwebsite.com");

    const res = await fetch(
      `${baseUrl}/api/articles?category=culture&published=true&page=${page}&pageSize=${ARTICLES_PER_PAGE}`,
      {
        next: {
          revalidate: 1800, // 30分キャッシュ
          tags: ["culture-articles", `culture-page-${page}`], // ページ別キャッシュタグ
        },
        // 📈 追加の最適化オプション
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
    console.error("Failed to fetch culture articles:", error);
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
function ArticleGridSkeleton() {
  return (
    <section className="py-24">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold mb-16 text-center bg-[#180614] py-2">
          The charm of Japanese culture
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:px-16">
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

// 🚀 記事セクションの分離（Suspense用）
async function CultureArticlesSection({
  currentPage,
}: {
  currentPage: number;
}) {
  const { articles = [], pagination } = await getCultureArticles(currentPage);
  const totalPages = pagination.pageCount;

  return (
    <section className="py-24">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold mb-16 text-center bg-[#180614] py-2">
          The charm of Japanese culture
        </h2>

        {articles.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:px-16">
              {articles.map((article: articleType) => (
                <ArticleCard
                  key={`${article.id}-${currentPage}`}
                  article={article}
                />
              ))}
            </div>

            {/* 📈 既存のページネーションを活用 */}
            {totalPages > 1 && (
              <div className="mt-8">
                <PaginationWrapper
                  currentPage={currentPage}
                  totalPages={totalPages}
                  basePath="/culture"
                />
              </div>
            )}
          </>
        ) : (
          <div className="text-center">
            <p className="text-white mb-4">
              Culture posts will be available soon.
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
export default async function CulturePage({
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
    { label: "Culture", href: "/culture", isCurrentPage: true },
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
            src="/images/category-top/culture.jpg"
            alt="Japanese Culture"
            fill
            style={{ objectFit: "cover" }}
            priority={true}
            sizes="100vw"
          />
        </div>
        <div className="container mx-auto px-6 py-32 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Japanese Culture
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto text-left">
            Japan has cultivated a rich cultural heritage for over a thousand
            years, blending refined traditions, craftsmanship, and everyday
            practices. We will explore the depth and beauty of Japanese culture
            through arts such as the tea ceremony, ceramics, kimono, and
            ukiyo-e.
          </p>
        </div>
      </section>

      {/* 📱 Suspense による非同期読み込み最適化 */}
      <Suspense fallback={<ArticleGridSkeleton />}>
        <CultureArticlesSection currentPage={currentPage} />
      </Suspense>

      <WhiteLine />

      {/* 文化カテゴリー */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold mb-16 text-center bg-[#180614] py-2">
            Japanese Culture Category
          </h2>
          <div className="grid gap-6 grid-cols-[repeat(auto-fit,minmax(8rem,1fr))] justify-items-center">
            {CULTURE_CATEGORIES.map((category, index) => (
              <div key={index} className="text-center">
                <div className="w-32 h-32 bg-indigo-100 rounded-full relative overflow-hidden mx-auto">
                  <Image
                    src={category.img}
                    alt={category.name}
                    fill
                    style={{ objectFit: "cover" }}
                    sizes="(max-width: 768px) 8rem, 8rem"
                    loading="lazy"
                  />
                </div>
                <p className="mt-2 font-medium text-white">{category.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <WhiteLine />
      <BackToHomeBtn/>
      {/* <RedBubble /> */}
    </div>
  );
}
