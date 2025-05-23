// app/articles/[slug]/page.tsx
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ArticleClientPage from "../../../components/articleClientPage/ArticleClientPage";
import Script from "next/script";
import { unstable_cache } from "next/cache";

type Props = {
  params: { slug: string };
};

// ⭐ データ取得を一元化（重複クエリ解消）
const getArticleBySlug = unstable_cache(
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
  ["article-by-slug"], // キャッシュキー
  {
    revalidate: 3600, // 1時間キャッシュ
    tags: ["article"], // タグベースの無効化
  }
);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = decodeURIComponent(params.slug);

  // ⭐ キャッシュされたデータ取得関数を使用
  const article = await getArticleBySlug(slug);

  if (!article) {
    return {
      title: "Article not found | Your Secret Japan",
      description: "The article you're looking for does not exist.",
    };
  }

  // ⭐ 画像取得を最適化
  const featuredImage = article.images.find((img) => img.isFeatured);
  const imageUrl = featuredImage?.url || "/ogp-image.png";

  return {
    title: `${article.title} | Your Secret Japan`,
    description: article.description || "Discover the spirit of Japan.",
    openGraph: {
      title: `${article.title} | Your Secret Japan`,
      description: article.description || "",
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

  // ⭐ 同じキャッシュされたデータ取得関数を使用（重複クエリなし）
  const article = await getArticleBySlug(slug);

  if (!article) return notFound();

  // ⭐ 画像取得を最適化
  const featuredImage = article.images.find((img) => img.isFeatured);
  const imageUrl = featuredImage?.url || "/ogp-image.png";

  // ⭐ JSON-LD生成を最適化（日付変換を安全に処理）
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
        strategy="afterInteractive" // ⭐ 読み込み戦略を最適化
      />
      <ArticleClientPage article={article} />
    </>
  );
}

// ⭐ 静的パラメータ生成（オプション - 人気記事のみ）
// export async function generateStaticParams() {
//   const articles = await prisma.article.findMany({
//     where: { published: true },
//     select: { slug: true },
//     take: 50, // 人気記事50件のみ事前生成
//   });
//
//   return articles.map((article) => ({
//     slug: article.slug,
//   }));
// }
