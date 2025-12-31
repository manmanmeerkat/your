// app/category-item/[slug]/page.tsx
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Script from "next/script";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { Breadcrumb } from "@/components/breadcrumb";
import { generateBreadcrumbStructuredData,
} from "@/components/breadcrumb/config";
import { BREADCRUMB_CONFIG, type CategoryKey } from "@/components/breadcrumb/config";

import CategoryItemClient from "../../../components/articlePageComponents/categoryArticlePage/categoryItemClient/CategoryItemClient";
import type { CategoryItemDTO } from "../../../components/articlePageComponents/categoryArticlePage/categoryItemClient/CategoryItemClient";

type Props = {
  params: { slug: string };
};

// 取得 + DTO整形（CategoryItemClient に渡す形に合わせる）
async function getCategoryItemDTO(slug: string): Promise<CategoryItemDTO | null> {
  const item = await prisma.categoryItem.findFirst({
    where: { slug, published: true },
    include: {
      images: {
        select: {
          id: true,
          url: true,
          altText: true,
          isFeatured: true,
          createdAt: true,
          categoryItemId: true,
        },
      },
      trivia: {
        where: { isActive: true },
        orderBy: { displayOrder: "asc" },
        select: {
          id: true,
          title: true,
          content: true,
          contentEn: true,
          category: true,
          tags: true,
          iconEmoji: true,
          colorTheme: true,
          displayOrder: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          categoryItemId: true,
        },
      },
    },
  });

  if (!item) return null;

  // DTO化（Date → string）
  return {
    id: item.id,
    title: item.title ?? "",
    slug: item.slug ?? "",
    content: item.content ?? "",
    category: item.category ?? "",
    published: Boolean(item.published),
    description: item.description ?? undefined,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
    images: (item.images ?? []).map((img) => ({
      id: img.id,
      url: img.url ?? "",
      altText: img.altText ?? undefined,
      isFeatured: Boolean(img.isFeatured),
      createdAt: img.createdAt.toISOString(),
      categoryItemId: img.categoryItemId ?? "",
    })),
    trivia: (item.trivia ?? []).map((t) => ({
      id: t.id,
      title: t.title ?? "",
      content: t.content ?? "",
      contentEn: t.contentEn ?? undefined,
      category: t.category ?? "",
      tags: Array.isArray(t.tags) ? t.tags : [],
      iconEmoji: t.iconEmoji ?? undefined,
      colorTheme: t.colorTheme ?? undefined,
      displayOrder: Number(t.displayOrder) || 0,
      isActive: Boolean(t.isActive),
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
      categoryItemId: t.categoryItemId ?? "",
    })),
  };
}

// 本番キャッシュ（DTOをキャッシュ）
const getCategoryItemDTOProd = unstable_cache(
  getCategoryItemDTO,
  ["category-item-dto-by-slug"],
  { revalidate: 300, tags: ["category-item"] }
);

const getCategoryItemDTORuntime = async (slug: string) => {
  return process.env.NODE_ENV === "development"
    ? getCategoryItemDTO(slug)
    : getCategoryItemDTOProd(slug);
};

