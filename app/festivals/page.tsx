// app/festivals/page.tsx
import Image from "next/image";
import { SEASONAL_FESTIVALS } from "@/constants/constants";
import ArticleCard from "../../components/articleCard/articleCard";
import { articleType } from "@/types/types";
import { THREE_BIG_FESTIVALS } from "@/constants/constants";
import { WhiteLine } from "@/components/whiteLine/whiteLine";
import RedBubble from "@/components/redBubble/RedBubble";
import PaginationWrapper from "@/components/pagination-wrapper";

// ページごとの記事数
const ARTICLES_PER_PAGE = 6;

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
          revalidate: 3600, // 1時間キャッシュ
          tags: ["festivals-articles"],
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

export default async function FestivalsPage({
  searchParams,
}: {
  searchParams?: { page?: string };
}) {
  // クエリパラメータからページ番号を取得
  const currentPage = searchParams?.page ? parseInt(searchParams.page) : 1;

  // 記事データを取得
  const { articles = [], pagination } = await getFestivalArticles(currentPage);

  // 総ページ数
  const totalPages = pagination.pageCount;

  return (
    <div>
      {/* ヘッダー */}
      <section className="relative bg-slate-900 pt-16 pb-16">
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
        <div className="container mx-auto px-6 py-24 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Japanese Festivals
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto text-left text-left">
            Japan&apos;s festivals reflect the beauty of the changing seasons
            and the spirit of each region. We will explore the vibrant world of
            Japanese festivals through traditional celebrations, local customs,
            and cultural events.
          </p>
        </div>
      </section>

      {/* 記事一覧 */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold mb-16 mt-8 text-center bg-[#180614] py-2">
            Festivals around Japan
          </h2>

          {articles.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:px-16">
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
                    basePath="/festivals"
                  />
                </div>
              )}
            </>
          ) : (
            <p className="text-center text-white">
              Festivals posts will be available soon.
            </p>
          )}
        </div>
      </section>

      <WhiteLine />

      {/* 四季の祭り */}
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
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 text-[#180614]">{festival.title}</h3>
                  <p className="text-[#180614] mb-4">{festival.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <WhiteLine />

      <RedBubble />
    </div>
  );
}
