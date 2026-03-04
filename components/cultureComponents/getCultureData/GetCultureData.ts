import { getCategoryArticles, parsePage } from "@/lib/categoryPage/articlesApi";
import { prisma } from "@/lib/prisma";
export { parsePage };

export const getCultureArticles = (page = 1) =>
  getCategoryArticles("culture", page);

/* ★ 将来用：文化人物 slugMap（culture固有なので残す） */
export async function getCultureMastersSlugMap(): Promise<Record<string, string>> {
  try {
    const items = await prisma.categoryItem.findMany({
      where: {
        category: "japanese-culture-masters",
        published: true,
      },
      select: {
        title: true,
        slug: true,
      },
      orderBy: { createdAt: "asc" },
    });

    const slugMap: Record<string, string> = {};

    for (const item of items ?? []) {
      if (!item?.title || !item?.slug) continue;

      const key = item.title.trim();

      slugMap[key] = item.slug;
      slugMap[key.toLowerCase()] = item.slug;
    }

    return slugMap;

  } catch (e) {
    console.error("Failed to fetch culture masters slugMap:", e);
    return {};
  }
}
