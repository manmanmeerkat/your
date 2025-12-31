"use client";

import ArticleDetailLayout from "@/components/articlePageComponents/articleDetailLayout/ArticleDetaiLayout";
import RelatedArticles from "../../sidebar/RelatedArticles";
import { toDisplayDocFromCategoryItem } from "@/lib/articlePage/toDisplayDocFromCategoryItem";

type CategoryItemImage = {
  id: string;
  url: string;
  altText?: string;
  isFeatured: boolean;
  createdAt: string;
  categoryItemId: string;
};

type CategoryItemTrivia = {
  id: string;
  title: string;
  content: string;
  contentEn?: string | null;
  category: string;
  tags: string[];
  iconEmoji?: string | null;
  colorTheme?: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  categoryItemId: string;
};

export type CategoryItemDTO = {
  id: string;
  title: string;
  slug: string;
  content: string;
  category: string;
  published: boolean;
  description?: string;
  createdAt: string;
  updatedAt: string;
  images?: CategoryItemImage[];
  trivia?: CategoryItemTrivia[];
};

type RelatedItem = {
  id: string;
  slug: string;
  title: string;
  href: string;
  imageUrl: string | null;
  imageAlt: string | null;
};

type Props = {
  item: CategoryItemDTO;
  relatedItems: RelatedItem[];
};

export default function CategoryItemClient({ item, relatedItems }: Props) {
  const doc = toDisplayDocFromCategoryItem(item);

  // DBが about-japanese-gods のはずなので両対応
  const c = item.category.toLowerCase();
  const isJapaneseGods = c === "about-japanese-gods" || c === "japanese-gods";

  const backHref = isJapaneseGods ? "/mythology#japanese-gods" : `/${item.category}`;
  const backLabel = isJapaneseGods ? "Back to Japanese Gods" : `Back to ${item.category}`;

  return (
    <ArticleDetailLayout
      doc={doc}
      sidebar={
        <RelatedArticles
          items={relatedItems}
          currentCategory={doc.category}
        />
      }
      backHref={backHref}
      backLabel={backLabel}
    />
  );
}
