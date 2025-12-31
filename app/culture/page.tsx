// app/culture/page.tsx
import Script from "next/script";
import { Suspense } from "react";

import { WhiteLine } from "@/components/whiteLine/whiteLine";
import ScrollHandler from "@/components/scroll/ScrollHandler";
import { Breadcrumb } from "@/components/breadcrumb";
import { generateBreadcrumbStructuredData } from "@/components/breadcrumb/config";
import { BackToHomeBtn } from "@/components/backToHomeBtn/BackToHomeBtn";
import { parsePage } from "@/components/cultureComponents/getCultureData/GetCultureData";
import { CultureHeroSection } from "@/components/cultureComponents/cultureHeroSection/CultureHeroSection";
import { CultureArticlesSection } from "@/components/cultureComponents/cultureArticlesSection/CultureArticleSection";
import { CultureArticlesSkeleton } from "@/components/cultureComponents/cultureArticlesSection/CultureArticlesSkeleton";
// import { MastersCultureSection } from "@/components/cultureComponents/mastersCultureSection/MastersCultureSection";

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

      {/* hero */}
      <CultureHeroSection />

      {/* articles */}
      <Suspense fallback={<CultureArticlesSkeleton />}>
        <CultureArticlesSection currentPage={currentPage} />
      </Suspense>

      <WhiteLine />

      {/* masters */}
      {/* <MastersCultureSection /> */}

      {/* <WhiteLine /> */}
      <BackToHomeBtn />
    </div>
  );
}
