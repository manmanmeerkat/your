// app/category-item/[slug]/page.tsx
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import CategoryItemClient from "./CategoryItemClient";
import { Breadcrumb } from "@/components/breadcrumb";
import {
  BREADCRUMB_CONFIG,
  generateBreadcrumbStructuredData,
} from "@/components/breadcrumb/config";
import Script from "next/script";

interface CategoryItemDetailProps {
  params: {
    slug: string;
  };
}

export default async function CategoryItemDetailPage({
  params,
}: CategoryItemDetailProps) {
  const item = await prisma.categoryItem.findUnique({
    where: { slug: params.slug },
    include: { images: true },
  });

  if (!item || !item.published) {
    notFound();
  }

  // 動的なパンくずリストのアイテムを生成
  const categoryLabel =
    BREADCRUMB_CONFIG.categories[
      item.category as keyof typeof BREADCRUMB_CONFIG.categories
    ] || item.category;
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: categoryLabel, href: `/${item.category}` },
    {
      label: item.title,
      href: `/category-item/${item.slug}`,
      isCurrentPage: true,
    },
  ];

  // SEO: パンくずリスト用の構造化データ
  const breadcrumbJsonLd = generateBreadcrumbStructuredData(breadcrumbItems);

  return (
    <>
      <Script
        id="breadcrumb-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className="container mx-auto px-4">
        <Breadcrumb customItems={breadcrumbItems} />
      </div>
      <CategoryItemClient item={item} />
    </>
  );
}

// メタデータの生成（SEO対策）
export async function generateMetadata({ params }: CategoryItemDetailProps) {
  const item = await prisma.categoryItem.findUnique({
    where: { slug: params.slug },
    include: { images: true },
  });

  if (!item) {
    return {
      title: "Not Found",
      description: "This page does not exist",
    };
  }

  return {
    title: item.title,
    description: item.content || item.content?.substring(0, 155),
    openGraph: {
      title: item.title,
      description: item.content || item.content?.substring(0, 155),
      images: item.images?.[0] ? [{ url: item.images[0].url }] : [],
    },
  };
}
