// app/mythology/page.tsx - パフォーマンス最適化版
import { Suspense } from "react";
import Image from "next/image";
import ArticleCard from "../../components/articleCard/articleCard";
import { articleType } from "@/types/types";
import { JAPANESE_GODS } from "@/constants/constants";
import RedBubble from "@/components/redBubble/RedBubble";
import { WhiteLine } from "@/components/whiteLine/whiteLine";
import PaginationWrapper from "@/components/pagination-wrapper";
import GodsGallery from "@/components/gods/GodsGallery";

const ARTICLES_PER_PAGE = 6;

// 📊 記事取得関数の最適化
async function getMythologyArticles(page = 1): Promise<{
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

    const res = await fetch(
      `${baseUrl}/api/articles?category=mythology&published=true&page=${page}&pageSize=${ARTICLES_PER_PAGE}`,
      {
        next: {
          revalidate: 1800,
          tags: ["mythology-articles", `mythology-page-${page}`],
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
    console.error("Failed to fetch mythology articles:", error);
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

// 🎯 神々データ取得の最適化
async function getGodsSlugMap(): Promise<Record<string, string>> {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.NODE_ENV === "development"
        ? "http://localhost:3000"
        : "https://yourwebsite.com");

    const godsData = await fetch(
      `${baseUrl}/api/category-items?category=about-japanese-gods`,
      {
        next: {
          revalidate: 86400, // 24時間キャッシュ
          tags: ["gods-data"],
        },
        headers: {
          "Cache-Control":
            "public, s-maxage=86400, stale-while-revalidate=172800",
        },
      }
    );

    if (godsData.ok) {
      const gods = await godsData.json();
      return gods.reduce(
        (acc: Record<string, string>, god: { title: string; slug: string }) => {
          acc[god.title] = god.slug;
          return acc;
        },
        {}
      );
    }
    return {};
  } catch (error) {
    console.error("Failed to fetch gods data:", error);
    return {};
  }
}

// 📱 神話用スケルトン
function MythologyArticlesSkeleton() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold mb-16 mt-8 text-center bg-[#180614] py-2">
          Japanese mythological stories
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch md:px-16">
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
async function MythologyArticlesSection({
  currentPage,
}: {
  currentPage: number;
}) {
  const { articles = [], pagination } = await getMythologyArticles(currentPage);
  const totalPages = pagination.pageCount;

  return (
    <section className="py-16">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold mb-16 mt-8 text-center bg-[#180614] py-2">
          Japanese mythological stories
        </h2>

        {articles.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch md:px-16">
              {articles.map((article) => (
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
                  basePath="/mythology"
                  prefetchRange={2}
                />
              </div>
            )}
          </>
        ) : (
          <div className="text-center">
            <p className="text-white mb-4">
              Mythology posts will be available soon.
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

export default async function MythologyPage({
  searchParams,
}: {
  searchParams?: { page?: string };
}) {
  const currentPage = Math.max(
    1,
    searchParams?.page ? parseInt(searchParams.page) : 1
  );

  // 🎯 並列実行でパフォーマンス向上
  const godsSlugMapPromise = getGodsSlugMap();

  return (
    <div>
      {/* ヘッダー */}
      <section className="relative bg-slate-950">
        <div className="absolute inset-0 z-0 opacity-40">
          <Image
            src="/images/category-top/mythology.jpg"
            alt="Japanese Mythology"
            fill
            style={{ objectFit: "cover" }}
            priority={true}
            sizes="100vw"
          />
        </div>
        <div className="container mx-auto px-6 py-36 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Japanese Mythology
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto text-left">
            Japan&apos;s mythology weaves timeless tales of divine creation,
            heroic adventures, and sacred traditions. We will explore the
            enchanting world of Japanese mythology through stories of gods such
            as Amaterasu, Susanoo, and Izanagi, as recorded in the Kojiki and
            Nihon Shoki.
          </p>
        </div>
      </section>

      {/* 📱 Suspense による記事読み込み */}
      <Suspense fallback={<MythologyArticlesSkeleton />}>
        <MythologyArticlesSection currentPage={currentPage} />
      </Suspense>

      <WhiteLine />

      {/* 神々ギャラリー */}
      <section className="py-16" id="about-japanese-gods">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold mb-12 text-center bg-[#180614] py-2">
            About Japanese Gods
          </h2>
          <Suspense
            fallback={
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="animate-pulse bg-gray-700 rounded-lg h-40"
                  ></div>
                ))}
              </div>
            }
          >
            <GodsGalleryWrapper godsSlugMapPromise={godsSlugMapPromise} />
          </Suspense>
        </div>
      </section>

      <WhiteLine />
      <RedBubble />
    </div>
  );
}

// 🎯 神々ギャラリーのラッパーコンポーネント
async function GodsGalleryWrapper({
  godsSlugMapPromise,
}: {
  godsSlugMapPromise: Promise<Record<string, string>>;
}) {
  const godsSlugMap = await godsSlugMapPromise;
  return <GodsGallery gods={JAPANESE_GODS} slugMap={godsSlugMap} />;
}
