import { fetchJsonWithTimeout, getBaseUrl, getCategoryArticles, parsePage } from "@/lib/categoryPage/articlesApi";

export { parsePage };

export const getCultureArticles = (page = 1) =>
  getCategoryArticles("culture", page);

/* ★ 将来用：文化人物 slugMap（culture固有なので残す） */
export async function getCultureMastersSlugMap(): Promise<Record<string, string>> {
  const baseUrl = getBaseUrl();

  try {
    const items = await fetchJsonWithTimeout<Array<{ title: string; slug: string }>>(
      `${baseUrl}/api/category-items?category=japanese-culture-masters`,
      {
        timeoutMs: 8000,
        cache: "no-store",
        headers: { Accept: "application/json" },
      }
    );

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
