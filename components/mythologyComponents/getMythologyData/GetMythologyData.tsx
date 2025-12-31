// lib/mythology/data.ts
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

export async function getMythologyArticles(page = 1) {
  const baseUrl = getBaseUrl();

  try {
    const data = await fetchJsonWithTimeout<ArticlesApiResponse>(
      `${baseUrl}/api/articles?category=mythology&published=true&page=${page}&pageSize=${ARTICLES_PER_PAGE}`,
      {
        timeoutMs: 10000,
        next: { revalidate: 1800, tags: ["mythology-articles", `mythology-page-${page}`] },
        headers: { Accept: "application/json" },
      }
    );

    return {
      articles: Array.isArray(data.articles) ? data.articles : [],
      pagination: data.pagination ?? { total: 0, page: 1, pageSize: ARTICLES_PER_PAGE, pageCount: 1 },
      pageSize: ARTICLES_PER_PAGE,
    };
  } catch (e) {
    console.error("Failed to fetch mythology articles:", e);
    return {
      articles: [],
      pagination: { total: 0, page: 1, pageSize: ARTICLES_PER_PAGE, pageCount: 1 },
      pageSize: ARTICLES_PER_PAGE,
    };
  }
}

export async function getGodsSlugMap(): Promise<Record<string, string>> {
  const baseUrl = getBaseUrl();

  try {
    const gods = await fetchJsonWithTimeout<Array<{ title: string; slug: string }>>(
      `${baseUrl}/api/category-items?category=about-japanese-gods`,
      {
        timeoutMs: 8000,
        cache: "no-store",
        headers: { Accept: "application/json" },
      }
    );

    const slugMap: Record<string, string> = {};
    for (const god of gods ?? []) {
      if (!god?.title || !god?.slug) continue;

      const normalized = god.title.trim();
      const variations = new Set<string>([
        normalized,
        normalized.toLowerCase(),
        normalized.replace(/\s+(no\s+)?(kami|mikoto|okami|gami)$/i, "").trim(),
        normalized.split(" ")[0],
      ]);

      for (const key of variations) {
        if (key) slugMap[key] = god.slug;
      }
    }
    return slugMap;
  } catch (e) {
    console.error("Failed to fetch gods data:", e);
    return {};
  }
}
