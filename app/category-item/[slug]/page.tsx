// app/category-item/[slug]/page.tsx - 統一レイアウト版
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { CategoryItemImage } from "@prisma/client";

// 手動で型を定義（Prismaクライアントが更新されるまで）
interface CategoryItemTrivia {
  id: string;
  title: string;
  content: string;
  contentEn?: string | null;
  category: string;
  tags: string[];
  iconEmoji?: string | null;
  colorTheme?: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  categoryItemId: string;
}
import CategoryItemClient from "./CategoryItemClient";
import Script from "next/script";
import { unstable_cache } from "next/cache";
import { Breadcrumb } from "@/components/breadcrumb";
import {
  BREADCRUMB_CONFIG,
  generateBreadcrumbStructuredData,
} from "@/components/breadcrumb/config";

type Props = {
  params: { slug: string };
};

// 安全なデータ取得関数（記事詳細と同じ構造）
const getCategoryItemData = async (slug: string) => {
  try {
    console.log("カテゴリ項目取得開始:", slug);

    const item = await prisma.categoryItem.findFirst({
      where: {
        slug,
        published: true, // 公開済みの項目のみを取得
      },
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
          where: {
            isActive: true,
          },
          orderBy: {
            displayOrder: "asc",
          },
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
      } as any,
    });

    if (!item) {
      console.log("カテゴリ項目が見つかりません（または未公開）:", slug);
      return null;
    }

    console.log("カテゴリ項目取得成功:", {
      id: item.id,
      title: item.title,
      published: item.published,
      category: item.category,
    });

    // 安全なデータ変換
    const formattedItem = {
      id: item.id,
      title: item.title || "",
      slug: item.slug || "",
      content: item.content || "",
      category: item.category || "",
      published: Boolean(item.published),
      description: item.description || undefined,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
      images: ((item as any).images || []).map((img: CategoryItemImage) => ({
        id: img.id || "",
        url: img.url || "",
        altText: img.altText || undefined,
        isFeatured: Boolean(img.isFeatured),
        createdAt: img.createdAt.toISOString(),
        categoryItemId: img.categoryItemId || "",
      })),
      trivia: ((item as any).trivia || []).map(
        (trivia: CategoryItemTrivia) => ({
          id: trivia.id || "",
          title: trivia.title || "",
          content: trivia.content || "",
          contentEn: trivia.contentEn || undefined,
          category: trivia.category || "",
          tags: trivia.tags || [],
          iconEmoji: trivia.iconEmoji || undefined,
          colorTheme: trivia.colorTheme || undefined,
          displayOrder: trivia.displayOrder || 0,
          isActive: Boolean(trivia.isActive),
          createdAt: trivia.createdAt.toISOString(),
          updatedAt: trivia.updatedAt.toISOString(),
          categoryItemId: trivia.categoryItemId || "",
        })
      ),
    };

    return formattedItem;
  } catch (error) {
    console.error("カテゴリ項目取得エラー詳細:", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      slug,
    });
    return null;
  }
};

export async function generateStaticParams() {
  try {
    const items = await prisma.categoryItem.findMany({
      where: { published: true },
      select: { slug: true },
    });

    if (!items || items.length === 0) {
      console.log("静的パス生成: 公開済みのカテゴリ項目が見つかりません。");
      return [];
    }

    const paths = items.map((item) => ({
      slug: item.slug,
    }));

    console.log(
      `静的パス生成: ${paths.length}件のカテゴリ項目パスを生成します。`
    );
    return paths;
  } catch (error) {
    console.error("静的パス生成中にエラーが発生しました:", error);
    return [];
  }
}

// 本番環境用（キャッシュあり）
const getCategoryItemBySlugProd = unstable_cache(
  getCategoryItemData,
  ["category-item-by-slug"],
  {
    revalidate: 300,
    tags: ["category-item"],
  }
);

