// app/festivals/page.tsx
import { CategoryPageLayout } from "@/components/categoryPageComponents/categoryPageLayout/CategoryPageLayout";
import { CategoryHeroSection } from "@/components/categoryPageComponents/categoryHeroSection/CategoryHeroSection";
import { CategoryArticlesSection } from "@/components/categoryPageComponents/categoryArticlesSection/CategoryArticleSection";
import { CategoryArticlesSkeleton } from "@/components/categoryPageComponents/categoryArticlesSkeleton/CategoryArticlesSkeleton";
import { parsePage, getFestivalsArticles } from "@/components/festivalsComponents/getFestivalsData/GetFestivalsData";

import { ARTICLES_COPY } from "@/lib/categoryPage/articlesSectionConfig";

// import { SeasonalFestivalsSection } from "@/components/festivalsComponents/seasonalFestivalsSection/SeasonalFestivalsSection";
// import { ThreeBigFestivalsSection } from "@/components/festivalsComponents/threeBigFestivalsSection/ThreeBigFestivalsSection";

const copy = ARTICLES_COPY.festivals;

export default async function FestivalsPage({
  searchParams,
}: {
  searchParams?: { page?: string };
}) {
  const currentPage = parsePage(searchParams?.page);

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Festivals", href: "/festivals", isCurrentPage: true },
  ];

  return (
    <CategoryPageLayout
      breadcrumbItems={breadcrumbItems}
      hero={<CategoryHeroSection category="festivals" />}

      articles={
        <CategoryArticlesSection
          currentPage={currentPage}
          getArticles={getFestivalsArticles}
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

      // afterArticles は準備できたらここを有効化
      // afterArticles={
      //   <>
      //     <SeasonalFestivalsSection />
      //     <ThreeBigFestivalsSection />
      //   </>
      // }
    />
  );
}
