// lib/getRelatedArticles.ts
import { prisma } from "@/lib/prisma";

function shuffle<T>(arr: T[]) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export type RelatedItem = {
  id: string;
  slug: string;
  title: string;
  href: string;
  imageUrl: string | null;
  imageAlt: string | null;
};

export async function getRandomRelatedArticles({
  category,
  currentSlug,
  take = 6,
  pool = 300,
}: {
  category: string;
  currentSlug: string;
  take?: number;  // 表示件数
  pool?: number;  // 母集団
}): Promise<RelatedItem[]> {
  const rows = await prisma.article.findMany({
    where: {
      published: true,
      category,
      slug: { not: currentSlug },
    },
    orderBy: { createdAt: "desc" },
    take: pool,
    select: {
      id: true,
      slug: true,
      title: true,
      images: {
        take: 1,
        orderBy: [{ isFeatured: "desc" }, { id: "asc" }],
        select: { url: true, altText: true },
      },
    },
  });

  const picked = shuffle(rows).slice(0, take);

  return picked.map((a) => ({
    id: a.id,
    slug: a.slug,
    title: a.title,
    href: `/articles/${a.slug}`,
    imageUrl: a.images?.[0]?.url ?? null,
    imageAlt: a.images?.[0]?.altText ?? a.title,
  }));
}
