import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { articleType } from "@/types/types";
import { CATEGORY_ITEMS } from "@/constants/constants";
import HeroSection from "@/components/top/heroSection/HeroSection";
import CategoriesSection from "@/components/top/categoriesSection/CategoriesSection";
import LatestArticlesSection from "@/components/top/latestArticlesSection/LatestArticlesSection";
import { WhiteLine } from "@/components/whiteLine/whiteLine";
import Redbubble from "@/components/redBubble/RedBubble";
import { SimpleContact } from "@/components/getInTouch/simpleContact/SimpleContact";

// 🚀 超最適化されたデータベースクエリ（N+1問題解決版）
async function getLatestArticles(): Promise<articleType[]> {
  try {
    console.log("🚀 超最適化クエリ実行中...");
    const startTime = performance.now();

    // 🎯 最適化ポイント1: 記事IDを先に取得してから画像を取得
    // 🎯 最適化ポイント2: 作成されたインデックスを最大活用

    // まず記事を取得
    const articles = await prisma.article.findMany({
      where: {
        published: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 6,
      select: {
        id: true,
        slug: true,
        title: true,
        category: true,
        summary: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // 取得した記事のIDリスト
    const articleIds = articles.map((article) => article.id);

    // 該当記事の画像のみを取得
    const featuredImages = await prisma.image.findMany({
      where: {
        articleId: {
          in: articleIds, // 取得した記事のIDのみ
        },
        isFeatured: true,
      },
      select: {
        articleId: true,
        url: true,
        altText: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const endTime = performance.now();
    console.log(`📊 超最適化クエリ実行時間: ${endTime - startTime}ms`);
    console.log(`📊 取得記事数: ${articles.length}`);
    console.log(`📊 取得画像数: ${featuredImages.length}`);

    // 🚀 画像マップ作成（O(1)ルックアップ）
    const imageMap = new Map(featuredImages.map((img) => [img.articleId, img]));

    // 🚀 高速な型変換
    const transformedArticles = articles.map((article) => {
      const featuredImage = imageMap.get(article.id);

      return {
        id: article.id,
        slug: article.slug,
        title: article.title,
        category: article.category as
          | "mythology"
          | "culture"
          | "festivals"
          | "customs",
        content: "", // ホームページでは不使用
        summary: article.summary ?? undefined,
        createdAt: article.createdAt,
        updatedAt: article.updatedAt,
        images: featuredImage
          ? [
              {
                url: featuredImage.url,
                altText: featuredImage.altText ?? undefined,
              },
            ]
          : [],
      };
    });

    console.log(`✅ 変換完了: ${transformedArticles.length}記事`);
    return transformedArticles;
  } catch (error) {
    console.error("❌ 記事取得エラー:", error);
    return [];
  }
}

// 🚀 高速ローディングフォールバック（スケルトン）
function ArticlesLoadingFallback() {
  return (
    <div className="container mx-auto px-4 text-center">
      <h2 className="text-3xl font-bold mb-8 text-[#f3f3f2]">
        Latest Articles
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-[#1a1a1a] rounded-lg overflow-hidden animate-pulse"
            style={{
              contain: "layout style paint",
            }}
          >
            <div className="h-48 bg-gray-700" />
            <div className="p-6">
              <div className="h-4 bg-gray-700 rounded mb-2" />
              <div className="h-4 bg-gray-700 rounded w-3/4 mb-4" />
              <div className="h-3 bg-gray-700 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 🚀 遅延読み込み対応の記事セクション
async function LatestArticlesAsync() {
  const articles = await getLatestArticles();

  return (
    <div
      className="container mx-auto px-4 text-center"
      style={{
        contain: "layout style",
      }}
    >
      <LatestArticlesSection articles={articles} />
    </div>
  );
}

// 🚀 軽量化されたSuspenseコンポーネント
function LightweightSuspense({
  children,
  fallback,
  className = "",
}: {
  children: React.ReactNode;
  fallback: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className} style={{ contain: "layout style" }}>
      <Suspense fallback={fallback}>{children}</Suspense>
    </div>
  );
}

// 🚀 静的メタデータ（関数ではなく定数で高速化）
export const metadata = {
  title: "Your Secret Japan - Explore Japan's Hidden Charms",
  description:
    "Discover the mystical world of Japanese mythology, vibrant festivals, rich culture, and timeless traditions. Your gateway to Japan's authentic spirit.",
  keywords: [
    "Japan",
    "Japanese culture",
    "mythology",
    "festivals",
    "traditions",
    "travel",
    "hidden gems",
  ],
  openGraph: {
    title: "Your Secret Japan - Explore Japan's Hidden Charms",
    description:
      "Discover the mystical world of Japanese mythology, vibrant festivals, rich culture, and timeless traditions.",
    images: ["/ogp-image.png"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Your Secret Japan - Explore Japan's Hidden Charms",
    description:
      "Discover the mystical world of Japanese mythology, vibrant festivals, rich culture, and timeless traditions.",
    images: ["/ogp-image.png"],
  },
  // 🚀 構造化データ
  other: {
    "application/ld+json": JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Your Secret Japan",
      description:
        "Explore Japan's hidden charms through mythology, festivals, culture, and traditions",
      url: "https://your-secret-japan.com",
      potentialAction: {
        "@type": "SearchAction",
        target: "https://your-secret-japan.com/search?q={search_term_string}",
        "query-input": "required name=search_term_string",
      },
    }),
  },
};

// 🚀 Server Component（超最適化版）
export default async function HomePage() {
  return (
    <div
      className="scroll-smooth mb-24"
      style={{
        contain: "layout style",
        willChange: "contents",
        transform: "translateZ(0)", // GPU層強制
      }}
    >
      {/* 🚀 Hero セクション - 最優先表示（即座レンダリング） */}
      <HeroSection />

      {/* 🚀 カテゴリーセクション - Above the fold（即座レンダリング） */}
      <CategoriesSection categories={CATEGORY_ITEMS} />

      <WhiteLine />

      {/* 🚀 最新記事セクション - 超高速Suspense */}
      <section
        id="latest-articles"
        className="py-16 md:px-16"
        style={{
          contain: "layout style",
          willChange: "contents",
        }}
      >
        <LightweightSuspense
          fallback={<ArticlesLoadingFallback />}
          className="min-h-[400px]"
        >
          <LatestArticlesAsync />
        </LightweightSuspense>
      </section>

      <WhiteLine />

      {/* 🚀 Below the fold コンテンツ - 軽量遅延読み込み */}
      <LightweightSuspense
        fallback={
          <div
            className="h-48 bg-[#1a1a1a] animate-pulse rounded-lg mx-4"
            style={{ contain: "layout style paint" }}
          />
        }
      >
        <Redbubble />
      </LightweightSuspense>

      <WhiteLine />

      {/* 🚀 お問い合わせ - 最後に読み込み */}
      <LightweightSuspense
        fallback={
          <div
            className="h-32 bg-[#1a1a1a] animate-pulse rounded-lg mx-4"
            style={{ contain: "layout style paint" }}
          />
        }
      >
        <SimpleContact />
      </LightweightSuspense>
    </div>
  );
}

// 🚀 ISR設定の最適化
export const revalidate = 300; // 5分間キャッシュ

// 🚀 静的生成の最適化
export const dynamic = "force-static"; // 可能な限り静的生成

// 🚀 ランタイム最適化
export const runtime = "nodejs"; // Node.js ランタイム使用

// 🚀 プリフェッチ設定
export const fetchCache = "auto"; // 自動キャッシュ最適化
