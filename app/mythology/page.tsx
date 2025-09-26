// app/mythology/page.tsx - スクロール制御の改善版
import { Suspense } from "react";
import Image from "next/image";
import ArticleCard from "../../components/articleCard/articleCard";
import { articleType } from "@/types/types";
import { JAPANESE_GODS } from "@/constants/constants";
// import RedBubble from "@/components/redBubble/RedBubble";
import { WhiteLine } from "@/components/whiteLine/whiteLine";
import PaginationWrapper from "@/components/pagination-wrapper";
import GodsGallery from "@/components/gods/GodsGallery";
import ScrollHandler from "@/components/scroll/ScrollHandler"; // 新しいコンポーネント
import { Breadcrumb } from "@/components/breadcrumb";
import { generateBreadcrumbStructuredData } from "@/components/breadcrumb/config";
import Script from "next/script";
import { BackToHomeBtn } from "@/components/backToHomeBtn/BackToHomeBtn";

const ARTICLES_PER_PAGE = 6;

// 記事取得関数（元のまま）
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

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(
      `${baseUrl}/api/articles?category=mythology&published=true&page=${page}&pageSize=${ARTICLES_PER_PAGE}`,
      {
        signal: controller.signal,
        next: {
          revalidate: 1800,
          tags: ["mythology-articles", `mythology-page-${page}`],
        },
        headers: {
          "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status} - ${res.statusText}`);
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

// 神々データ取得（修正版）
async function getGodsSlugMap(): Promise<Record<string, string>> {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.NODE_ENV === "development"
        ? "http://localhost:3000"
        : "https://yourwebsite.com");

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const godsData = await fetch(
      `${baseUrl}/api/category-items?category=about-japanese-gods`,
      {
        signal: controller.signal,
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Accept: "application/json",
        },
      }
    );

    clearTimeout(timeoutId);

    if (godsData.ok) {
      const gods = await godsData.json();

      const slugMap: Record<string, string> = {};
      if (Array.isArray(gods)) {
        gods.forEach((god: { title: string; slug: string }) => {
          if (god.title && god.slug) {
            // タイトルの正規化バリエーションをキーにして対応
            const normalizedTitle = god.title.trim();
            slugMap[normalizedTitle] = god.slug;

            // より柔軟なマッピングのため、複数のバリエーションを追加
            const titleVariations = [
              normalizedTitle,
              normalizedTitle.toLowerCase(),
              normalizedTitle
                .replace(/\s+(no\s+)?(kami|mikoto|okami|gami)$/i, "")
                .trim(),
              normalizedTitle.split(" ")[0], // 最初の単語のみ
            ];

            titleVariations.forEach((variation) => {
              if (variation && variation !== normalizedTitle) {
                slugMap[variation] = god.slug;
              }
            });

            console.log(
              `マッピング: "${normalizedTitle}" -> "${god.slug}" (バリエーション: ${titleVariations.length}個)`
            );
          }
        });
      }

      console.log(
        `✅ スラグマッピング生成完了: ${
          Object.keys(slugMap).length
        }個のエントリ`
      );
      console.log("生成されたslugMap:", slugMap);
      return slugMap;
    }
    console.warn("⚠️ 神々データの取得に失敗しました");
    return {};
  } catch (error) {
    console.error("Failed to fetch gods data:", error);
    return {};
  }
}

// スケルトンローダー（元のまま）
function MythologyArticlesSkeleton() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold mb-16 mt-8 text-center bg-[#180614] py-2">
          Japanese mythological stories
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch md:px-16">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={`skeleton-${index}`} className="animate-pulse">
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

function GodsGallerySkeleton() {
  return (
    <div className="w-full">
      <div className="flex justify-center gap-4 mb-6">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={`tab-skeleton-${index}`}
            className="w-20 h-10 bg-gray-600 rounded-full animate-pulse"
          ></div>
        ))}
      </div>

      <div className="hidden lg:grid grid-cols-5 gap-6 justify-items-center">
        {Array.from({ length: 10 }).map((_, index) => (
          <div
            key={`god-skeleton-${index}`}
            className="flex flex-col items-center"
          >
            <div className="w-32 h-32 bg-gray-600 rounded-full animate-pulse mb-2"></div>
            <div className="w-20 h-4 bg-gray-600 rounded animate-pulse"></div>
          </div>
        ))}
      </div>

      <div className="lg:hidden overflow-x-auto px-4">
        <div className="inline-flex gap-8">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={`mobile-god-skeleton-${index}`}
              className="flex-shrink-0 text-center"
            >
              <div className="w-32 h-32 bg-gray-600 rounded-full animate-pulse mb-2"></div>
              <div className="w-20 h-4 bg-gray-600 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 記事セクション（元のまま）
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

// 神々ギャラリーのラッパーコンポーネント（修正版）
async function GodsGalleryWrapper({
  godsSlugMapPromise,
}: {
  godsSlugMapPromise: Promise<Record<string, string>>;
}) {
  try {
    const godsSlugMap = await godsSlugMapPromise;

    const optimizedGods = JAPANESE_GODS.filter(
      (god) => god.name && god.img && god.gender
    );

    return <GodsGallery gods={optimizedGods} slugMap={godsSlugMap} />;
  } catch (error) {
    console.error("Error loading gods gallery:", error);
    return (
      <div className="text-center text-white py-8">
        <p>神々のギャラリーを読み込めませんでした</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 bg-[#df7163] hover:bg-[#c85a4c] px-4 py-2 rounded transition-colors"
        >
          再試行
        </button>
      </div>
    );
  }
}

// メインページコンポーネント
export default async function MythologyPage({
  searchParams,
}: {
  searchParams?: { page?: string };
}) {
  const currentPage = Math.max(
    1,
    searchParams?.page ? parseInt(searchParams.page) : 1
  );
  const godsSlugMapPromise = getGodsSlugMap();

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Mythology", href: "/mythology", isCurrentPage: true },
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
      <ScrollHandler />
      {/* ヘッダー */}
      <section className="relative bg-slate-900 pt-16 pb-16">
        <div className="absolute inset-0 z-0 opacity-40">
          <Image
            src="/images/category-top/mythology.jpg"
            alt="Japanese Mythology"
            fill
            style={{ objectFit: "cover" }}
            priority={true}
            sizes="100vw"
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkbHB0eH/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/2gAMAwEAAhEDEQA/AKrAAAAAAAAAAAAAAAAA//2Q=="
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

      {/* 📱 Suspense による非同期読み込み最適化 */}
      <Suspense fallback={<MythologyArticlesSkeleton />}>
        <MythologyArticlesSection currentPage={currentPage} />
      </Suspense>

      <WhiteLine />

      {/* 🎯 神々ギャラリー - IDを明確に設定 */}
      <section className="py-16" id="about-japanese-gods">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold mb-12 text-center bg-[#180614] py-2">
            About Japanese Gods
          </h2>
          <Suspense fallback={<GodsGallerySkeleton />}>
            <GodsGalleryWrapper godsSlugMapPromise={godsSlugMapPromise} />
          </Suspense>
        </div>
      </section>

      <WhiteLine />
      <BackToHomeBtn/>
      {/* <RedBubble /> */}
    </div>
  );
}
