"use client";

import { useCallback, useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { WhiteLine } from "@/components/whiteLine/whiteLine";
import { OptimizedImage } from "@/components/ui/optimizedImage";
import { TableOfContents } from "@/components/ui/tableOfContents";
import { useToc } from "@/app/hooks/useToc";
import { useActiveHeading } from "@/app/hooks/useActiveHeading";
import type { DisplayDoc } from "@/types/slugDisplay";
import "@/app/styles/japanese-style-modern.css";
import { ContentWithTrivia } from "@/components/trivia/ContentWithTrivia";
import {
  preprocessImageSyntax,
  separateTriviaFromMarkdown,
} from "@/app/utils/markdownPreprocess";

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
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [tocMounted, setTocMounted] = useState(false);

  useEffect(() => {
    setTocMounted(true);
  }, []);

  const activeTrivia = useMemo(
    () => doc.trivia?.filter((t) => t.isActive) ?? [],
    [doc.trivia]
  );

  const tocSourceMarkdown = useMemo(() => {
    const pre = preprocessImageSyntax(doc.content);
    const { markdownContent } = separateTriviaFromMarkdown(pre, activeTrivia);
    return markdownContent.replace(/<!--\s*TRIVIA_\d+\s*-->/g, "");
  }, [doc.content, activeTrivia]);

  const tableOfContents = useToc(tocSourceMarkdown);

  const { activeId, scrollToHeading } = useActiveHeading(tocSourceMarkdown, {
    containerSelector: ".japanese-style-modern-content",
    headerOffset: HEADER_OFFSET,
  });

  const renderedContent = useMemo(() => {
  return <ContentWithTrivia content={doc.content} triviaList={activeTrivia} />;
}, [doc.content, activeTrivia]);

  const featuredImage = useMemo(() => {
    return doc.images?.find((img) => img.isFeatured)?.url ?? "/fallback.jpg";
  }, [doc.images]);

  const hasFeaturedImage = useMemo(() => {
    return Boolean(doc.images?.some((img) => img.isFeatured));
  }, [doc.images]);

  const formatDisplayDate = useCallback((dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "";
    }
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const y = document.scrollingElement?.scrollTop ?? 0;
      setShowScrollTop(y > 300);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = useCallback(() => {
    (document.scrollingElement as HTMLElement)?.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  return (
    <div className="min-h-screen article-page-container">
      <div className="container mx-auto px-4 pb-8 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* ===== メイン ===== */}
          <div className="flex-1 lg:w-[70%] min-w-0">
            <div className="japanese-style-modern">
              <div className="japanese-style-modern-header">
                <h1 className="japanese-style-modern-title">{doc.title}</h1>
                <div className="japanese-style-modern-date">
                  {formatDisplayDate(doc.updatedAt)}
                </div>
              </div>
              
              {hasFeaturedImage && (
                <div className="w-full mb-6 px-6">
                  <div className="mx-auto w-full max-w-[420px]">
                    <div className="relative aspect-square w-full overflow-hidden rounded-md">
                      <OptimizedImage
                        src={featuredImage}
                        alt={doc.title}
                        priority
                        width={400}
                        height={400}
                      />
                    </div>
                  </div>
                </div>
              )}

              {tableOfContents.length > 0 && (
                tocMounted ? (
                  <TableOfContents
                    items={tableOfContents}
                    activeId={activeId}
                    onClickItem={scrollToHeading}
                  />
                ) : (
                  // ★ ToCが出る場所に “同じくらいの高さ” を先に確保
                  <div className="mx-6 mb-8 rounded-2xl border border-white/10 bg-white/5"
                      style={{ height: 380 }} />
                )
              )}

              <div className="japanese-style-modern-container">
                <div className="japanese-style-modern-content max-w-none">
                  <div className="prose prose-lg prose-invert max-w-none overflow-hidden">
                    {renderedContent}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ===== サイドバー（差し替え） ===== */}
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

      {/* ===== フッターボタン（差し替え可能） ===== */}
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

      {showScrollTop && (
        <Button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 z-50"
          aria-label="ページトップへ戻る"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="w-6 h-6 mx-auto"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 15l7-7 7 7"
            />
          </svg>
        </Button>
      )}
    </div>
  );
}
