// components/articlePageComponents/articleDetailLayout/ArticleDetailLayout.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { WhiteLine } from "@/components/whiteLine/whiteLine";
import { OptimizedImage } from "@/components/ui/optimizedImage";
import type { DisplayDoc } from "@/types/slugDisplay";
import "@/app/styles/japanese-style-modern.css";

import { ContentWithTrivia } from "@/components/trivia/ContentWithTrivia";
import { preprocessImageSyntax, separateTriviaFromMarkdown } from "@/app/utils/markdownPreprocess";
import ArticleDetailClient from "../articleDetailClient/ArticleDetailClient";

const HEADER_OFFSET = 120;

export default function ArticleDetailLayout({
  doc,
  sidebar,
  backHref,
  backLabel,
}: {
  doc: DisplayDoc;
  sidebar?: React.ReactNode;
  backHref: string;
  backLabel: string;
}) {
  // ✅ server で日付整形
  const displayDate = (() => {
    try {
      const date = new Date(doc.updatedAt);
      return date.toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "";
    }
  })();

  const allTrivia = doc.trivia ?? [];
  const activeTrivia = allTrivia.filter((t) => t.isActive);

  // ✅ ToC用 markdown（server）
  const tocSourceMarkdown = (() => {
    const pre = preprocessImageSyntax(doc.content);
    const { markdownContent } = separateTriviaFromMarkdown(pre, activeTrivia);
    return markdownContent.replace(/<!--\s*TRIVIA_\d+\s*-->/g, "");
  })();

  const featuredImage =
    doc.images?.find((img) => img.isFeatured)?.url ?? "/fallback.jpg";
  const hasFeaturedImage = Boolean(doc.images?.some((img) => img.isFeatured));

  return (
    <div className="min-h-screen article-page-container">
      <div className="container mx-auto px-4 pb-8 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 lg:w-[70%] min-w-0">
            <div className="japanese-style-modern">
              <div className="japanese-style-modern-header">
                <h1 className="japanese-style-modern-title">{doc.title}</h1>
                <div className="japanese-style-modern-date">{displayDate}</div>
              </div>
                {hasFeaturedImage && (
                  <div className="mb-8 px-4 flex justify-center">
                    <div className="w-[min(400px,100%)]">
                      <OptimizedImage
                        src={featuredImage}
                        alt={doc.title}
                        priority
                        width={400}
                        height={400}
                        sizes="(max-width: 768px) 100vw, 400px"
                        className="rounded-lg"
                      />
                    </div>
                  </div>
                )}

              {/* ✅ ToCは client に渡して追従だけ client でやる */}
              <ArticleDetailClient
                containerSelector=".japanese-style-modern-content"
                headerOffset={HEADER_OFFSET}
                depsKey={tocSourceMarkdown}
              />

              <div className="japanese-style-modern-container">
                <div className="japanese-style-modern-content max-w-none">
                  <div className="prose prose-lg prose-invert max-w-none overflow-hidden">
                    <ContentWithTrivia content={doc.content} triviaList={allTrivia} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {sidebar ? (
            <div className="lg:w-[30%] flex-shrink-0">
              <div
                className="sticky self-start mt-8"
                style={{ top: "calc(var(--header-h, 72px) + 16px)" }}
              >
                {sidebar}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-16 mb-16 flex justify-center px-4 sm:px-6">
        <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm py-12 px-6 sm:px-10 flex flex-col items-center gap-6">
          <Link href={backHref}>
            <Button
              size="lg"
              className="min-w-[320px] min-h-12 px-6 py-3 flex items-center justify-center text-center leading-snug font-semibold tracking-wide border border-[#c96a5d] bg-[#c96a5d] text-[#f3f3f2] hover:brightness-110 hover:-translate-y-[1px] transition-all duration-200 shadow-md hover:shadow-lg group"
            >
              {backLabel}
              <span className="ml-2 inline-block transition-transform duration-200 group-hover:translate-x-1">
                →
              </span>
            </Button>
          </Link>

          <Link href="/all-articles">
            <Button
              size="lg"
              className="min-w-[240px] h-12 flex items-center justify-center leading-none font-semibold tracking-wide border border-[#c96a5d] bg-[#c96a5d] text-[#f3f3f2] hover:brightness-110 hover:-translate-y-[1px] transition-all duration-200 shadow-md hover:shadow-lg group"
            >
              View All Articles
              <span className="ml-2 inline-block transition-transform duration-200 group-hover:translate-x-1">
                →
              </span>
            </Button>
          </Link>
        </div>
      </div>

      <WhiteLine />
    </div>
  );
}
