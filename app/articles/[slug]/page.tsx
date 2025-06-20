// app/articles/[slug]/page.tsx - 一口メモ対応版
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ArticleClientPage from "../../../components/articleClientPage/ArticleClientPage";
import Script from "next/script";
import { unstable_cache } from "next/cache";

type Props = {
  params: { slug: string };
};

// ⭐ 本番環境用（適度なキャッシュ）- 一口メモ対応
const getArticleBySlugProd = unstable_cache(
  async (slug: string) => {
    return await prisma.article.findFirst({
      where: { slug },
      include: {
        images: {
          select: {
            id: true,
            url: true,
            altText: true,
            isFeatured: true,
            createdAt: true,
            articleId: true,
          },
        },
        // 🆕 一口メモも含める
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
          },
        },
      },
    });
  },
  ["article-by-slug"],
  {
    revalidate: 300, // 本番では5分キャッシュ
    tags: ["article", "trivia"], // 🆕 trivia タグも追加
  }
);

// ⭐ 開発環境用（キャッシュなし）- 一口メモ対応
const getArticleBySlugDev = async (slug: string) => {
  return await prisma.article.findFirst({
    where: { slug },
    include: {
      images: {
        select: {
          id: true,
          url: true,
          altText: true,
          isFeatured: true,
          createdAt: true,
          articleId: true,
        },
      },
      // 🆕 一口メモも含める
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
        },
      },
    },
  });
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = decodeURIComponent(params.slug);

  // ⭐ 開発環境では毎回新しいデータを取得
  const article =
    process.env.NODE_ENV === "development"
      ? await getArticleBySlugDev(slug)
      : await getArticleBySlugProd(slug);

  if (!article) {
    return {
      title: "Article not found | Your Secret Japan",
      description: "The article you're looking for does not exist.",
    };
  }

  const featuredImage = article.images.find((img) => img.isFeatured);
  const imageUrl = featuredImage?.url || "/ogp-image.png";

  // 🆕 一口メモの情報をメタデータに含める（オプション）
  const triviaCount = article.trivia?.length || 0;
  const baseDescription = article.summary || "Discover the spirit of Japan.";
  const enhancedDescription =
    triviaCount > 0
      ? `${baseDescription} ${triviaCount}つの豆知識も含まれています。`
      : baseDescription;

  return {
    title: `${article.title} | Your Secret Japan`,
    description: enhancedDescription,
    openGraph: {
      title: `${article.title} | Your Secret Japan`,
      description: enhancedDescription,
      url: `https://www.yoursecretjapan.com/articles/${article.slug}`,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${article.title} | Your Secret Japan`,
      description: enhancedDescription,
      images: [imageUrl],
    },
    // 🆕 一口メモ関連のキーワードをメタデータに追加
    keywords: article.trivia?.flatMap((t) => t.tags).join(", ") || undefined,
  };
}

export default async function Page({ params }: Props) {
  const slug = decodeURIComponent(params.slug);

  // ⭐ 開発環境では毎回新しいデータを取得
  const article =
    process.env.NODE_ENV === "development"
      ? await getArticleBySlugDev(slug)
      : await getArticleBySlugProd(slug);

  if (!article) return notFound();

  const featuredImage = article.images.find((img) => img.isFeatured);
  const imageUrl = featuredImage?.url || "/ogp-image.png";

  // 🆕 一口メモの情報も含めたStructured Data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.summary || "",
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
    datePublished: new Date(article.createdAt).toISOString(),
    dateModified: new Date(article.updatedAt).toISOString(),
    // 🆕 一口メモがある場合、追加的な構造化データ
    ...(article.trivia &&
      article.trivia.length > 0 && {
        mainEntity: {
          "@type": "FAQPage",
          mainEntity: article.trivia.map((trivia) => ({
            "@type": "Question",
            name: trivia.title,
            acceptedAnswer: {
              "@type": "Answer",
              text: trivia.content.replace(/\*\*|__/g, "").substring(0, 200), // Markdownを除去して200文字まで
            },
          })),
        },
      }),
    // 🆕 カテゴリー情報
    about: [
      {
        "@type": "Thing",
        name: article.category,
      },
      // 一口メモのカテゴリーも追加
      ...(article.trivia?.map((trivia) => ({
        "@type": "Thing",
        name: trivia.category,
      })) || []),
    ],
    // 🆕 タグ情報
    keywords: [
      article.category,
      ...(article.trivia?.flatMap((t) => t.tags) || []),
    ]
      .filter(Boolean)
      .join(", "),
  };

  // Date型をstring型に変換
  const formattedArticle = {
    ...article,
    trivia: article.trivia?.map((t) => ({
      ...t,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
    })),
  };

  return (
    <>
      <Script
        id="json-ld-article"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        strategy="afterInteractive"
      />
      <ArticleClientPage article={formattedArticle} />
    </>
  );
}

// ⭐ 静的設定（開発環境での即座反映のため）
export const dynamic = "force-dynamic";
export const revalidate = 0;
