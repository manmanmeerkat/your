// components/festivalsComponents/getFestivalsData/GetFestivalData.ts
import { getCategoryArticles, parsePage } from "@/lib/categoryPage/articlesApi";

export { parsePage };

export const getFestivalsArticles = (page = 1) =>
  getCategoryArticles("festivals", page);
