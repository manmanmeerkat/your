import type { articleType } from "@/types/types";

export const DEFAULT_ARTICLES_PER_PAGE = 6;

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

export type CategoryKey = "mythology" | "culture" | "festivals" | "customs";

export function getBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : "https://yourwebsite.com")
  );
}

export async function fetchJsonWithTimeout<T>(
  url: string,
  opts: RequestInit & { timeoutMs?: number } = {}
): Promise<T> {
  const { timeoutMs = 10000, ...fetchOpts } = opts;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, { ...fetchOpts, signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
    return (await res.json()) as T;
  } finally {
    clearTimeout(timeoutId);
  }
}

export function parsePage(page?: string) {
  const n = Number.parseInt(page ?? "1", 10);
  return Number.isFinite(n) && n >= 1 ? n : 1;
}

/**
 * 全カテゴリ共通の記事取得関数
 */
export async function getCategoryArticles(
  category: CategoryKey,
  page = 1,
  opts?: {
    pageSize?: number;
    published?: boolean;
    timeoutMs?: number;
    revalidateSec?: number;
    /**
     * 追加で fetch headers を付けたい場合（任意）
     */
    headers?: Record<string, string>;
  }
) {
  const baseUrl = getBaseUrl();

  const pageSize = opts?.pageSize ?? DEFAULT_ARTICLES_PER_PAGE;
  const published = opts?.published ?? true;
  const timeoutMs = opts?.timeoutMs ?? 10000;
  const revalidateSec = opts?.revalidateSec ?? 1800;

  try {
    const data = await fetchJsonWithTimeout<ArticlesApiResponse>(
      `${baseUrl}/api/articles?category=${category}&published=${published}&page=${page}&pageSize=${pageSize}`,
      {
        timeoutMs,
        next: {
          revalidate: revalidateSec,
          tags: [`${category}-articles`, `${category}-page-${page}`],
        },
        headers: {
          Accept: "application/json",
          ...(opts?.headers ?? {}),
        },
      }
    );

    return {
      articles: Array.isArray(data.articles) ? data.articles : [],
      pagination:
        data.pagination ?? {
          total: 0,
          page: 1,
          pageSize,
          pageCount: 1,
        },
      pageSize,
    };
  } catch (e) {
    console.error(`Failed to fetch ${category} articles:`, e);
    return {
      articles: [],
      pagination: { total: 0, page: 1, pageSize, pageCount: 1 },
      pageSize,
    };
  }
}
