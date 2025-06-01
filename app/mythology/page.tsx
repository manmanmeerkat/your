// app/mythology/page.tsx
import Image from "next/image";
import ArticleCard from "../../components/articleCard/articleCard";
import { articleType } from "@/types/types";
import { JAPANESE_GODS } from "@/constants/constants";
import RedBubble from "@/components/redBubble/RedBubble";
import { WhiteLine } from "@/components/whiteLine/whiteLine";
import PaginationWrapper from "@/components/pagination-wrapper";
import GodsGallery from "@/components/gods/GodsGallery";

// ページごとの記事数
const ARTICLES_PER_PAGE = 6;

// 記事取得関数（キャッシュ最適化）
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

    // ⭐ キャッシュ戦略を最適化
    const res = await fetch(
      `${baseUrl}/api/articles?category=mythology&published=true&page=${page}&pageSize=${ARTICLES_PER_PAGE}`,
      {
        next: {
          revalidate: 3600, // 1時間キャッシュ
          tags: ["mythology-articles"], // タグベースの無効化
        },
      }
    );

    if (!res.ok)
      return {
        articles: [],
        pagination: {
          total: 0,
          page: 1,
          pageSize: ARTICLES_PER_PAGE,
          pageCount: 1,
        },
      };

    const data = await res.json();

    // ⭐ APIで既にフィルタされている前提（不要な再フィルタを削除）
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

// ⭐ 神々データ取得を別関数に分離（キャッシュ最適化）
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
          revalidate: 86400, // 24時間キャッシュ（神々データは頻繁に変わらない）
          tags: ["gods-data"],
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

export default async function MythologyPage({
  searchParams,
}: {
  searchParams?: { page?: string };
}) {
  // クエリパラメータからページ番号を取得
  const currentPage = searchParams?.page ? parseInt(searchParams.page) : 1;

  // ⭐ 並列実行でパフォーマンス向上
  const [{ articles = [], pagination }, godsSlugMap] = await Promise.all([
    getMythologyArticles(currentPage),
    getGodsSlugMap(),
  ]);

  // 総ページ数
  const totalPages = pagination.pageCount;

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
            priority={true} // ⭐ 最初に表示される画像は優先読み込み
            sizes="100vw" // ⭐ レスポンシブ対応
          />
        </div>
        <div className="container mx-auto px-6 py-36 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Japanese Mythology
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto text-left text-left">
            Japan&apos;s mythology weaves timeless tales of divine creation,
            heroic adventures, and sacred traditions. We will explore the
            enchanting world of Japanese mythology through stories of gods such
            as Amaterasu, Susanoo, and Izanagi, as recorded in the Kojiki and
            Nihon Shoki.
          </p>
        </div>
      </section>

      {/* 神話記事一覧 (ページネーション追加) */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold mb-16 mt-8 text-center bg-[#180614] py-2">
            Japanese mythological stories
          </h2>

          {articles.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch md:px-16">
                {articles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>

              {/* ページネーションコンポーネント */}
              {totalPages > 1 && (
                <div className="mt-8">
                  <PaginationWrapper
                    currentPage={currentPage}
                    totalPages={totalPages}
                    basePath="/mythology"
                  />
                </div>
              )}
            </>
          ) : (
            <p className="text-center">
              Mythology posts will be available soon.
            </p>
          )}
        </div>
      </section>

      <WhiteLine />

      {/* 神々ギャラリー */}
      <section className="py-16" id="about-japanese-gods">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold mb-12 text-center bg-[#180614] py-2">
            About Japanese Gods
          </h2>
          <GodsGallery gods={JAPANESE_GODS} slugMap={godsSlugMap} />
        </div>
      </section>

      <WhiteLine />

      <RedBubble />
    </div>
  );
}
