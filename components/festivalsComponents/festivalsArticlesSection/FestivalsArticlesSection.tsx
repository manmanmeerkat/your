// components/festivalsComponents/festivalsArticlesSection/FestivalsArticlesSection.tsx
import ArticleCard from "@/components/articleCard/articleCard";
import PaginationWrapper from "@/components/pagination/pagination-wrapper";
import { SectionTitle } from "@/components/sectionTitle/SectionTitle";
import { getFestivalArticles } from "../getFestivalsData/GetFestivalsData";

export async function FestivalsArticlesSection({ currentPage }: { currentPage: number }) {
  const { articles, pagination } = await getFestivalArticles(currentPage);
  const totalPages = pagination.pageCount;

  return (
    <section id="festivals-stories" className="py-20">
      <div className="container mx-auto max-w-6xl px-6">
        <div className="text-center mb-10">
          <SectionTitle>Festivals around Japan</SectionTitle>

            <p className="mt-4 text-sm md:text-base text-[#f3f3f2]/70 leading-relaxed text-center">
            <span className="block">
                Seasonal celebrations, shrine traditions, and local pride.
            </span>
            <span className="block mt-1">
                Would you like to discover the origins and traditions of matsuri,
            </span>
            <span className="block">
                and experience their spirit of celebration as if you were there?
            </span>
            </p>
        </div>

        {articles.length ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
              {articles.map((article) => (
                <ArticleCard key={`${article.id}-${currentPage}`} article={article} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-12 flex justify-center">
                <PaginationWrapper
                  currentPage={currentPage}
                  totalPages={totalPages}
                  basePath="/festivals"
                  scrollToElementId="festivals-stories"
                  prefetchRange={2}
                />
              </div>
            )}
          </>
        ) : (
          <p className="text-center text-white/70">Festival posts will be added here soon.</p>
        )}
      </div>
    </section>
  );
}
