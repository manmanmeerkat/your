// app/customs/page.tsx
import Script from "next/script";
import { Suspense } from "react";

import { WhiteLine } from "@/components/whiteLine/whiteLine";
import ScrollHandler from "@/components/scroll/ScrollHandler";
import { Breadcrumb } from "@/components/breadcrumb";
import { generateBreadcrumbStructuredData } from "@/components/breadcrumb/config";
import { BackToHomeBtn } from "@/components/backToHomeBtn/BackToHomeBtn";

import { parsePage } from "@/components/customsComponents/getCustomsData/GetCustomsData";
import { CustomsHeroSection } from "@/components/customsComponents/customsHeroSection/CustomsHeroSection";
import { CustomsArticlesSection } from "@/components/customsComponents/customsArticlesSection/CustomsArticlesSection";
import { CustomsArticlesSkeleton } from "@/components/customsComponents/customsArticlesSection/CustomsArticlesSkeleton";
// import { WayOfLifeSection } from "@/components/customsComponents/wayOfLifeSection/WayOfLifeSection";

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

      <CustomsHeroSection />

      <Suspense fallback={<CustomsArticlesSkeleton />}>
        <CustomsArticlesSection currentPage={currentPage} />
      </Suspense>

      <WhiteLine />

      {/* <WayOfLifeSection />

      <WhiteLine /> */}
      <BackToHomeBtn />
    </div>
  );
}
