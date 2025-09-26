// app/festivals/page.tsx - パフォーマンス最適化版
import { Suspense } from "react";
import Image from "next/image";
import { SEASONAL_FESTIVALS } from "@/constants/constants";
import ArticleCard from "../../components/articleCard/articleCard";
import { articleType } from "@/types/types";
import { THREE_BIG_FESTIVALS } from "@/constants/constants";
import { WhiteLine } from "@/components/whiteLine/whiteLine";
// import RedBubble from "@/components/redBubble/RedBubble";
import PaginationWrapper from "@/components/pagination-wrapper";
import { Breadcrumb } from "@/components/breadcrumb";
import { generateBreadcrumbStructuredData } from "@/components/breadcrumb/config";
import Script from "next/script";
import { BackToHomeBtn } from "@/components/backToHomeBtn/BackToHomeBtn";

const ARTICLES_PER_PAGE = 6;

// 📊 最適化された記事取得関数
async function getFestivalArticles(page = 1) {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.NODE_ENV === "development"
        ? "http://localhost:3000"
        : "https://yourwebsite.com");

    const res = await fetch(
      `${baseUrl}/api/articles?category=festivals&published=true&page=${page}&pageSize=${ARTICLES_PER_PAGE}`,
      {
        next: {
          revalidate: 1800,
          tags: ["festivals-articles", `festivals-page-${page}`],
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
    console.error("Failed to fetch festival articles:", error);
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

// 📱 フェスティバル用スケルトン
function FestivalArticlesSkeleton() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold mb-16 mt-8 text-center bg-[#180614] py-2">
          Festivals around Japan
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

// 🚀 記事セクション
async function FestivalArticlesSection({
  currentPage,
}: {
  currentPage: number;
}) {
  const { articles = [], pagination } = await getFestivalArticles(currentPage);
  const totalPages = pagination.pageCount;

  return (
    <section className="py-16">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold mb-16 mt-8 text-center bg-[#180614] py-2">
          Festivals around Japan
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

            {totalPages > 1 && (
              <div className="mt-8">
                <PaginationWrapper
                  currentPage={currentPage}
                  totalPages={totalPages}
                  basePath="/festivals"
                  prefetchRange={2}
                />
              </div>
            )}
          </>
        ) : (
          <div className="text-center">
            <p className="text-white mb-4">
              Festivals posts will be available soon.
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
export default async function FestivalsPage({
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
    { label: "Festivals", href: "/festivals", isCurrentPage: true },
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
            src="/images/category-top/festival.jpg"
            alt="Japanese Festivals"
            fill
            style={{ objectFit: "cover" }}
            priority={true}
            sizes="100vw"
          />
        </div>
        <div className="container mx-auto px-6 py-32 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Japanese Festivals
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto text-left">
            Japanese festivals (matsuri) are vibrant celebrations that connect
            communities with their traditions and seasonal rhythms. From the
            famous Gion Matsuri to local shrine festivals, these events bring
            people together to honor deities and celebrate life.
          </p>
        </div>
      </section>

      {/* 📱 Suspense による非同期読み込み最適化 */}
      <Suspense fallback={<FestivalArticlesSkeleton />}>
        <FestivalArticlesSection currentPage={currentPage} />
      </Suspense>

      <WhiteLine />

      {/* 祭りカテゴリー */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold mb-16 text-center bg-[#180614] py-2">
            Seasonal Festivals
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {SEASONAL_FESTIVALS.map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-32 h-32 mx-auto rounded-full relative flex items-center justify-center overflow-hidden">
                  <Image
                    src={item.img}
                    alt={`${item.season} icon`}
                    fill
                    style={{ objectFit: "cover" }}
                    sizes="(max-width: 768px) 8rem, 8rem"
                    loading="lazy"
                    unoptimized
                  />
                </div>
                <h3 className="mt-4 font-bold text-xl text-white">
                  {item.label}
                </h3>
                <p className="mt-2 text-white">
                  {item.example1}
                  <br />
                  {item.example2}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <WhiteLine />

      {/* 日本三大祭り */}
      <section className="py-16 md:px-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold mb-16 text-center bg-[#180614] py-2">
            Japan&apos;s Three Biggest Festivals
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {THREE_BIG_FESTIVALS.map((festival, idx) => (
              <div
                key={idx}
                className="bg-white rounded-lg overflow-hidden shadow-md"
              >
                <div className="h-48 bg-slate-200 relative">
                  <Image
                    src={festival.img}
                    alt={festival.alt}
                    fill
                    style={{ objectFit: "cover" }}
                    sizes="(max-width: 768px) 100vw, 33vw"
                    loading="lazy"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 text-[#180614]">
                    {festival.title}
                  </h3>
                  <p className="text-[#180614] mb-4">{festival.text}</p>
                </div>
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
