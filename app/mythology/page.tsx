// app/mythology/page.tsx
import Script from "next/script";
import { Suspense } from "react";

import { WhiteLine } from "@/components/whiteLine/whiteLine";
import ScrollHandler from "@/components/scroll/ScrollHandler";
import { Breadcrumb } from "@/components/breadcrumb";
import { generateBreadcrumbStructuredData } from "@/components/breadcrumb/config";
import { BackToHomeBtn } from "@/components/backToHomeBtn/BackToHomeBtn";

import { parsePage, getGodsSlugMap } from "@/components/mythologyComponents/getMythologyData/GetMythologyData";
import { MythologyHeroSection } from "@/components/mythologyComponents/mythologyHeroSection/MythologyHeroSection";
import { MythologyArticleaSection } from "@/components/mythologyComponents/mythologyAriclesSection/MythologyArticlesSection";
import { MythologyArticlesSkeleton } from "@/components/mythologyComponents/mythologyAriclesSection/MythologyStoriesSkeleton";
import { JapaneseGodsSection } from "@/components/mythologyComponents/japaneseGodsSection/JapaneseGodsSection";

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

      <MythologyHeroSection />

      <Suspense fallback={<MythologyArticlesSkeleton />}>
        <MythologyArticleaSection currentPage={currentPage} />
      </Suspense>

      <WhiteLine />

      <JapaneseGodsSection godsSlugMapPromise={godsSlugMapPromise} />

      <WhiteLine />
      <BackToHomeBtn />
    </div>
  );
}
