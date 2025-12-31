// app/mythology/_components/MythologyStoriesSection.tsx
import ArticleCard from "@/components/articleCard/articleCard";
import PaginationWrapper from "@/components/pagination/pagination-wrapper";
import { SectionTitle } from "@/components/sectionTitle/SectionTitle";
import { getMythologyArticles } from "../getMythologyData/GetMythologyData";

export async function MythologyArticleaSection({ currentPage }: { currentPage: number }) {
  const { articles, pagination } = await getMythologyArticles(currentPage);
  const totalPages = pagination.pageCount;

  return (
    <section id="mythology-stories" className="py-20">
      <div className="container mx-auto max-w-6xl px-6">
        <div className="text-center mb-10">
          <SectionTitle>Japanese mythological stories</SectionTitle>

          <p className="mt-4 text-sm md:text-base text-[#f3f3f2]/70 leading-relaxed">
            <span className="block">Legends of gods, heroes, and sacred places.</span>
            <span className="block mt-1">
              Would you like to explore Japan’s myths, legends, and timeless stories?
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
                  basePath="/mythology"
                  scrollToElementId="mythology-stories"
                  prefetchRange={2}
                />
              </div>
            )}
          </>
        ) : (
          <p className="text-center text-white/70">Articles will be added here soon.</p>
        )}
      </div>
    </section>
  );
}
