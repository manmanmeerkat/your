// app/articles/[slug]/page.tsx
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ArticleClientPage from "../../../components/articleClientPage/ArticleClientPage"
import Script from "next/script";

type Props = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = decodeURIComponent(params.slug);

  const article = await prisma.article.findFirst({
    where: { slug },
    include: { images: true },
  });

  if (!article) {
    return {
      title: "Article not found | Your Secret Japan",
      description: "The article you're looking for does not exist.",
    };
  }

  return {
    title: `${article.title} | Your Secret Japan`,
    description: article.description || "Discover the spirit of Japan.",
    openGraph: {
      title: `${article.title} | Your Secret Japan`,
      description: article.description || "",
      url: `https://www.yoursecretjapan.com/articles/${article.slug}`,
      images: [
        {
          url: article.images.find((img) => img.isFeatured)?.url || "/ogp-image.png",
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
      images: [
        article.images.find((img) => img.isFeatured)?.url || "/ogp-image.png"
      ],
    },
  };
}

export default async function Page({ params }: Props) {
  const slug = decodeURIComponent(params.slug);

  const article = await prisma.article.findFirst({
    where: { slug },
    include: { images: true },
  });

  if (!article) return notFound();

  const featuredImage =
    article.images.find((img) => img.isFeatured)?.url || "/ogp-image.png";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "description": article.summary || "",
    "image": `https://www.yoursecretjapan.com${featuredImage}`,
    "author": {
      "@type": "Person",
      "name": "Your Secret Japan"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Your Secret Japan",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.yoursecretjapan.com/logo.png"
      }
    },
    "datePublished": article.createdAt.toISOString(),
    "dateModified": article.updatedAt.toISOString()
  };

  return (
    <>
      <Script
        id="json-ld-article"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ArticleClientPage article={article} />
    </>
  );
}