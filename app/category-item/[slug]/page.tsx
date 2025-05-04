// app/category-item/[slug]/page.tsx
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import { notFound } from "next/navigation";
import Link from "next/link";
import { processMarkdown } from "@/lib/markdown";

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

  // MarkdownをHTMLに変換
  const contentHtml = item.content ? processMarkdown(item.content) : "";

  // カテゴリに対応する戻り先パスの設定
  const returnPaths: Record<string, string> = {
    "about-japanese-gods": "/mythology",
    "japanese-culture-category": "/culture",
    "seasonal-festivals": "/festivals",
    "japanese-way-of-life": "/customs",
  };

  const returnPath = returnPaths[item.category] || "/";

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* ヘッダー・ナビゲーション */}
      <div className="py-6 border-b border-slate-800">
        <div className="container mx-auto px-4">
          <Link
            href={returnPath}
            className="inline-flex items-center text-slate-400 hover:text-white transition-colors"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back
          </Link>
        </div>
      </div>

      {/* メインコンテンツ */}
      <article className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* 画像 */}
          {item.images && item.images[0] && (
            <div className="mb-6 flex justify-center">
              <div className="relative w-[300px] h-[200px] rounded-lg overflow-hidden">
                <Image
                  src={item.images[0].url}
                  alt={item.images[0].altText || item.title}
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>
          )}

          {/* タイトル */}
          <h1 className="text-4xl md:text-5xl font-bold mb-8">{item.title}</h1>

          {/* Markdownコンテンツ */}
          {contentHtml && (
            <div
              className="prose prose-lg prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: contentHtml }}
            />
          )}
        </div>
      </article>
    </div>
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
