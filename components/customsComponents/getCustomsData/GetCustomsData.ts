// components/customsComponents/getCustomsData/GetCustomsData.ts
import { articleType } from "@/types/types";
import type { PaginationInfo } from "@/components/mythologyComponents/getMythologyData/GetMythologyData";
import { getBaseUrl, fetchJsonWithTimeout, parsePage,} from "@/components/mythologyComponents/getMythologyData/GetMythologyData";

const ARTICLES_PER_PAGE = 6;

type ArticlesApiResponse = {
  articles?: articleType[];
  pagination?: PaginationInfo;
};

export { parsePage };

export async function getCustomsArticles(page = 1) {
  const baseUrl = getBaseUrl();

  try {
    const data = await fetchJsonWithTimeout<ArticlesApiResponse>(
      `${baseUrl}/api/articles?category=customs&published=true&page=${page}&pageSize=${ARTICLES_PER_PAGE}`,
      {
        timeoutMs: 10000,
        next: { revalidate: 1800, tags: ["customs-articles", `customs-page-${page}`] },
        headers: { Accept: "application/json" },
      }
    );

    return {
      articles: Array.isArray(data.articles) ? data.articles : [],
      pagination:
        data.pagination ?? { total: 0, page: 1, pageSize: ARTICLES_PER_PAGE, pageCount: 1 },
      pageSize: ARTICLES_PER_PAGE,
    };
  } catch (e) {
    console.error("Failed to fetch customs articles:", e);
    return {
      articles: [],
      pagination: { total: 0, page: 1, pageSize: ARTICLES_PER_PAGE, pageCount: 1 },
      pageSize: ARTICLES_PER_PAGE,
    };
  }
}