export async function generateStaticParams() {
  if (process.env.NODE_ENV === "development") {
    return [];
  }

  const items = await prisma.categoryItem.findMany({
    where: { published: true },
    select: { slug: true },
  });

  return items.map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = decodeURIComponent(params.slug);
  const item = await getCategoryItemDTORuntime(slug);

  if (!item) {
    return {
      title: "Item not found | Your Secret Japan",
      description: "The item you're looking for does not exist or is not published.",
    };
  }

  const featured = item.images?.find((img) => img.isFeatured);
  const imageUrl = featured?.url || "/ogp-image.png";

  const baseDescription =
    item.description ||
    item.content?.slice(0, 155) ||
    "Discover the spirit of Japan.";

  return {
    title: `${item.title} | Your Secret Japan`,
    description: baseDescription,
    openGraph: {
      title: `${item.title} | Your Secret Japan`,
      description: baseDescription,
      url: `https://www.yoursecretjapan.com/category-item/${item.slug}`,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: item.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${item.title} | Your Secret Japan`,
      description: baseDescription,
      images: [imageUrl],
    },
    keywords: [item.category, "Japanese culture", "Japanese gods", "Japan"].join(", "),
  };
}

export default async function Page({ params }: Props) {
  const slug = decodeURIComponent(params.slug);
  const item = await getCategoryItemDTORuntime(slug);
  const isBuild = process.env.NEXT_PHASE === "phase-production-build";

  if (!item || !item.published) return notFound();

  const relatedItems = isBuild
  ? []
  : (await prisma.categoryItem.findMany({
      where: {
        published: true,
        category: item.category,
        NOT: { id: item.id },
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
    }))
      .slice(0, 3)
      .map((a) => ({
        id: a.id,
        slug: a.slug,
        title: a.title,
        href: `/category-item/${a.slug}`,
        imageUrl: a.images?.[0]?.url ?? null,
        imageAlt: a.images?.[0]?.altText ?? a.title,
      }));

  // ===== パンくず =====
  type CategoryNode = { label: string; parent?: CategoryKey };

  // ★ categories を「必ずこの型」として固定（union推論を潰す）
  const categories = BREADCRUMB_CONFIG.categories as Record<CategoryKey, CategoryNode>;

  const isCategoryKey = (v: string): v is CategoryKey =>
    Object.prototype.hasOwnProperty.call(categories, v);

  const toCategoryHref = (key: CategoryKey) => {
    // DBカテゴリ about-japanese-gods は Mythology のセクションへ
    if (key === "about-japanese-gods") return "/mythology#japanese-gods";
    return `/${key}`;
  };

  const breadcrumbItems: Array<{ label: string; href: string; isCurrentPage?: boolean }> = [
    { label: "Home", href: "/" },
  ];

  const categoryKeyRaw = item.category; // string

  if (isCategoryKey(categoryKeyRaw)) {
    const node = categories[categoryKeyRaw];

    // parent があるなら先に親を入れる
    if (node.parent) {
      const parentKey = node.parent; // CategoryKey
      const parentNode = categories[parentKey];

      breadcrumbItems.push({
        label: parentNode.label,
        href: toCategoryHref(parentKey),
      });
    }

    breadcrumbItems.push({
      label: node.label,
      href: toCategoryHref(categoryKeyRaw),
    });
  } else {
    breadcrumbItems.push({
      label: item.category,
      href: `/${item.category}`,
    });
  }

  breadcrumbItems.push({
    label: item.title.length > 20 ? `${item.title.slice(0, 20)}...` : item.title,
    href: `/category-item/${item.slug}`,
    isCurrentPage: true,
  });

  const featured = item.images?.find((img) => img.isFeatured);
  const imageUrl = featured?.url || "/ogp-image.png";

  // 構造化データ
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: item.title,
    description: item.description || item.content?.slice(0, 200) || "",
    image: imageUrl.startsWith("http")
      ? imageUrl
      : `https://www.yoursecretjapan.com${imageUrl}`,
    author: { "@type": "Person", name: "Your Secret Japan" },
    publisher: {
      "@type": "Organization",
      name: "Your Secret Japan",
      logo: { "@type": "ImageObject", url: "https://www.yoursecretjapan.com/logo.png" },
    },
    datePublished: item.createdAt,
    dateModified: item.updatedAt,
    about: [
      { "@type": "Thing", name: item.category },
      { "@type": "Thing", name: "Japanese Culture" },
    ],
    keywords: [item.category, "Japanese culture", "Japan"].join(", "),
  };

  const breadcrumbJsonLd = generateBreadcrumbStructuredData(breadcrumbItems);

  return (
    <>
      <Script
        id="category-item-structured-data"
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

      <CategoryItemClient item={item} relatedItems={relatedItems} />
    </>
  );
}

