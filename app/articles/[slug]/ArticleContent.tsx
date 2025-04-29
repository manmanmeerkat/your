// app/articles/[slug]/ArticleContent.tsx
"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { WhiteLine } from "@/components/whiteLine/whiteLine";
import { CATEGORY_LABELS } from "@/constants/constants";

// 記事の型定義
type Image = {
  id: string;
  url: string;
  altText: string | null;
  isFeatured: boolean;
};

type Article = {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  content: string;
  category: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  images: Image[];
};

interface ArticleContentProps {
  article: Article;
  renderedContent: {
    isMarkdown: boolean;
    html: string;
  };
}

export default function ArticleContent({
  article,
  renderedContent,
}: ArticleContentProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  // 外部リンクを新しいタブで開くように設定
  useEffect(() => {
    if (contentRef.current) {
      const links = contentRef.current.querySelectorAll("a");
      links.forEach((link) => {
        if (link.hostname !== window.location.hostname) {
          link.setAttribute("target", "_blank");
          link.setAttribute("rel", "noopener noreferrer");
        }
      });
    }
  }, []);

  // 記事表示
  return (
    <div className="bg-slate-950 min-h-screen">
      {/* ヒーローセクション：アイキャッチ画像 */}
      {article.images && article.images.some((img) => img.isFeatured) && (
        <div className="w-full bg-slate-950 overflow-hidden pt-8">
          <div className="relative max-h-[400px] w-full flex justify-center">
            <Image
              src={article.images.find((img) => img.isFeatured)?.url || ""}
              alt={article.title}
              width={800}
              height={400}
              priority
              quality={85}
              placeholder="blur"
              blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
              className="h-auto max-h-[400px] object-contain rounded-[5px]"
            />
          </div>
          <WhiteLine />
        </div>
      )}

      {/* 記事コンテンツ */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* 記事ヘッダー */}
          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              {article.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <span className="bg-blue-50 text-slate-950 px-3 py-1 rounded-full">
                {article.category}
              </span>
            </div>
          </header>

          {/* 記事本文 - サーバーサイドでレンダリング済みのコンテンツを表示 */}
          <div
            ref={contentRef}
            className={`prose prose-lg max-w-none mb-12 article-content text-white text-justify ${
              renderedContent.isMarkdown ? "markdown-content" : ""
            }`}
          >
            <div dangerouslySetInnerHTML={{ __html: renderedContent.html }} />
          </div>
        </div>
      </div>
      <div className="flex flex-col justify-center items-center mt-8 gap-8">
        <Link href={`/${article.category}`}>
          <Button
            size="lg"
            className="w-[320px] font-normal
                      border border-rose-700 bg-rose-700 text-white
                      hover:bg-white hover:text-rose-700 hover:border-rose-700 hover:font-bold
                      shadow hover:shadow-lg"
          >
            Back to {CATEGORY_LABELS[article.category]} Posts ≫
          </Button>
        </Link>
        <Link href="/all-articles">
          <Button
            size="lg"
            className="w-[220px] font-normal
                      border border-rose-700 bg-rose-700 text-white
                      hover:bg-white hover:text-rose-700 hover:border-rose-700 hover:font-bold
                      shadow hover:shadow-lg"
          >
            View all posts ≫
          </Button>
        </Link>
      </div>
      <WhiteLine />
    </div>
  );
}
