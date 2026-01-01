// components/festivalsComponents/getFestivalsData/GetFestivalData.ts
import { getCategoryArticles, parsePage } from "@/lib/categoryPage/articlesApi";

export { parsePage };

export const getFestivalsArticles = (page = 1) =>
  getCategoryArticles("festivals", page, {
    // festivals だけ Cache-Control を足したいならここで足せます
    headers: {
      "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
    },
  });
