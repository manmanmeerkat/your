import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";
import type { Prisma } from "@prisma/client";
import type { TriviaCategoryType, TriviaColorThemeType } from "@/types/types";

export type ArticleDTO = {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  content: string;
  category: string;
  published: boolean;
  description: string | null;

  // ✅ Date → string
  createdAt: string;
  updatedAt: string;

  images: {
    id: string;
    url: string;
    altText: string | null;
    isFeatured: boolean;

    // ✅ Date → string
    createdAt: string;
    articleId: string;
  }[];

  trivia: {
    id: string;
    title: string;
    content: string;
    contentEn: string | null;
    category: TriviaCategoryType;
    tags: string[];
    iconEmoji: string | null;
    colorTheme: TriviaColorThemeType | null;
    displayOrder: number;
    isActive: boolean;

    // ✅ Date → string
    createdAt: string;
    updatedAt: string;
    articleId: string;
  }[];
};

// Prismaの返り値型（include内容を型で固定）
type ArticlePayload = Prisma.ArticleGetPayload<{
  include: {
    images: {
      select: {
        id: true;
        url: true;
        altText: true;
        isFeatured: true;
        createdAt: true;
        articleId: true;
      };
    };
    trivia: {
      where: { isActive: true };
      orderBy: { displayOrder: "asc" };
      select: {
        id: true;
        title: true;
        content: true;
        contentEn: true;
        category: true;
        tags: true;
        iconEmoji: true;
        colorTheme: true;
        displayOrder: true;
        isActive: true;
        createdAt: true;
        updatedAt: true;
      };
    };
  };
}>;

async function fetchArticleRaw(slug: string): Promise<ArticlePayload | null> {
  return prisma.article.findFirst({
    where: { slug, published: true },
    include: {
      images: {
        select: {
          id: true,
          url: true,
          altText: true,
          isFeatured: true,
          createdAt: true,
          articleId: true,
        },
      },
      trivia: {
        where: { isActive: true },
        orderBy: { displayOrder: "asc" },
        select: {
          id: true,
          title: true,
          content: true,
          contentEn: true,
          category: true,
          tags: true,
          iconEmoji: true,
          colorTheme: true,
          displayOrder: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  });
}

function toArticleDTO(article: ArticlePayload): ArticleDTO {
  return {
    id: article.id,
    title: article.title ?? "",
    slug: article.slug ?? "",
    summary: article.summary ?? null,
    content: article.content ?? "",
    category: article.category ?? "",
    published: Boolean(article.published),
    description: article.description ?? null,

    // ✅ Date → string
    createdAt: article.createdAt.toISOString(),
    updatedAt: article.updatedAt.toISOString(),

    images: (article.images ?? []).map((img) => ({
      id: img.id ?? "",
      url: img.url ?? "",
      altText: img.altText ?? null,
      isFeatured: Boolean(img.isFeatured),

      // ✅ Date → string
      createdAt: img.createdAt.toISOString(),
      articleId: img.articleId ?? "",
    })),

    trivia: (article.trivia ?? []).map((t) => ({
      id: t.id ?? "",
      title: t.title ?? "",
      content: t.content ?? "",
      contentEn: t.contentEn ?? null,
      category: (t.category ?? "default") as TriviaCategoryType,
      tags: Array.isArray(t.tags) ? t.tags : [],
      iconEmoji: t.iconEmoji ?? null,
      colorTheme: (t.colorTheme ?? null) as TriviaColorThemeType | null,
      displayOrder: Number(t.displayOrder) || 0,
      isActive: Boolean(t.isActive),

      // ✅ Date → string
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
      articleId: article.id,
    })),
  };
}

// ===== ビルド/同一プロセス内での “同時実行 dedupe” 用 =====
const globalForArticle = globalThis as unknown as {
  __articleBySlugPromise?: Map<string, Promise<ArticleDTO | null>>;
};

const inFlight =
  globalForArticle.__articleBySlugPromise ?? new Map<string, Promise<ArticleDTO | null>>();

if (!globalForArticle.__articleBySlugPromise) {
  globalForArticle.__articleBySlugPromise = inFlight;
}

// 本番：キャッシュ
const getArticleCached = unstable_cache(
  async (slug: string) => {
    const raw = await fetchArticleRaw(slug);
    return raw ? toArticleDTO(raw) : null;
  },
  ["article-by-slug"],
  { revalidate: 300, tags: ["article", "trivia"] }
);

// 開発：キャッシュなし（そのまま）
async function getArticleNoCache(slug: string) {
  const raw = await fetchArticleRaw(slug);
  return raw ? toArticleDTO(raw) : null;
}

async function getArticleDedupe(slug: string, fn: (s: string) => Promise<ArticleDTO | null>) {
  const key = decodeURIComponent(slug);

  const existing = inFlight.get(key);
  if (existing) return existing;

  const p = fn(key).finally(() => {
    inFlight.delete(key);
  });

  inFlight.set(key, p);
  return p;
}

export async function getArticleBySlug(slug: string) {
  // devは従来通り。ただしdedupeだけは効かせてもOK（ビルドにも有利）
  if (process.env.NODE_ENV === "development") {
    return getArticleDedupe(slug, getArticleNoCache);
  }
  return getArticleDedupe(slug, getArticleCached);
}
