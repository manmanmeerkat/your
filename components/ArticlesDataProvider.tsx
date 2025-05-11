// サーバーコンポーネント
import { articleType } from "@/types/types";
import { ReactNode } from "react";

export type ArticlesPaginationType = {
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

export type CategoryCountsType = Record<string, number>;

type ArticlesDataProviderProps = {
  page: number;
  pageSize: number;
  category: string;
  children: (data: {
    articles: articleType[];
    pagination: ArticlesPaginationType;
    categoryCounts: CategoryCountsType;
    totalCount: number;
  }) => ReactNode;
};

// 記事データ取得用サーバーコンポーネント
// このコンポーネントは明示的にasync functionとしてマークしない
export default function ArticlesDataProvider({
  page,
  pageSize,
  category,
  children,
}: ArticlesDataProviderProps) {
  // データ取得を行うヘルパー関数
  async function fetchData() {
    // カテゴリー数の取得
    const countsPromise = fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL || ""}/api/article-counts`,
      {
        cache: "no-store",
      }
    );

    // 記事データの取得
    const params = new URLSearchParams({
      published: "true",
      page: page.toString(),
      pageSize: pageSize.toString(),
    });

    if (category) params.append("category", category);

    const articlesPromise = fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL || ""}/api/articles?${params}`,
      {
        cache: "no-store",
      }
    );

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
  }

  // use関数を使用して非同期データを同期的に解決
  // Next.js 13.4以降のサーバーコンポーネントで使用できる
  const data = use(fetchData());

  // 子コンポーネントにデータを渡す
  return children(data);
}

// Next.jsのサーバーコンポーネントでPromiseを同期的に解決するためのuse関数
// 実際の実装はNext.jsフレームワークによって提供される
function use<T>(promise: Promise<T>): T {
  if (promise.status === "fulfilled") {
    if (promise.value === undefined) {
      throw new Error("Promise value is undefined");
    }
    return promise.value;
  } else if (promise.status === "rejected") {
    throw promise.reason;
  } else {
    throw promise;
  }
}

// Promiseのタイプ拡張
declare global {
  interface Promise<T> {
    status?: "pending" | "fulfilled" | "rejected";
    value?: T;
    reason?: Error;
  }
}
