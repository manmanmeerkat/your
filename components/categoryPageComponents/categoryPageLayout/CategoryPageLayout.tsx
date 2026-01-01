// components/categoryPageComponents/CategoryPageLayout.tsx
import Script from "next/script";
import { Suspense, type ReactNode } from "react";

import ScrollHandler from "@/components/scroll/ScrollHandler";
import { Breadcrumb } from "@/components/breadcrumb";
import { generateBreadcrumbStructuredData } from "@/components/breadcrumb/config";
import { WhiteLine } from "@/components/whiteLine/whiteLine";
import { BackToHomeBtn } from "@/components/backToHomeBtn/BackToHomeBtn";

type BreadcrumbItem = {
  label: string;
  href: string;
  isCurrentPage?: boolean;
};

type Props = {
  breadcrumbItems: BreadcrumbItem[];

  hero: ReactNode;

  articles: ReactNode;
  articlesFallback: ReactNode;

  /** 追加セクション（mythology の gods など）。なければ渡さない */
  afterArticles?: ReactNode;

  /** 既定は true。不要なら false */
  showWhiteLineBetween?: boolean;
};

export function CategoryPageLayout({
  breadcrumbItems,
  hero,
  articles,
  articlesFallback,
  afterArticles,
  showWhiteLineBetween = true,
}: Props) {
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
      {hero}

      {/* articles */}
      <Suspense fallback={articlesFallback}>{articles}</Suspense>

      {showWhiteLineBetween && <WhiteLine />}

      {/* optional extra sections */}
      {afterArticles}

      {afterArticles && showWhiteLineBetween && <WhiteLine />}

      <BackToHomeBtn />
    </div>
  );
}
