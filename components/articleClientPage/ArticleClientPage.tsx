// app/articles/[slug]/ArticleClientPage.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { marked } from "marked";
import { Button } from "@/components/ui/button";
import { WhiteLine } from "@/components/whiteLine/whiteLine";
import { CATEGORY_LABELS } from "@/constants/constants";
import Image from "next/image";

type Image = {
    id: string;
    url: string;
    altText: string | null;
    isFeatured: boolean;
    createdAt: Date;
    articleId: string;
  };
  
  type Article = {
    id: string;
    title: string;
    slug: string;
    summary: string | null;
    description: string | null;
    content: string;
    category: string;
    published: boolean;
    createdAt: Date;
    updatedAt: Date;
    images: Image[];
  };

export default function ArticleClientPage({ article }: { article: Article }) {
  const [isMarkdown, setIsMarkdown] = useState(false);

  useEffect(() => {
    const mdPatterns = [
      /^#\s+.+$/m,
      /\*\*.+\*\*/,
      /\*.+\*/,
      /^\s*-\s+.+$/m,
      /^\s*\d+\.\s+.+$/m,
      /\[.+\]\(.+\)/,
      /!\[.+\]\(.+\)/,
    ];
    const contentIsMarkdown = mdPatterns.some((pattern) =>
      pattern.test(article.content)
    );
    setIsMarkdown(contentIsMarkdown);
  }, [article.content]);

  const renderMarkdown = (content: string) => {
    marked.setOptions({ gfm: true, breaks: true });
    return marked.parse(content);
  };

  const featuredImage = article.images.find((img) => img.isFeatured)?.url ?? "/fallback.jpg";

  return (
    <div className="bg-slate-950 min-h-screen">
      {/* Hero image */}
      {article.images?.some((img) => img.isFeatured) && (
        <div className="w-full bg-slate-950 overflow-hidden pt-8">
          <div className="relative max-h-[400px] w-full flex justify-center">
            <Image
                src={featuredImage}
                alt={article.title}
                className="h-auto max-h-[400px] object-contain rounded-[5px]"
                width={400}
                height={400}
            />
          </div>
          <WhiteLine />
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-white">{article.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <span className="bg-blue-50 text-slate-950 px-3 py-1 rounded-full">
                {CATEGORY_LABELS[article.category]}
              </span>
            </div>
          </header>

          <div
            className="prose prose-lg prose-invert max-w-none mb-12 text-white text-justify"
            dangerouslySetInnerHTML={{
                __html: isMarkdown ? renderMarkdown(article.content) : article.content,
            }}
            />
        </div>
      </div>

      <div className="flex flex-col justify-center items-center mt-8 gap-8">
        <Link href={`/${article.category}`}>
          <Button className="w-[320px] border border-rose-700 bg-rose-700 text-white hover:bg-white hover:text-rose-700">
            Back to {CATEGORY_LABELS[article.category]} Posts ≫
          </Button>
        </Link>
        <Link href="/all-articles">
          <Button className="w-[220px] border border-rose-700 bg-rose-700 text-white hover:bg-white hover:text-rose-700">
            View all posts ≫
          </Button>
        </Link>
      </div>
      <WhiteLine />
    </div>
  );
}