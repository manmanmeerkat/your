// lib/all-articles.ts
import type { articleType } from "@/types/types";
import { IS_NON_PROD, FETCH_CACHE } from "@/lib/cachePolicy/cachePolicy";

export type ArticleCounts = Record<string, number>;

export type Pagination = {
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

export type AllArticlesData = {
  articles: articleType[];
  pagination: Pagination;
  categoryCounts: ArticleCounts;
};

export function parsePage(value?: string, fallback = 1) {
  const n = Number.parseInt(value ?? "", 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export function normalizeCategory(value?: string) {
  return (value ?? "").trim();
}

// ✅ 追加：API origin を安全に解決
function getApiOrigin() {
  // ブラウザで動くなら相対でOK
  if (typeof window !== "undefined") return "";

  // 最優先：明示した本番URL
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (siteUrl) return siteUrl.replace(/\/$/, "");

  // Vercel が付与（Preview/Prod）
  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) return `https://${vercelUrl}`.replace(/\/$/, "");

  // ローカル
  return "http://localhost:3000";
}

export async function fetchAllArticlesData(args: {
  page: number;
  category: string;
  pageSize?: number;
}): Promise<AllArticlesData> {
  const { page, category, pageSize = 12 } = args;

  const origin = getApiOrigin(); // ✅ ここが必要
  const baseFetchInit = FETCH_CACHE.pageData;

  try {
    const countsPromise = fetch(`${origin}/api/article-counts`, {
      ...baseFetchInit,
      ...(IS_NON_PROD ? {} : { next: { tags: ["article-counts"] } }),
    });

    const params = new URLSearchParams({
      published: "true",
      page: String(page),
      pageSize: String(pageSize),
    });
    if (category) params.append("category", category);

    const articlesPromise = fetch(`${origin}/api/articles?${params.toString()}`, {
      ...baseFetchInit,
      ...(IS_NON_PROD
        ? {}
        : {
            next: {
              tags: [
                "articles",
                `articles-${category || "all"}`,
                `articles-page-${page}`,
              ],
            },
          }),
    });

    const [countsResponse, articlesResponse] = await Promise.all([
      countsPromise,
      articlesPromise,
    ]);

    const categoryCounts: ArticleCounts = countsResponse.ok
      ? ((await countsResponse.json())?.counts ?? {})
      : {};

    const fallbackPagination: Pagination = {
      total: 0,
      page,
      pageSize,
      pageCount: 1,
    };

    const { articles, pagination } = articlesResponse.ok
      ? await articlesResponse.json()
      : { articles: [], pagination: fallbackPagination };

    return {
      articles: (articles ?? []) as articleType[],
      pagination: (pagination ?? fallbackPagination) as Pagination,
      categoryCounts,
    };
  } catch {
    return {
      articles: [],
      pagination: { total: 0, page, pageSize, pageCount: 1 },
      categoryCounts: {},
    };
  }
}

export function totalCountFromCounts(counts: ArticleCounts) {
  return Object.values(counts).reduce((sum, n) => sum + (Number(n) || 0), 0);
}