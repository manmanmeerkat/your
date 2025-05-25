// app/all-articles/page.tsx
import { Suspense } from "react";
import AllArticlesContent from "./AllArticlesContent";
import ArticlesLoader from "@/components/loaders/ArticlesLoader";

// ISR設定 - 30分ごとに再生成
export const revalidate = 1800;

// 動的レンダリングを避けるため、一般的なパラメータを事前生成
export async function generateStaticParams() {
  return [
    {},
    { page: "1" },
    { category: "mythology" },
    { category: "festivals" },
    { category: "customs" },
    { category: "culture" },
  ];
}

// 最適化されたデータ取得関数
async function fetchArticlesData(
  page: number,
  category: string,
  pageSize: number = 12
) {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.NODE_ENV === "development" ? "http://localhost:3000" : "");

  try {
    // キャッシュ戦略を改善
    const cacheOption =
      process.env.NODE_ENV === "development" ? "no-store" : "force-cache";
    const revalidateTime = process.env.NODE_ENV === "development" ? 0 : 1800; // 30分

    // カテゴリー数を取得（長期キャッシュ）
    const countsPromise = fetch(`${baseUrl}/api/article-counts`, {
      cache: cacheOption,
      next: {
        revalidate: 3600, // 1時間キャッシュ
        tags: ["article-counts"],
      },
    });

    // 記事データを取得
    const params = new URLSearchParams({
      published: "true",
      page: page.toString(),
      pageSize: pageSize.toString(),
    });
    if (category) params.append("category", category);

    const articlesPromise = fetch(`${baseUrl}/api/articles?${params}`, {
      cache: cacheOption,
      next: {
        revalidate: revalidateTime,
        tags: ["articles", `articles-${category}`, `articles-page-${page}`],
      },
    });

    // 並列実行
    const [countsResponse, articlesResponse] = await Promise.all([
      countsPromise,
      articlesPromise,
    ]);

    // エラーハンドリング - 部分的な成功でも対応
    let categoryCounts = {};

    if (countsResponse.ok) {
      const countsData = await countsResponse.json();
      categoryCounts = countsData.counts || {};
    } else {
      console.warn(`Category counts fetch failed: ${countsResponse.status}`);
    }

    let articles = [];
    let pagination = { total: 0, page, pageSize, pageCount: 1 };

    if (articlesResponse.ok) {
      const articlesData = await articlesResponse.json();
      articles = articlesData.articles || [];
      pagination = articlesData.pagination || pagination;
    } else {
      console.warn(`Articles fetch failed: ${articlesResponse.status}`);
    }

    return {
      articles,
      pagination,
      categoryCounts,
    };
  } catch (error) {
    console.error("データ取得エラー:", error);

    // フォールバックデータ
    return {
      articles: [],
      pagination: { total: 0, page, pageSize, pageCount: 1 },
      categoryCounts: {},
    };
  }
}

// メインのページコンポーネント
export default async function AllArticlesPage({
  searchParams,
}: {
  searchParams?: { page?: string; category?: string };
}) {
  const page = searchParams?.page ? parseInt(searchParams.page) : 1;
  const category = searchParams?.category || "";
  const pageSize = 12;

  // サーバーサイドでデータを取得
  const { articles, pagination, categoryCounts } = await fetchArticlesData(
    page,
    category,
    pageSize
  );

  return (
    <div className="min-h-screen">
      <Suspense fallback={<ArticlesLoader fullPage />}>
        <AllArticlesContent
          initialArticles={articles}
          initialPagination={pagination}
          initialCategoryCounts={categoryCounts}
          initialTotalCount={pagination.total}
          initialPage={page}
          initialCategory={category}
        />
      </Suspense>
    </div>
  );
}

// 動的メタデータ生成
export async function generateMetadata({
  searchParams,
}: {
  searchParams?: { page?: string; category?: string };
}) {
  const category = searchParams?.category;
  const page = searchParams?.page;

  let title = "All Articles | Your Secret Japan";
  let description =
    "Browse all articles about Japanese mythology, culture, festivals, and customs.";

  if (category) {
    const categoryNames: { [key: string]: string } = {
      mythology: "Japanese Mythology",
      festivals: "Japanese Festivals",
      customs: "Japanese Customs",
      culture: "Japanese Culture",
    };
    const categoryName = categoryNames[category] || category;
    title = `${categoryName} Articles | Your Secret Japan`;
    description = `Explore ${categoryName.toLowerCase()} articles and discover the rich heritage of Japan.`;
  }

  if (page && parseInt(page) > 1) {
    title += ` - Page ${page}`;
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}
