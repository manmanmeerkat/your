import { Suspense } from "react";
import Link from "next/link";

import ArticlesLoader from "@/components/loaders/ArticlesLoader";
import ArticleCard from "@/components/articleCard/articleCard";
import AllArticlesCategoryFilter from "@/components/allArticlesComponents/allArticlesCategoryFilter/AllArticlesCategoryFilter";
import AllArticlesPaginationWrapper from "@/components/allArticlesComponents/AllArticlesPaginationWrapper";
import { WhiteLine } from "@/components/whiteLine/whiteLine";
import { BackToHomeBtn } from "@/components/backToHomeBtn/BackToHomeBtn";

import {
  fetchAllArticlesData,
  normalizeCategory,
  parsePage,
  totalCountFromCounts,
} from "@/components/allArticlesComponents/getAllArticlesData/GetAllArticlesData";

import { AllArticlesHeroSection } from "@/components/allArticlesComponents/allArticlesHeroSection/AllArticlesHeroSection";

export const revalidate = 1800;

type SearchParams = {
  page?: string;
  category?: string;
};

export default async function AllArticlesPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const page = parsePage(searchParams?.page, 1);
  const category = normalizeCategory(searchParams?.category);
  const pageSize = 12;

  const { articles, pagination, categoryCounts } = await fetchAllArticlesData({
    page,
    category,
    pageSize,
  });

  const totalCount = totalCountFromCounts(categoryCounts);

  return (
    <div className="min-h-screen">
      <Suspense fallback={<ArticlesLoader fullPage />}>
        <AllArticlesHeroSection />

        {/* ↓以下はそのまま */}
        <section className="py-20" id="all-posts-list">
          <p className="mb-3 text-sm text-white/50 text-center">
            Explore stories by category
          </p>
          <div className="container mx-auto max-w-6xl px-6">
            <AllArticlesCategoryFilter
              currentCategory={category}
              totalCount={totalCount}
              categoryCounts={categoryCounts}
          />

            <div className="mt-8">
              {articles.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {articles.map((article) => (
                      <ArticleCard key={article.id} article={article} />
                    ))}
                  </div>

                  <div className="mt-10 text-center text-white">
                    <p>
                      Showing {(page - 1) * pageSize + 1}–
                      {Math.min(page * pageSize, pagination.total)} of{" "}
                      {pagination.total} articles
                    </p>
                    {category && (
                      <p className="text-white/60 text-sm mt-1">
                        Category:{" "}
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </p>
                    )}
                  </div>

                  {pagination.pageCount > 1 && (
                    <AllArticlesPaginationWrapper
                      currentPage={page}
                      totalPages={pagination.pageCount}
                      currentCategory={category}
                    />
                  )}
                </>
              ) : (
                <div className="text-center py-20 text-white">
                  <p className="text-xl">
                    {category
                      ? `No articles found in "${category.charAt(0).toUpperCase() + category.slice(1)}".`
                      : "No articles found."}
                  </p>

                  {category && (
                    <div className="mt-6">
                      <Link
                        href="/all-articles"
                        className="inline-flex items-center justify-center rounded-xl bg-[#df7163] px-4 py-2 text-white hover:bg-[#d85f52] transition"
                      >
                        View all articles
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        <WhiteLine />
        <BackToHomeBtn />
      </Suspense>
    </div>
  );
}
