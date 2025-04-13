"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import ArticleCard from "@/components/articleCard/articleCard";
import { articleType } from "@/types/types";
import { Pagination } from "@/components/pagination/Pagination";
import { WhiteLine } from "@/components/whiteLine/whiteLine";
import Image from "next/image";
import { CATEGORIES } from "@/constants/constants";
import Redbubble from "@/components/redBubble/RedBubble";

export default function AllArticlesPage() {
  const [articles, setArticles] = useState<articleType[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pageSize: 12, pageCount: 1 });
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [totalCount, setTotalCount] = useState(0);

  const searchParams = useSearchParams();
  const router = useRouter();
  const currentPage = Number(searchParams.get("page") || "1");
  const currentCategory = searchParams.get("category") || "";

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : "https://yourwebsite.com");

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const res = await fetch(`${baseUrl}/api/article-counts`, { cache: "no-cache" });
        if (!res.ok) throw new Error("Failed to fetch category counts");
        const { counts } = await res.json();
        setCategoryCounts(counts);
        setTotalCount(
          Object.values(counts as Record<string, number>).reduce((sum, count) => sum + count, 0)
        );
      } catch (err) {
        console.error("Error fetching counts:", err);
      }
    };
    fetchCounts();
  }, []);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          published: "true",
          page: currentPage.toString(),
          pageSize: pagination.pageSize.toString(),
        });
        if (currentCategory) params.append("category", currentCategory);

        const res = await fetch(`${baseUrl}/api/articles?${params}`, { cache: "no-cache" });
        if (!res.ok) throw new Error("Failed to fetch articles");

        const { articles, pagination: pageInfo } = await res.json();
        setArticles(articles);
        setPagination(pageInfo);
        if (!currentCategory) setTotalCount(pageInfo.total);
      } catch (err) {
        console.error("Error fetching articles:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, [currentPage, currentCategory, pagination.pageSize]);

  const updateQuery = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value); else params.delete(key);
    if (key !== "page") params.set("page", "1");
    router.push(`/all-articles?${params.toString()}`);
  };

  return (
    <div>
      <section className="relative bg-slate-950 text-white pt-16 pb-16">
        <div className="absolute inset-0 z-0 opacity-30">
          <Image src="/images/category-top/all-posts.jpg" alt="Japanese Customs" fill style={{ objectFit: "cover" }} />
        </div>
        <div className="container mx-auto px-6 py-24 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">All Posts</h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto text-justify">
            Browse all articles and discover stories from Japanese mythology, culture, festivals, and customs.
          </p>
        </div>
      </section>

      <section className="py-16 bg-slate-950 md:px-16">
        <div className="container mx-auto px-4">
          <div className="sticky top-16 z-20 bg-slate-950 py-4 shadow-md flex flex-wrap justify-start md:justify-center gap-3">
            <Button
              variant={!currentCategory ? "default" : "outline"}
              className={!currentCategory ? "bg-rose-700 text-white hover:bg-rose-800" : "text-white border-white hover:bg-white hover:text-slate-900"}
              onClick={() => updateQuery("category", "")}
            >
              All ({totalCount})
            </Button>
            {CATEGORIES.map(({ id, name }) => (
              <Button
                key={id}
                variant={currentCategory === id ? "default" : "outline"}
                className={currentCategory === id ? "bg-rose-700 text-white hover:bg-rose-800" : "text-white border-white hover:bg-white hover:text-slate-900"}
                onClick={() => updateQuery("category", id)}
              >
                {name} ({categoryCounts[id] || 0})
              </Button>
            ))}
          </div>
          
          <div className="flex-1 overflow-y-auto px-4 py-8">
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white" />
              </div>
            ) : articles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles.map(article => <ArticleCard key={article.id} article={article} />)}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-white text-xl">
                  {currentCategory
                    ? `No articles found in the "${CATEGORIES.find(c => c.id === currentCategory)?.name}" category.`
                    : "No articles found."}
                </p>
                {currentCategory && (
                  <Button className="mt-4 bg-rose-700 hover:bg-rose-800 text-white" onClick={() => updateQuery("category", "")}>
                    View all articles
                  </Button>
                )}
              </div>
            )}

            {articles.length > 0 && (
              <div className="mt-8 text-center text-white">
                Showing {(currentPage - 1) * pagination.pageSize + 1} -
                {Math.min(currentPage * pagination.pageSize, pagination.total)} of {pagination.total} articles
              </div>
            )}

            {pagination.pageCount > 1 && (
              <div className="mt-12 flex justify-center">
                <Pagination currentPage={currentPage} totalPages={pagination.pageCount} onPageChange={page => updateQuery("page", page.toString())} />
              </div>
            )}
          </div>
        </div>
      </section>

      <WhiteLine />

      <Redbubble/>

      <WhiteLine/>
    </div>
  );
}