import type { articleType } from "@/types/types";
import { IS_NON_PROD } from "@/lib/cachePolicy/cachePolicy";


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

export function getApiOrigin() {
  // ブラウザなら同一オリジン相対でOK
  if (typeof window !== "undefined") return "";

  // 本番・プレビュー：Vercel が入れてくれるホスト名
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;

  // 予備：明示設定
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;

  // ローカル
  return "http://localhost:3000";
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
    headers?: Record<string, string>;
  }
) {
  const pageSize = opts?.pageSize ?? DEFAULT_ARTICLES_PER_PAGE;
  const published = opts?.published ?? true;
  const timeoutMs = opts?.timeoutMs ?? 10000;

  const origin = getApiOrigin();
  const url =
    `${origin}/api/articles?category=${category}&published=${published}&page=${page}&pageSize=${pageSize}`;

  try {
    const data = await fetchJsonWithTimeout<ArticlesApiResponse>(url, {
      timeoutMs,
      cache: IS_NON_PROD ? "no-store" : "force-cache",
      headers: {
        Accept: "application/json",
        ...(opts?.headers ?? {}),
      },
    });

    return {
      articles: Array.isArray(data.articles) ? data.articles : [],
      pagination:
        data.pagination ?? { total: 0, page: 1, pageSize, pageCount: 1 },
      pageSize,
    };
  } catch (e) {
    console.error(`Failed to fetch ${category} articles:`, e);

    // 本番は握りつぶさずに気づけるようにする（焼き付き防止）
    if (!IS_NON_PROD) throw e;

    return {
      articles: [],
      pagination: { total: 0, page: 1, pageSize, pageCount: 1 },
      pageSize,
    };
  }
}
