import ArticleCard from "@/components/articleCard/articleCard";
import PaginationWrapper from "@/components/pagination/pagination-wrapper";
import { SectionTitle } from "@/components/sectionTitle/SectionTitle";
import type { articleType } from "@/types/types";

type PaginationInfo = {
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

type GetArticlesFn = (page: number) => Promise<{
  articles: articleType[];
  pagination: PaginationInfo;
}>;

type Props = {
  currentPage: number;
  getArticles: GetArticlesFn;

  sectionId: string;
  title: string;
  descriptionLines: string[];
  emptyText: string;

  basePath: string;
  prefetchRange?: number;
};

export async function CategoryArticlesSection({
  currentPage,
  getArticles,
  sectionId,
  title,
  descriptionLines,
  emptyText,
  basePath,
  prefetchRange = 2,
}: Props) {
  const { articles, pagination } = await getArticles(currentPage);
  const totalPages = pagination.pageCount;

  return (
    <section id={sectionId} className="py-20">
      <div className="container mx-auto max-w-6xl px-6">
        <div className="text-center mb-10">
          <SectionTitle>{title}</SectionTitle>

          {descriptionLines.length > 0 && (
            <p className="mt-4 text-sm md:text-base text-[#f3f3f2]/70 leading-relaxed">
              {descriptionLines.map((line, i) => (
                <span key={`${sectionId}-desc-${i}`} className={i === 0 ? "block" : "block mt-1"}>
                  {line}
                </span>
              ))}
            </p>
          )}
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
                  basePath={basePath}
                  scrollToElementId={sectionId}
                  prefetchRange={prefetchRange}
                />
              </div>
            )}
          </>
        ) : (
          <p className="text-center text-white/70">{emptyText}</p>
        )}
      </div>
    </section>
  );
}
