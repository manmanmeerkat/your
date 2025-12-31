import type { DisplayDoc } from "@/types/slugDisplay"; 

type CategoryItemClientInput = {
  id: string;
  title: string;
  content: string;
  category: string;
  updatedAt: string;
  images?: { url: string; altText?: string; isFeatured: boolean }[];
  trivia?: {
    id: string;
    title: string;
    content: string;
    contentEn?: string | null;
    tags: string[];
    isActive: boolean;
  }[];
};

export function toDisplayDocFromCategoryItem(item: CategoryItemClientInput): DisplayDoc {
  return {
    id: item.id,
    title: item.title ?? "",
    content: item.content ?? "",
    category: item.category ?? "",
    updatedAt: item.updatedAt ?? new Date().toISOString(),
    images: (item.images ?? []).map((img) => ({
      url: img.url,
      alt: img.altText ?? item.title ?? "",
      isFeatured: Boolean(img.isFeatured),
    })),
    trivia: (item.trivia ?? []).map((t) => ({
      id: t.id,
      title: t.title ?? "",
      content: t.content ?? "",
      contentEn: t.contentEn ?? null,
      tags: Array.isArray(t.tags) ? t.tags : [],
      isActive: Boolean(t.isActive),
    })),
  };
}
