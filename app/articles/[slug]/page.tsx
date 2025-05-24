// app/articles/[slug]/page.tsx - 即座反映版
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ArticleClientPage from "../../../components/articleClientPage/ArticleClientPage";
import Script from "next/script";
import { unstable_cache } from "next/cache";

type Props = {
  params: { slug: string };
};

// ⭐ 本番環境用（適度なキャッシュ）
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
      },
    });
  },
  ["article-by-slug"],
  {
    revalidate: 300, // 本番では5分キャッシュ
    tags: ["article"],
  }
);

// ⭐ 開発環境用（キャッシュなし）
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

  return {
    title: `${article.title} | Your Secret Japan`,
    description: article.summary || "Discover the spirit of Japan.",
    openGraph: {
      title: `${article.title} | Your Secret Japan`,
      description: article.summary || "",
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
      description: article.summary || "",
      images: [imageUrl],
    },
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
  };

  return (
    <>
      <Script
        id="json-ld-article"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        strategy="afterInteractive"
      />
      <ArticleClientPage article={article} />
    </>
  );
}

// ⭐ 開発環境では動的レンダリングを強制
export const dynamic = "force-dynamic";
export const revalidate = 0;
