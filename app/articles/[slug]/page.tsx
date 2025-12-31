// app/articles/[slug]/page.tsx
import { notFound } from "next/navigation";
import Script from "next/script";
import { prisma } from "@/lib/prisma";
import ArticleClientPage from "@/components/articlePageComponents/normalArticle/normalArticleClientPage/NormalArticleClientPage";
import {
  BREADCRUMB_CONFIG,
  generateBreadcrumbStructuredData,
  type CategoryKey,
} from "@/components/breadcrumb/config";
import { Breadcrumb } from "@/components/breadcrumb/Breadcrumb";
import type { BreadcrumbItem } from "@/components/breadcrumb/Breadcrumb";

import { getArticleBySlug } from "@/components/articlePageComponents/getArticleBySlug/getArticleBySlug";
import {
  buildArticleJsonLd,
  buildArticleMetadata,
} from "@/components/articlePageComponents/articleSeo/articleSeo";

export const dynamic = "force-dynamic";

type Props = { params: { slug: string } };

export async function generateStaticParams() {
  if (process.env.NODE_ENV === "development") {
    return [];
  }

  const articles = await prisma.article.findMany({
    where: { published: true },
    select: { slug: true },
  });

  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props) {
  const slug = decodeURIComponent(params.slug);
  const article = await getArticleBySlug(slug);

  if (!article) {
    return {
      title: "Article not found | Your Secret Japan",
      description:
        "The article you're looking for does not exist or is not published.",
    };
  }
  return buildArticleMetadata(article);
}

export default async function Page({ params }: Props) {
  const slug = decodeURIComponent(params.slug);
  const article = await getArticleBySlug(slug);

  const isBuild = process.env.NEXT_PHASE === "phase-production-build";

  if (!article || !article.published) return notFound();

  //  related を Server 側で取得
  // - 画像は「featured優先 → なければ先頭」を1枚だけ取る
  const relatedArticles = isBuild
    ? []
    : (await prisma.article.findMany({
        where: {
          published: true,
          category: article.category,
          NOT: { id: article.id },
        },
        orderBy: { createdAt: "desc" },
        take: 6,
        select: {
          id: true,
          slug: true,
          title: true,
          images: {
            take: 1,
            orderBy: [{ isFeatured: "desc" }, { id: "asc" }],
            select: { url: true, altText: true },
          },
        },
      })).map((a) => ({
        id: a.id,
        slug: a.slug,
        title: a.title,
        imageUrl: a.images?.[0]?.url ?? null,
        imageAlt: a.images?.[0]?.altText ?? a.title,
      }));

const isCategoryKey = (v: string): v is CategoryKey =>
  Object.prototype.hasOwnProperty.call(BREADCRUMB_CONFIG.categories, v);

const toCategoryHref = (key: CategoryKey) => {
  if (key === "about-japanese-gods") return "/mythology#japanese-gods";
  return `/${key}`;
};

  // ---- パンくず生成 ----
  const truncatedTitle =
    article.title.length > 20 ? `${article.title.slice(0, 20)}...` : article.title;

    const breadcrumbItems: BreadcrumbItem[] = [{ label: "Home", href: "/" }];

    const categoryKey = article.category;

    if (isCategoryKey(categoryKey)) {
      const node = BREADCRUMB_CONFIG.categories[categoryKey]; // ✅ CategoryNode

      if (node.parent) {
        const parentKey = node.parent;
        const parentNode = BREADCRUMB_CONFIG.categories[parentKey];

        breadcrumbItems.push({
          label: parentNode.label,
          href: toCategoryHref(parentKey),
        });
      }

      breadcrumbItems.push({
        label: node.label,
        href: toCategoryHref(categoryKey),
      });
    } else {
      breadcrumbItems.push({
        label: categoryKey,
        href: `/${categoryKey}`,
      });
    }

    breadcrumbItems.push({
      label: truncatedTitle,
      href: `/articles/${article.slug}`,
      isCurrentPage: true,
    });

  const jsonLd = buildArticleJsonLd(article);
  const breadcrumbJsonLd = generateBreadcrumbStructuredData(breadcrumbItems);

  return (
    <>
      <Script
        id="article-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Script
        id="breadcrumb-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <div className="container mx-auto px-4 bg-gradient-to-r from-[#221a18cc] via-[#15110fcc] to-[#221a18cc]           border-b border-[rgba(241,144,114,0.25)]
          backdrop-blur-sm">
        <Breadcrumb customItems={breadcrumbItems} />
      </div>

      <ArticleClientPage article={article} relatedArticles={relatedArticles} />
    </>
  );
}
