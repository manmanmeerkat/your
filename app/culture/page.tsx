// app/culture/page.tsx
import Image from "next/image";
import { articleType } from "@/types/types";
import ArticleCard from "../../components/articleCard/articleCard";
import { CULTURE_CATEGORIES } from "@/constants/constants";
import RedBubble from "@/components/redBubble/RedBubble";
import { WhiteLine } from "@/components/whiteLine/whiteLine";
import PaginationWrapper from "@/components/pagination-wrapper";

// ページごとの記事数
const ARTICLES_PER_PAGE = 6;

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
          revalidate: 3600, // 1時間キャッシュ
          tags: ["culture-articles"],
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

export default async function CulturePage({
  searchParams,
}: {
  searchParams?: { page?: string };
}) {
  // クエリパラメータからページ番号を取得
  const currentPage = searchParams?.page ? parseInt(searchParams.page) : 1;

  // 記事データを取得
  const { articles = [], pagination } = await getCultureArticles(currentPage);

  // 総ページ数
  const totalPages = pagination.pageCount;

  return (
    <div>
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
          <p className="text-lg md:text-xl max-w-2xl mx-auto text-left text-left">
            Japan has cultivated a rich cultural heritage for over a thousand
            years, blending refined traditions, craftsmanship, and everyday
            practices. We will explore the depth and beauty of Japanese culture
            through arts such as the tea ceremony, ceramics, kimono, and
            ukiyo-e.
          </p>
        </div>
      </section>

      {/* 文化記事一覧 (ページネーション追加) */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold mb-16 text-center bg-[#180614] py-2">
            The charm of Japanese culture
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
                    basePath="/culture"
                  />
                </div>
              )}
            </>
          ) : (
            <p className="text-center text-white">
              Culture posts will be available soon.
            </p>
          )}
        </div>
      </section>

      <WhiteLine />

      {/* 文化カテゴリー */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold mb-16 text-center bg-[#180614] py-2">
            Japanese Culture Category
          </h2>
          <div
            className="
              grid 
              gap-6 
              grid-cols-[repeat(auto-fit,minmax(8rem,1fr))]
              justify-items-center
            "
          >
            {CULTURE_CATEGORIES.map((category, index) => (
              <div key={index} className="text-center">
                <div className="w-32 h-32 bg-indigo-100 rounded-full relative overflow-hidden mx-auto">
                  <Image
                    src={category.img}
                    alt={category.name}
                    fill
                    style={{ objectFit: "cover" }}
                    sizes="(max-width: 768px) 8rem, 8rem"
                  />
                </div>
                <p className="mt-2 font-medium text-white">{category.name}</p>
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
