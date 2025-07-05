// app/articles/[slug]/page.tsx - UUID対応 & エラー修正版
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ArticleClientPage from "../../../components/articleClientPage/ArticleClientPage";
import Script from "next/script";
import { unstable_cache } from "next/cache";
import { TriviaCategoryType, TriviaColorThemeType } from "@/types/types";
import { Breadcrumb } from "@/components/breadcrumb";
import {
  BREADCRUMB_CONFIG,
  generateBreadcrumbStructuredData,
} from "@/components/breadcrumb/config";

type Props = {
  params: { slug: string };
};

// 安全なデータ取得関数（エラーハンドリング強化）
const getArticleData = async (slug: string) => {
  try {
    console.log("記事取得開始:", slug);

    const article = await prisma.article.findFirst({
      where: {
        slug,
        published: true, // 公開済みの記事のみを取得
      },
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

    if (!article) {
      console.log("記事が見つかりません（または未公開）:", slug);
      return null;
    }

    console.log("記事取得成功:", {
      id: article.id,
      title: article.title,
      published: article.published,
      triviaCount: article.trivia?.length || 0,
    });

    // 🔧 安全なデータ変換
    const formattedArticle = {
      id: article.id,
      title: article.title || "",
      slug: article.slug || "",
      summary: article.summary || null,
      content: article.content || "",
      category: article.category || "",
      published: Boolean(article.published),
      description: article.description || null,
      createdAt: article.createdAt,
      updatedAt: article.updatedAt,
      images: (article.images || []).map((img) => ({
        id: img.id || "",
        url: img.url || "",
        altText: img.altText || null,
        isFeatured: Boolean(img.isFeatured),
        createdAt: img.createdAt,
        articleId: img.articleId || "",
      })),
      trivia: (article.trivia || []).map((t) => ({
        id: t.id || "",
        title: t.title || "",
        content: t.content || "",
        contentEn: t.contentEn || null,
        category: (t.category || "default") as TriviaCategoryType,
        tags: Array.isArray(t.tags) ? t.tags : [],
        iconEmoji: t.iconEmoji || null,
        colorTheme: (t.colorTheme || null) as TriviaColorThemeType | null,
        displayOrder: Number(t.displayOrder) || 0,
        isActive: Boolean(t.isActive),
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
        articleId: article.id,
      })),
    };

    return formattedArticle;
  } catch (error) {
    console.error("記事取得エラー詳細:", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      slug,
    });
    return null;
  }
};

export async function generateStaticParams() {
  try {
    const articles = await prisma.article.findMany({
      where: { published: true },
      select: { slug: true },
    });

    if (!articles || articles.length === 0) {
      console.log("静的パス生成: 公開済みの記事が見つかりません。");
      return [];
    }

    const paths = articles.map((article) => ({
      slug: article.slug,
    }));

    console.log(`静的パス生成: ${paths.length}件の記事パスを生成します。`);
    // console.log(paths); // デバッグ用にパス一覧を出力

    return paths;
  } catch (error) {
    console.error("静的パス生成中にエラーが発生しました:", error);
    // エラーが発生した場合は空の配列を返し、ビルドを続行させる
    return [];
  }
}

// 本番環境用（キャッシュあり）
const getArticleBySlugProd = unstable_cache(
  getArticleData,
  ["article-by-slug"],
  {
    revalidate: 300,
    tags: ["article", "trivia"],
  }
);

// 開発環境用（キャッシュなし）
const getArticleBySlugDev = getArticleData;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const slug = decodeURIComponent(params.slug);
    console.log("メタデータ生成開始:", slug);

    const article =
      process.env.NODE_ENV === "development"
        ? await getArticleBySlugDev(slug)
        : await getArticleBySlugProd(slug);

    if (!article) {
      console.log("メタデータ生成: 記事が見つかりません（または未公開）");
      return {
        title: "Article not found | Your Secret Japan",
        description:
          "The article you're looking for does not exist or is not published.",
      };
    }

    const featuredImage = article.images?.find((img) => img.isFeatured);
    const imageUrl = featuredImage?.url || "/ogp-image.png";

    const triviaCount = article.trivia?.length || 0;
    const baseDescription = article.summary || "Discover the spirit of Japan.";
    const enhancedDescription =
      triviaCount > 0
        ? `${baseDescription} ${triviaCount}つの豆知識も含まれています。`
        : baseDescription;

    console.log("メタデータ生成成功:", article.title);

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
      keywords:
        article.trivia?.flatMap((t) => t.tags || []).join(", ") || undefined,
    };
  } catch (error) {
    console.error("メタデータ生成エラー:", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return {
      title: "Error | Your Secret Japan",
      description: "An error occurred while loading this article.",
    };
  }
}

export default async function Page({ params }: Props) {
  try {
    const slug = decodeURIComponent(params.slug);
    console.log("ページレンダリング開始:", slug);

    const article =
      process.env.NODE_ENV === "development"
        ? await getArticleBySlugDev(slug)
        : await getArticleBySlugProd(slug);

    if (!article) {
      console.log(
        "ページレンダリング: 記事が見つからないためnotFound()を呼び出し"
      );
      return notFound();
    }

    // 公開済みチェック（念のため）
    if (!article.published) {
      console.log("ページレンダリング: 記事が未公開のためnotFound()を呼び出し");
      return notFound();
    }

    // 動的なパンくずリストのアイテムを生成
    const categoryLabel =
      BREADCRUMB_CONFIG.categories[
        article.category as keyof typeof BREADCRUMB_CONFIG.categories
      ] || article.category;
    const truncatedTitle =
      article.title.length > 20
        ? `${article.title.substring(0, 20)}...`
        : article.title;
    const breadcrumbItems = [
      { label: "Home", href: "/" },
      { label: categoryLabel, href: `/${article.category}` },
      {
        label: truncatedTitle,
        href: `/articles/${article.slug}`,
        isCurrentPage: true,
      },
    ];

    const featuredImage = article.images?.find((img) => img.isFeatured);
    const imageUrl = featuredImage?.url || "/ogp-image.png";

    // 🔧 安全な構造化データ生成
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
      datePublished: article.createdAt,
      dateModified: article.updatedAt,
      ...(article.trivia &&
        article.trivia.length > 0 && {
          mainEntity: {
            "@type": "FAQPage",
            mainEntity: article.trivia.slice(0, 5).map((trivia) => ({
              "@type": "Question",
              name: trivia.title || "Trivia",
              acceptedAnswer: {
                "@type": "Answer",
                text: (trivia.content || "")
                  .replace(/\*\*|__/g, "")
                  .substring(0, 200),
              },
            })),
          },
        }),
      about: [
        {
          "@type": "Thing",
          name: article.category,
        },
        ...(article.trivia?.slice(0, 3).map((trivia) => ({
          "@type": "Thing",
          name: trivia.category || "Culture",
        })) || []),
      ],
      keywords: [
        article.category,
        ...(article.trivia?.flatMap((t) => t.tags || []).slice(0, 10) || []),
      ]
        .filter(Boolean)
        .filter((keyword, index, array) => array.indexOf(keyword) === index) // 重複削除
        .join(", "),
    };

    // SEO: パンくずリスト用の構造化データ
    const breadcrumbJsonLd = generateBreadcrumbStructuredData(breadcrumbItems);

    console.log("ページレンダリング成功:", {
      title: article.title,
      published: article.published,
      triviaCount: article.trivia?.length || 0,
    });

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
        <div className="container mx-auto px-4">
          <Breadcrumb customItems={breadcrumbItems} />
        </div>
        <ArticleClientPage article={article} />
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
