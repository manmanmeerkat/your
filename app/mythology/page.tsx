import { CategoryPageLayout } from "@/components/categoryPageComponents/categoryPageLayout/CategoryPageLayout";
import { CategoryHeroSection } from "@/components/categoryPageComponents/categoryHeroSection/CategoryHeroSection";
import { CategoryArticlesSection } from "@/components/categoryPageComponents/categoryArticlesSection/CategoryArticleSection";
import { CategoryArticlesSkeleton } from "@/components/categoryPageComponents/categoryArticlesSkeleton/CategoryArticlesSkeleton";

import {
  parsePage,
  getGodsSlugMap,
  getMythologyArticles,
} from "@/components/mythologyComponents/getMythologyData/GetMythologyData";

import { JapaneseGodsSection } from "@/components/mythologyComponents/japaneseGodsSection/JapaneseGodsSection";
import { ARTICLES_COPY } from "@/lib/categoryPage/articlesSectionConfig";

const copy = ARTICLES_COPY.mythology;

export default async function MythologyPage({
  searchParams,
}: {
  searchParams?: { page?: string };
}) {
  const currentPage = parsePage(searchParams?.page);
  const godsSlugMapPromise = getGodsSlugMap();

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Mythology", href: "/mythology", isCurrentPage: true },
  ];

  return (
    <CategoryPageLayout
      breadcrumbItems={breadcrumbItems}
      hero={<CategoryHeroSection category="mythology" />}

      articles={
        <CategoryArticlesSection
          currentPage={currentPage}
          getArticles={getMythologyArticles}
          sectionId={copy.sectionId}
          title={copy.sectionTitle}
          descriptionLines={copy.descriptionLines}
          emptyText={copy.emptyText}
          basePath={copy.basePath}
        />
      }

      articlesFallback={
        <CategoryArticlesSkeleton
          sectionId={copy.sectionId}
          title={copy.sectionTitle}
          loadingText={copy.loadingText}
        />
      }

      afterArticles={
        <JapaneseGodsSection godsSlugMapPromise={godsSlugMapPromise} />
      }
    />
  );
}
