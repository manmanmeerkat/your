import type { articleType } from "@/types/types";
import { prisma } from "@/lib/prisma";

export const DEFAULT_ARTICLES_PER_PAGE = 6;

export type PaginationInfo = {
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

export type CategoryKey = "mythology" | "culture" | "festivals" | "customs";

export function parsePage(page?: string) {
  const n = Number.parseInt(page ?? "1", 10);
  return Number.isFinite(n) && n >= 1 ? n : 1;
}

/**
 * ✅ 全カテゴリ共通の記事取得（Prisma直読み）
 * 本番でも落ちにくい / ISR write を増やしにくい
 */
export async function getCategoryArticles(
  category: CategoryKey,
  page = 1,
  opts?: {
    pageSize?: number;
    published?: boolean;
  }
): Promise<{ articles: articleType[]; pagination: PaginationInfo; pageSize: number }> {
  const pageSize = opts?.pageSize ?? DEFAULT_ARTICLES_PER_PAGE;
  const published = opts?.published ?? true;

  const skip = (page - 1) * pageSize;

  // Prisma の where は型を合わせておくと安心
  const where = {
    category,
    published,
  } as const;

  const [items, total] = await Promise.all([
    prisma.article.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
      include: {
        images: {
          orderBy: [{ isFeatured: "desc" }, { createdAt: "asc" }],
        },
      },
    }),
    prisma.article.count({ where }),
  ]);

  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  return {
    articles: items as unknown as articleType[],
    pagination: { total, page, pageSize, pageCount },
    pageSize,
  };
}