// lib/seo/articleSeo.ts
import type { Metadata } from "next";
import type { ArticleDTO } from "@/components/articlePageComponents/getArticleBySlug/getArticleBySlug";

export function getFeaturedImage(article: ArticleDTO) {
  return article.images?.find((i) => i.isFeatured)?.url || "/ogp-image.png";
}

export function toAbsoluteUrl(pathOrUrl: string) {
  if (!pathOrUrl) return "https://www.yoursecretjapan.com/ogp-image.png";
  return pathOrUrl.startsWith("http")
    ? pathOrUrl
    : `https://www.yoursecretjapan.com${pathOrUrl}`;
}

export function buildArticleDescription(article: ArticleDTO) {
  const base = article.summary || "Discover the spirit of Japan.";
  const triviaCount = article.trivia?.length || 0;
  return triviaCount > 0 ? `${base} Includes ${triviaCount} trivia.` : base;
}

export function buildArticleMetadata(article: ArticleDTO): Metadata {
  const image = getFeaturedImage(article);
  const description = buildArticleDescription(article);

  return {
    title: `${article.title} | Your Secret Japan`,
    description,
    openGraph: {
      title: `${article.title} | Your Secret Japan`,
      description,
      url: `https://www.yoursecretjapan.com/articles/${article.slug}`,
      images: [
        {
          url: toAbsoluteUrl(image),
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${article.title} | Your Secret Japan`,
      description,
      images: [toAbsoluteUrl(image)],
    },
    keywords:
      article.trivia?.flatMap((t) => t.tags || []).join(", ") || undefined,
  };
}

export function buildArticleJsonLd(article: ArticleDTO) {
  const image = toAbsoluteUrl(getFeaturedImage(article));

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.summary || "",
    image,
    author: { "@type": "Person", name: "Your Secret Japan" },
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
    ...(article.trivia?.length
      ? {
          mainEntity: {
            "@type": "FAQPage",
            mainEntity: article.trivia.slice(0, 5).map((t) => ({
              "@type": "Question",
              name: t.title || "Trivia",
              acceptedAnswer: {
                "@type": "Answer",
                text: (t.content || "").replace(/\*\*|__/g, "").slice(0, 200),
              },
            })),
          },
        }
      : {}),
    keywords: [
      article.category,
      ...(article.trivia?.flatMap((t) => t.tags || []).slice(0, 10) || []),
    ]
      .filter(Boolean)
      .filter((v, i, a) => a.indexOf(v) === i)
      .join(", "),
  };
}
