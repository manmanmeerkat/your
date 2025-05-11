import { Suspense } from "react";
import AllArticlesContent from "@/components/AllArticlesContent";
import ArticlesLoader from "@/components/loaders/ArticlesLoader";

// サーバーサイドでのデータ取得
async function fetchArticlesData(
  page: number,
  category: string,
  pageSize: number = 12
) {
  try {
    // 絶対URLを構築（開発環境と本番環境で動作するように）
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.NODE_ENV === "development" ? "http://localhost:3000" : "");

    // カテゴリー数の取得
    const countsPromise = fetch(`${baseUrl}/api/article-counts`, {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
    });

    // 記事データの取得
    const params = new URLSearchParams({
      published: "true",
      page: page.toString(),
      pageSize: pageSize.toString(),
    });

    if (category) params.append("category", category);

    const articlesPromise = fetch(`${baseUrl}/api/articles?${params}`, {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
    });

    // 並列に両方のデータを取得
    const [countsResponse, articlesResponse] = await Promise.all([
      countsPromise,
      articlesPromise,
    ]);

    if (!countsResponse.ok) {
      console.error(`Error fetching category counts: ${countsResponse.status}`);
      throw new Error("Failed to fetch category counts");
    }

    if (!articlesResponse.ok) {
      console.error(`Error fetching articles: ${articlesResponse.status}`);
      throw new Error("Failed to fetch articles");
    }

    const countsData = await countsResponse.json();
    const articlesData = await articlesResponse.json();

    const categoryCounts = countsData.counts || {};
    const totalCount = Object.values(categoryCounts).reduce(
      (sum: number, count) => sum + (count as number),
      0 as number
    );

    return {
      articles: articlesData.articles || [],
      pagination: articlesData.pagination || {
        total: 0,
        page,
        pageSize,
        pageCount: 1,
      },
      categoryCounts,
      totalCount,
    };
  } catch (error) {
    console.error("データ取得エラー:", error);
    return {
      articles: [],
      pagination: { total: 0, page, pageSize, pageCount: 1 },
      categoryCounts: {},
      totalCount: 0,
    };
  }
}

// メインのページコンポーネント
export default async function AllArticlesPage({
  searchParams,
}: {
  searchParams: { page?: string; category?: string };
}) {
  // URLパラメータを取得
  const page = searchParams.page ? parseInt(searchParams.page) : 1;
  const category = searchParams.category || "";
  const pageSize = 12;

  // サーバーサイドでデータを取得
  const { articles, pagination, categoryCounts, totalCount } =
    await fetchArticlesData(page, category, pageSize);

  return (
    <Suspense fallback={<ArticlesLoader fullPage />}>
      <AllArticlesContent
        initialArticles={articles}
        initialPagination={pagination}
        initialCategoryCounts={categoryCounts}
        initialTotalCount={totalCount}
        initialPage={page}
        initialCategory={category}
      />
    </Suspense>
  );
}

// 検索エンジン最適化のためのメタデータ
export const metadata = {
  title: "All Articles | Your Secret Japan",
  description:
    "Browse all articles about Japanese mythology, culture, festivals, and customs.",
};
