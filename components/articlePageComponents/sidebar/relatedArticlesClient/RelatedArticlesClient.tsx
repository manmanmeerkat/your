"use client";

import { useEffect, useMemo, useState } from "react";
import RelatedArticles, { type RelatedItem } from "../RelatedArticles";

type ApiItem = {
  id: string;
  slug: string;
  title: string;
  imageUrl: string | null;
  imageAlt: string | null;
};

export default function RelatedArticlesClient({
  currentCategory,
  category,
  currentSlug,
  take = 6,
  pool = 300,
  show = 3,
}: {
  currentCategory: string; // 表示ラベル用（doc.category）
  category: string;        // API検索用（article.category）
  currentSlug: string;
  take?: number;
  pool?: number;
  show?: number;
}) {
  const [items, setItems] = useState<RelatedItem[]>([]);

  const url = useMemo(() => {
    const qs = new URLSearchParams({
      category,
      currentSlug,
      take: String(take),
      pool: String(pool),
    });
    return `/api/related-articles?${qs.toString()}`;
  }, [category, currentSlug, take, pool]);

  useEffect(() => {
    let canceled = false;

    (async () => {
      try {
        const res = await fetch(url, { cache: "no-store" });
        const data: { items?: ApiItem[] } = await res.json();

        const mapped: RelatedItem[] = (data.items ?? [])
          .slice(0, show)
          .map((a) => ({
            id: a.id,
            slug: a.slug,
            title: a.title,
            href: `/articles/${a.slug}`,
            imageUrl: a.imageUrl ?? null,
            imageAlt: a.imageAlt ?? a.title,
          }));

        if (!canceled) setItems(mapped);
      } catch {
        if (!canceled) setItems([]);
      }
    })();

    return () => {
      canceled = true;
    };
  }, [url, show]);

  // itemsが0ならRelatedArticles側がnull返すのでOK
  return <RelatedArticles items={items} currentCategory={currentCategory} />;
}