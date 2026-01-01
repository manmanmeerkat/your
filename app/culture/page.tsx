// app/culture/page.tsx
import { CategoryPageLayout } from "@/components/categoryPageComponents/categoryPageLayout/CategoryPageLayout";
import { CategoryHeroSection } from "@/components/categoryPageComponents/categoryHeroSection/CategoryHeroSection";
import { CategoryArticlesSection } from "@/components/categoryPageComponents/categoryArticlesSection/CategoryArticleSection";
import { CategoryArticlesSkeleton } from "@/components/categoryPageComponents/categoryArticlesSkeleton/CategoryArticlesSkeleton";

import {
  parsePage,
  getCultureArticles,
} from "@/components/cultureComponents/getCultureData/GetCultureData";

import { ARTICLES_COPY } from "@/lib/categoryPage/articlesSectionConfig";

const copy = ARTICLES_COPY.culture;

export default async function CulturePage({
  searchParams,
}: {
  searchParams?: { page?: string };
}) {
  const currentPage = parsePage(searchParams?.page);

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Culture", href: "/culture", isCurrentPage: true },
  ];

  return (
    <CategoryPageLayout
      breadcrumbItems={breadcrumbItems}
      hero={<CategoryHeroSection category="culture" />}

      articles={
        <CategoryArticlesSection
          currentPage={currentPage}
          getArticles={getCultureArticles}
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

      // afterArticles は未定なので渡さない
    />
  );
}
