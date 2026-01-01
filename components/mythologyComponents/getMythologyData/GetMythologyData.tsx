import { fetchJsonWithTimeout, getBaseUrl, getCategoryArticles, parsePage } from "@/lib/categoryPage/articlesApi";

export { parsePage };

export const getMythologyArticles = (page = 1) =>
  getCategoryArticles("mythology", page);

// mythology 固有：神様 slug map はここに残す
export async function getGodsSlugMap(): Promise<Record<string, string>> {
  const baseUrl = getBaseUrl();

  try {
    const gods = await fetchJsonWithTimeout<Array<{ title: string; slug: string }>>(
      `${baseUrl}/api/category-items?category=about-japanese-gods`,
      {
        timeoutMs: 8000,
        cache: "no-store",
        headers: { Accept: "application/json" },
      }
    );

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
