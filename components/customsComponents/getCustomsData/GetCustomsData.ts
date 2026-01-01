// components/customsComponents/getCustomsData/GetCustomsData.ts
import { getCategoryArticles, parsePage } from "@/lib/categoryPage/articlesApi";

export { parsePage };

export const getCustomsArticles = (page = 1) =>
  getCategoryArticles("customs", page);
