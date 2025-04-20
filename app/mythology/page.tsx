// app/mythology/page.tsx
import Image from "next/image";
import ArticleCard from "../../components/articleCard/articleCard";
import { articleType } from "@/types/types";
import { JAPANESE_GODS } from "@/constants/constants";
import RedBubble from "@/components/redBubble/RedBubble";
import { WhiteLine } from "@/components/whiteLine/whiteLine";
import PaginationWrapper from "@/components/pagination-wrapper";
// ページごとの記事数
const ARTICLES_PER_PAGE = 6;

// 記事取得関数を修正
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

    // ページネーションパラメータを追加
    const res = await fetch(
      `${baseUrl}/api/articles?category=mythology&published=true&page=${page}&pageSize=${ARTICLES_PER_PAGE}`,
      {
        cache: "no-cache",
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
    return {
      articles: Array.isArray(data.articles)
        ? data.articles.filter((a: articleType) => a.category === "mythology")
        : [],
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

export default async function MythologyPage({
  searchParams,
}: {
  searchParams?: { page?: string };
}) {
  // クエリパラメータからページ番号を取得
  const currentPage = searchParams?.page ? parseInt(searchParams.page) : 1;

  // 記事データを取得
  const { articles = [], pagination } = await getMythologyArticles(currentPage);

  // 総ページ数
  const totalPages = pagination.pageCount;

  return (
    <div>
      {/* ヘッダー (変更なし) */}
      <section className="relative bg-slate-900 text-white">
        <div className="absolute inset-0 z-0 opacity-40">
          <Image
            src="/images/category-top/mythology.jpg"
            alt="Japanese Mythology"
            fill
            style={{ objectFit: "cover" }}
          />
        </div>
        <div className="container mx-auto px-6 py-36 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Japanese Mythology
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto text-left text-justify">
            Japan's mythology weaves timeless tales of divine creation, heroic
            adventures, and sacred traditions. We will explore the enchanting
            world of Japanese mythology through stories of gods such as
            Amaterasu, Susanoo, and Izanagi, as recorded in the Kojiki and Nihon
            Shoki.
          </p>
        </div>
      </section>

      {/* 神話記事一覧 (ページネーション追加) */}
      <section className="py-16 bg-slate-950">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold mb-12 text-center text-white">
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
            <p className="text-center text-white">
              Mythology posts will be available soon.
            </p>
          )}
        </div>
      </section>

      <WhiteLine />

      {/* その他のセクションは変更なし */}
      {/* 神々ギャラリー */}
      <section className="py-16 bg-slate-950">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold mb-12 text-center text-white">
            About Japanese Gods
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 text-center">
            {JAPANESE_GODS.map((god, index) => (
              <div key={index}>
                <div className="w-32 h-32 mx-auto bg-slate-200 rounded-full relative overflow-hidden">
                  <Image
                    src={god.img}
                    alt={god.name}
                    fill
                    style={{ objectFit: "cover" }}
                  />
                </div>
                <p className="mt-2 font-medium text-sm sm:text-base text-white">
                  {god.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <WhiteLine />

      <RedBubble />

      <WhiteLine />
    </div>
  );
}
