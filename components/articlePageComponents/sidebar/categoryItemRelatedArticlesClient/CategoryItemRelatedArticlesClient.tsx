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

type CachePayload = {
  v: number;
  category: string;
  items: RelatedItem[];
  savedAt: number;
};

const CACHE_VERSION = 1;
const CACHE_TTL_MS = 1000 * 60 * 30; // 30分

function cacheKey(category: string) {
  return `ysj:related:category-item:${category.toLowerCase()}:v${CACHE_VERSION}`;
}

function safeRead(key: string): CachePayload | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;

    const p = JSON.parse(raw) as CachePayload;
    if (p?.v !== CACHE_VERSION) return null;
    if (!Array.isArray(p.items)) return null;
    if (Date.now() - p.savedAt > CACHE_TTL_MS) return null;

    const ok = p.items.every(
      (it) => it && typeof it.title === "string" && typeof it.href === "string"
    );
    if (!ok) return null;

    return p;
  } catch {
    return null;
  }
}

function safeWrite(key: string, payload: CachePayload) {
  try {
    localStorage.setItem(key, JSON.stringify(payload));
  } catch {
    // localStorage満杯などは無視
  }
}

export default function CategoryItemRelatedArticlesClient({
  currentCategory, // 表示ラベル用（doc.category）
  category,        // API検索用（item.category）
  currentSlug,
  take = 6,
  pool = 60,
  show = 3,
}: {
  currentCategory: string;
  category: string;
  currentSlug: string;
  take?: number;
  pool?: number;
  show?: number;
}) {
  const [items, setItems] = useState<RelatedItem[]>([]);
  const [loading, setLoading] = useState(true);

  const key = useMemo(() => cacheKey(category), [category]);

  const url = useMemo(() => {
    const qs = new URLSearchParams({
      category,
      currentSlug,
      take: String(take),
      pool: String(pool),
    });
    // ✅ あなたのAPI実体と一致
    return `/api/category-item-related-articles?${qs.toString()}`;
  }, [category, currentSlug, take, pool]);

  // ① キャッシュ即表示（体感ゼロ）
  useEffect(() => {
    const cached = safeRead(key);
    if (cached?.items?.length) {
      setItems(cached.items.slice(0, show));
      setLoading(false);
    }
  }, [key, show]);

  // ② 最新を裏で取りに行って差し替え
  useEffect(() => {
    let canceled = false;

    (async () => {
      try {
        // キャッシュがある時にチラつくなら：setLoading(items.length === 0);
        setLoading(items.length === 0);

        const res = await fetch(url, { cache: "no-store" });
        const data: { items?: ApiItem[] } = await res.json();

        const mapped: RelatedItem[] = (data.items ?? [])
          .slice(0, show)
          .map((a) => ({
            id: a.id,
            slug: a.slug,
            title: a.title,
            href: `/category-item/${a.slug}`, // ✅ category-item用
            imageUrl: a.imageUrl ?? null,
            imageAlt: a.imageAlt ?? a.title,
          }));

        if (canceled) return;

        setItems(mapped);
        setLoading(false);

        safeWrite(key, {
          v: CACHE_VERSION,
          category,
          items: mapped,
          savedAt: Date.now(),
        });
      } catch {
        if (!canceled) setLoading(false);
      }
    })();

    return () => {
      canceled = true;
    };
  }, [url, show, key, category]);

  return (
    <RelatedArticles
      items={items}
      currentCategory={currentCategory}
      loading={loading && items.length === 0} // ✅ 初回だけスケルトン
    />
  );
}