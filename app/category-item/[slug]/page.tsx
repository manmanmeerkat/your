// app/category-item/[slug]/page.tsx
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import { notFound } from "next/navigation";
import Link from "next/link";
import { processMarkdown } from "@/lib/markdown";
import { Button } from "@/components/ui/button";
import { WhiteLine } from "@/components/whiteLine/whiteLine";
import { CATEGORY_CONFIG } from "@/constants/constants";
import { BackToHomeBtn } from "@/components/backToHomeBtn/BackToHomeBtn";

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

  const sectionId = item.category; 
  const returnPath = CATEGORY_CONFIG[item.category]?.path || "/";
  const label = CATEGORY_CONFIG[item.category]?.label || "Category";

  return (
    <>
      {/* ヒーロー画像 */}
      {item.images && item.images[0] && (
        <div className="w-full bg-slate-950 overflow-hidden pt-8">
          <div className="relative w-full max-w-[400px] mx-auto">
            <Image
              src={item.images[0].url}
              alt={item.images[0].altText || item.title}
              width={400}
              height={400}
              className="w-full h-auto object-contain rounded-[5px]"
              priority
            />
          </div>
        </div>
      )}
      <WhiteLine />

      {/* メインコンテンツ */}
      <article className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* タイトル */}
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-white">{item.title}</h1>

          {/* Markdownコンテンツ */}
          {contentHtml && (
            <div
              className="prose prose-lg prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: contentHtml }}
            />
          )}
        </div>
      </article>

      {/* ナビゲーションボタン */}
      <div className="flex flex-col justify-center items-center mt-8 gap-8 px-4">
        <Link href={`${returnPath}#${sectionId}`}>
          <Button
            size="lg"
            className="
            font-normal
            border border-rose-700 bg-rose-700 text-white
            hover:bg-white hover:text-rose-700 hover:border-rose-700 hover:font-bold
            shadow hover:shadow-lg
            whitespace-normal sm:whitespace-nowrap
            w-full
            "
          >
            Back to {label} ≫
          </Button>
        </Link>
        <BackToHomeBtn/>
        {/* <Link href="/all-articles">
          <Button className="w-[220px] border border-rose-700 bg-rose-700 text-white hover:bg-white hover:text-rose-700">
            View all posts ≫
          </Button>
        </Link> */}
      </div>
      <WhiteLine />
    </>
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
