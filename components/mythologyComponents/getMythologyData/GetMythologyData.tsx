import { getCategoryArticles, parsePage } from "@/lib/categoryPage/articlesApi";
import { prisma } from "@/lib/prisma";
export { parsePage };

export const getMythologyArticles = (page = 1) =>
  getCategoryArticles("mythology", page);

export async function getGodsSlugMap(): Promise<Record<string, string>> {
  try {
    const gods = await prisma.categoryItem.findMany({
      where: {
        category: "about-japanese-gods",
        published: true,
      },
      select: {
        title: true,
        slug: true,
      },
      orderBy: { createdAt: "asc" },
    });

    const slugMap: Record<string, string> = {};

    for (const god of gods ?? []) {
      if (!god?.title || !god?.slug) continue;

      const normalized = god.title.trim();

      const variations = new Set<string>([
        normalized,
        normalized.toLowerCase(),
        normalized.replace(/\s+(no\s+)?(kami|mikoto|okami|gami)$/i, "").trim(),
        normalized.split(" ")[0],
      ]);

      for (const key of variations) {
        if (key) slugMap[key] = god.slug;
      }
    }

    return slugMap;

  } catch (e) {
    console.error("Failed to fetch gods data:", e);
    return {};
  }
}