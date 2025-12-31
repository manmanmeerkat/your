// components/cultureComponents/getCultureData/GetCultureData.ts
import { articleType } from "@/types/types";

const ARTICLES_PER_PAGE = 6;

export type PaginationInfo = {
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

type ArticlesApiResponse = {
  articles?: articleType[];
  pagination?: PaginationInfo;
};

export function getBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : "https://yourwebsite.com")
  );
}

/* 共通fetch */
export async function fetchJsonWithTimeout<T>(
  url: string,
  opts: RequestInit & { timeoutMs?: number } = {}
): Promise<T> {
  const { timeoutMs = 10000, ...fetchOpts } = opts;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, { ...fetchOpts, signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as T;
  } finally {
    clearTimeout(timeoutId);
  }
}

export function parsePage(page?: string) {
  const n = Number.parseInt(page ?? "1", 10);
  return Number.isFinite(n) && n >= 1 ? n : 1;
}

/* 記事取得 */
export async function getCultureArticles(page = 1) {
  const baseUrl = getBaseUrl();

  try {
    const data = await fetchJsonWithTimeout<ArticlesApiResponse>(
      `${baseUrl}/api/articles?category=culture&published=true&page=${page}&pageSize=${ARTICLES_PER_PAGE}`,
      {
        next: { revalidate: 1800, tags: ["culture-articles", `culture-page-${page}`] },
        headers: { Accept: "application/json" },
      }
    );

    return {
      articles: data.articles ?? [],
      pagination:
        data.pagination ?? {
          total: 0,
          page: 1,
          pageSize: ARTICLES_PER_PAGE,
          pageCount: 1,
        },
    };
  } catch (e) {
    console.error("Failed to fetch culture articles:", e);
    return {
      articles: [],
      pagination: { total: 0, page: 1, pageSize: ARTICLES_PER_PAGE, pageCount: 1 },
    };
  }
}

/* ★ 将来用：文化人物 slugMap */
export async function getCultureMastersSlugMap(): Promise<Record<string, string>> {
  const baseUrl = getBaseUrl();

  try {
    const items = await fetchJsonWithTimeout<
      Array<{ title: string; slug: string }>
    >(`${baseUrl}/api/category-items?category=japanese-culture-masters`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });

    const slugMap: Record<string, string> = {};
    for (const item of items ?? []) {
      if (!item?.title || !item?.slug) continue;

      const key = item.title.trim();
      slugMap[key] = item.slug;
      slugMap[key.toLowerCase()] = item.slug;
    }

    return slugMap;
  } catch (e) {
    console.error("Failed to fetch culture masters slugMap:", e);
    return {};
  }
}
