// app/festivals/page.tsx
import Script from "next/script";
import { Suspense } from "react";

import { Breadcrumb } from "@/components/breadcrumb";
import { generateBreadcrumbStructuredData } from "@/components/breadcrumb/config";
import { WhiteLine } from "@/components/whiteLine/whiteLine";
import ScrollHandler from "@/components/scroll/ScrollHandler";
import { BackToHomeBtn } from "@/components/backToHomeBtn/BackToHomeBtn";

import { parsePage } from "@/components/festivalsComponents/getFestivalsData/GetFestivalsData";
import { FestivalsHeroSection } from "@/components/festivalsComponents/festivalsHeroSection/FestivalsHeroSection";
import { FestivalsArticlesSection } from "@/components/festivalsComponents/festivalsArticlesSection/FestivalsArticlesSection";
import { FestivalsArticlesSkeleton } from "@/components/festivalsComponents/festivalsArticlesSection/FestivalsArticlesSkeleton";
// import { SeasonalFestivalsSection } from "@/components/festivalsComponents/seasonalFestivalsSection/SeasonalFestivalsSection";
// import { ThreeBigFestivalsSection } from "@/components/festivalsComponents/threeBigFestivalsSection/ThreeBigFestivalsSection";

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
  const breadcrumbJsonLd = generateBreadcrumbStructuredData(breadcrumbItems);

  return (
    <div>
      <Script
        id="breadcrumb-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <div className="container mx-auto px-4">
        <Breadcrumb customItems={breadcrumbItems} />
      </div>

      <ScrollHandler />

      <FestivalsHeroSection />

      <Suspense fallback={<FestivalsArticlesSkeleton />}>
        <FestivalsArticlesSection currentPage={currentPage} />
      </Suspense>

      <WhiteLine />

      {/* <SeasonalFestivalsSection />

      <WhiteLine />

      <ThreeBigFestivalsSection />

      <WhiteLine /> */}
      <BackToHomeBtn />
    </div>
  );
}
