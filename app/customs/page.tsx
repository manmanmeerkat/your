// app/customs/page.tsx
import Image from "next/image";
import { articleType } from "@/types/types";
import ArticleCard from "@/components/articleCard/articleCard";
import { WhiteLine } from "@/components/whiteLine/whiteLine";
import { WAY_OF_LIFE } from "@/constants/constants";
import Redbubble from "@/components/redBubble/RedBubble";
import PaginationWrapper from "@/components/pagination-wrapper";

// ページごとの記事数
const ARTICLES_PER_PAGE = 6;

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
          revalidate: 3600, // 1時間キャッシュ
          tags: ["customs-articles"],
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

export default async function CustomsPage({
  searchParams,
}: {
  searchParams?: { page?: string };
}) {
  // クエリパラメータからページ番号を取得
  const currentPage = searchParams?.page ? parseInt(searchParams.page) : 1;

  // 記事データを取得
  const { articles = [], pagination } = await getCustomsArticles(currentPage);

  // 総ページ数
  const totalPages = pagination.pageCount;

  return (
    <div>
      {/* ヘッダー */}
      <section className="relative bg-slate-950 pt-16 pb-16">
        <div className="absolute inset-0 z-0 opacity-30">
          <Image
            src="/images/category-top/custom.jpg"
            alt="Japanese Customs"
            fill
            style={{ objectFit: "cover" }}
            priority={true}
            sizes="100vw"
          />
        </div>
        <div className="container mx-auto px-6 py-24 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Japanese Customs
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto text-left">
            Japanese customs offer a glimpse into the country&apos;s unique
            sense of harmony, respect, and seasonal awareness. We will explore
            everyday traditions such as bowing, removing shoes, and celebrating
            seasonal events that reflect the values and rhythms of Japanese
            life.
          </p>
        </div>
      </section>

      {/* 記事一覧 */}
      <section className="py-16 md:px-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold mb-16 text-center bg-[#180614] py-2">
            Discover Japanese customs
          </h2>

          {articles.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {articles.map((article: articleType) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>

              {/* ページネーションコンポーネント */}
              {totalPages > 1 && (
                <div className="mt-8">
                  <PaginationWrapper
                    currentPage={currentPage}
                    totalPages={totalPages}
                    basePath="/customs"
                  />
                </div>
              )}
            </>
          ) : (
            <p className="text-center">
              Customs posts will be available soon.
            </p>
          )}
        </div>
      </section>

      <WhiteLine />

      {/* サブカテゴリ */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold mb-16 text-center bg-[#180614] py-2">
            Japanese Way of Life
          </h2>
          <div
            className="
              grid 
              gap-6 
              grid-cols-[repeat(auto-fit,minmax(8rem,1fr))]
              justify-items-center
            "
          >
            {WAY_OF_LIFE.map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-32 h-32 mx-auto bg-amber-100 rounded-full relative overflow-hidden">
                  <Image
                    src={item.img}
                    alt={item.label}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 8rem, 8rem"
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
