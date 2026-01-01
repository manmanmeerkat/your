// app/customs/page.tsx
import { CategoryPageLayout } from "@/components/categoryPageComponents/categoryPageLayout/CategoryPageLayout";
import { CategoryHeroSection } from "@/components/categoryPageComponents/categoryHeroSection/CategoryHeroSection";
import { CategoryArticlesSection } from "@/components/categoryPageComponents/categoryArticlesSection/CategoryArticleSection";
import { CategoryArticlesSkeleton } from "@/components/categoryPageComponents/categoryArticlesSkeleton/CategoryArticlesSkeleton";

import {
  parsePage,
  getCustomsArticles,
} from "@/components/customsComponents/getCustomsData/GetCustomsData";

import { ARTICLES_COPY } from "@/lib/categoryPage/articlesSectionConfig";

// import { WayOfLifeSection } from "@/components/customsComponents/wayOfLifeSection/WayOfLifeSection";

const copy = ARTICLES_COPY.customs;

export default async function CustomsPage({
  searchParams,
}: {
  searchParams?: { page?: string };
}) {
  const currentPage = parsePage(searchParams?.page);

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Customs", href: "/customs", isCurrentPage: true },
  ];

  return (
    <CategoryPageLayout
      breadcrumbItems={breadcrumbItems}
      hero={<CategoryHeroSection category="customs" />}

      articles={
        <CategoryArticlesSection
          currentPage={currentPage}
          getArticles={getCustomsArticles}
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

      // afterArticles={<WayOfLifeSection />} // 公開準備できたらON
    />
  );
}