// 開発環境用（キャッシュなし）
const getCategoryItemBySlugDev = getCategoryItemData;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const slug = decodeURIComponent(params.slug);
    console.log("メタデータ生成開始:", slug);

    const item =
      process.env.NODE_ENV === "development"
        ? await getCategoryItemBySlugDev(slug)
        : await getCategoryItemBySlugProd(slug);

    if (!item) {
      console.log(
        "メタデータ生成: カテゴリ項目が見つかりません（または未公開）"
      );
      return {
        title: "Item not found | Your Secret Japan",
        description:
          "The item you're looking for does not exist or is not published.",
      };
    }

    const featuredImage = (item as any).images?.find(
      (img: CategoryItemImage) => img.isFeatured
    );
    const imageUrl = featuredImage?.url || "/ogp-image.png";

    const baseDescription =
      item.description ||
      item.content?.substring(0, 155) ||
      "Discover the spirit of Japan.";

    console.log("メタデータ生成成功:", item.title);

    return {
      title: `${item.title} | Your Secret Japan`,
      description: baseDescription,
      openGraph: {
        title: `${item.title} | Your Secret Japan`,
        description: baseDescription,
        url: `https://www.yoursecretjapan.com/category-item/${item.slug}`,
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: item.title,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: `${item.title} | Your Secret Japan`,
        description: baseDescription,
        images: [imageUrl],
      },
      keywords: [
        item.category,
        "Japanese culture",
        "Japanese gods",
        "Japan",
      ].join(", "),
    };
  } catch (error) {
    console.error("メタデータ生成エラー:", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return {
      title: "Error | Your Secret Japan",
      description: "An error occurred while loading this item.",
    };
  }
}

export default async function Page({ params }: Props) {
  try {
    const slug = decodeURIComponent(params.slug);
    console.log("ページレンダリング開始:", slug);

    const item =
      process.env.NODE_ENV === "development"
        ? await getCategoryItemBySlugDev(slug)
        : await getCategoryItemBySlugProd(slug);

    if (!item) {
      console.log(
        "ページレンダリング: カテゴリ項目が見つからないためnotFound()を呼び出し"
      );
      return notFound();
    }

    // 公開済みチェック（念のため）
    if (!item.published) {
      console.log(
        "ページレンダリング: カテゴリ項目が未公開のためnotFound()を呼び出し"
      );
      return notFound();
    }

    // 動的なパンくずリストのアイテムを生成
    const categoryLabel =
      BREADCRUMB_CONFIG.categories[
        item.category as keyof typeof BREADCRUMB_CONFIG.categories
      ] || item.category;
    const truncatedTitle =
      item.title.length > 20 ? `${item.title.substring(0, 20)}...` : item.title;
    const breadcrumbItems = [
      { label: "Home", href: "/" },
      { label: categoryLabel, href: `/${item.category}` },
      {
        label: truncatedTitle,
        href: `/category-item/${item.slug}`,
        isCurrentPage: true,
      },
    ];

    const featuredImage = (item as any).images?.find(
      (img: CategoryItemImage) => img.isFeatured
    );
    const imageUrl = featuredImage?.url || "/ogp-image.png";

    // 構造化データ生成（記事と同じ構造）
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: item.title,
      description: item.description || item.content?.substring(0, 200) || "",
      image: imageUrl.startsWith("http")
        ? imageUrl
        : `https://www.yoursecretjapan.com${imageUrl}`,
      author: {
        "@type": "Person",
        name: "Your Secret Japan",
      },
      publisher: {
        "@type": "Organization",
        name: "Your Secret Japan",
        logo: {
          "@type": "ImageObject",
          url: "https://www.yoursecretjapan.com/logo.png",
        },
      },
      datePublished: item.createdAt,
      dateModified: item.updatedAt,
      about: [
        {
          "@type": "Thing",
          name: item.category,
        },
        {
          "@type": "Thing",
          name: "Japanese Culture",
        },
      ],
      keywords: [item.category, "Japanese culture", "Japan"].join(", "),
    };

    // SEO: パンくずリスト用の構造化データ
    const breadcrumbJsonLd = generateBreadcrumbStructuredData(breadcrumbItems);

    console.log("ページレンダリング成功:", {
      title: item.title,
      published: item.published,
      category: item.category,
    });

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
        <div className="container mx-auto px-4">
          <Breadcrumb customItems={breadcrumbItems} />
        </div>
        <CategoryItemClient item={item} />
      </>
    );
  } catch (error) {
    console.error("ページレンダリングエラー:", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return notFound();
  }
}
