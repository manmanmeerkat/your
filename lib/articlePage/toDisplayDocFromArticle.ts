import type { ArticleDTO } from "@/components/articlePageComponents/getArticleBySlug/getArticleBySlug";
import type { DisplayDoc } from "@/types/slugDisplay";

export function toDisplayDocFromArticle(article: ArticleDTO): DisplayDoc {
  return {
    id: article.id,
    title: article.title ?? "",
    content: article.content ?? "",
    category: article.category ?? "",
    updatedAt: article.updatedAt ?? new Date().toISOString(),
    images: (article.images ?? []).map((img) => ({
      url: img.url,
      alt: img.altText ?? article.title ?? "",
      isFeatured: Boolean(img.isFeatured),
    })),
    trivia: (article.trivia ?? []).map((t) => ({
      id: t.id,
      title: t.title,
      content: t.content,
      contentEn: t.contentEn ?? null,
      tags: Array.isArray(t.tags) ? t.tags : [],
      isActive: Boolean(t.isActive),
    })),
  };
}
