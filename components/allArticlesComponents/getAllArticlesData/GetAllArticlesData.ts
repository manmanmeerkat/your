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

export async function fetchAllArticlesData(args: {
  page: number;
  category: string;
  pageSize?: number;
}): Promise<AllArticlesData> {
  const { page, category, pageSize = 12 } = args;

  const baseUrl = IS_NON_PROD ? "http://localhost:3000" : "";

  // ✅ 方針統一：Dev/Previewはno-store、Prodはforce-cache（デプロイ反映）
  const baseFetchInit = FETCH_CACHE.pageData;

  try {
    const countsPromise = fetch(`${baseUrl}/api/article-counts`, {
      ...baseFetchInit,
      // tags は残してOK（将来 revalidateTag したいなら役立つ）
      ...(IS_NON_PROD ? {} : { next: { tags: ["article-counts"] } }),
    });

    const params = new URLSearchParams({
      published: "true",
      page: String(page),
      pageSize: String(pageSize),
    });
    if (category) params.append("category", category);

    const articlesPromise = fetch(`${baseUrl}/api/articles?${params.toString()}`, {
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