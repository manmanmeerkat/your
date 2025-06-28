// components/articleClientPage/ArticleClientPage.tsx - 型修正版（リファクタリング済み）
"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { WhiteLine } from "@/components/whiteLine/whiteLine";
import { CATEGORY_LABELS } from "@/constants/constants";
import { TableOfContents } from "@/components/japanese-style/TableOfContents";
import { FloatingButtons } from "@/components/japanese-style/FloatingButtons";
import RelatedArticles from "@/components/sidebar/RelatedArticles";
import Redbubble from "../redBubble/RedBubble";
import { ContentWithTrivia } from "@/components/trivia/ContentWithTrivia";

import type { Article, ArticleTrivia } from "@/types/types";

import "@/app/styles/japanese-style-modern.css";

export type TocItem = {
  id: string;
  text: string;
  level: number;
};

interface ArticleClientPageProps {
  article: Article;
}

const OptimizedImage = ({
  src,
  alt,
  className,
  priority = false,
  width = 800,
  height = 400,
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  width?: number;
  height?: number;
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [shouldShowLoader, setShouldShowLoader] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShouldShowLoader(false), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
    setShouldShowLoader(true);
    const timer = setTimeout(() => setShouldShowLoader(false), 100);
    return () => clearTimeout(timer);
  }, [src]);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    setShouldShowLoader(false);
  }, []);

  const handleError = useCallback(() => {
    setHasError(true);
    setIsLoaded(false);
    setShouldShowLoader(false);
  }, []);

  if (hasError) {
    return (
      <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg p-8 text-center text-gray-500 flex items-center justify-center min-h-[200px]">
        <div>Failed to load image.</div>
      </div>
    );
  }

  return (
    <div className="relative">
      {shouldShowLoader && !isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 animate-pulse rounded-lg flex items-center justify-center z-10 min-h-[200px]">
          <div className="text-gray-400">Loading...</div>
        </div>
      )}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        unoptimized
        className={`transition-opacity duration-500 ${isLoaded ? "opacity-100" : "opacity-0"} max-w-full h-auto rounded-lg shadow-lg ${className || ""}`}
        priority={priority}
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  );
};

const safeId = (text: unknown): string => {
  if (typeof text !== "string") {
    return `heading-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }
  return text.toLowerCase().replace(/[^\w぀-ゟ゠-ヿ一-龯]+/g, "-");
};

const extractHeaders = (content: string): TocItem[] => {
  const headingRegex = /^(#{1,3})\s+(.+)$/gm;
  const headers: TocItem[] = [];
  let match;
  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    headers.push({ id: safeId(text), text, level });
  }
  return headers;
};

const ArticleClientPage: React.FC<ArticleClientPageProps> = ({ article }) => {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [showMobileToc, setShowMobileToc] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);

  const tableOfContents = useMemo(() => extractHeaders(article.content), [article.content]);

  const renderedContent = useMemo(() => {
    const activeTrivia = article.trivia?.filter((t: ArticleTrivia) => t.isActive) || [];
    return <ContentWithTrivia content={article.content} triviaList={activeTrivia} />;
  }, [article.content, article.trivia]);

  const handleScroll = useCallback(() => {
    if (typeof window === "undefined") return;

    setShowScrollTop(window.scrollY > 300);

    if (tableOfContents.length > 0) {
      const headings = document.querySelectorAll(".japanese-style-modern-section h1[id], .japanese-style-modern-section h2[id], .japanese-style-modern-section h3[id]");
      if (!headings.length) return;

      const currentScrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const headerOffset = 120;
      const viewportCenter = currentScrollY + windowHeight / 3;

      let activeId = "";
      let closestDistance = Infinity;

      headings.forEach((heading) => {
        const rect = heading.getBoundingClientRect();
        const elementTop = rect.top + currentScrollY;
        const distance = Math.abs(elementTop - viewportCenter);

        if (elementTop <= currentScrollY + headerOffset && distance < closestDistance) {
          closestDistance = distance;
          activeId = heading.id;
        }
      });

      if (currentScrollY + windowHeight >= documentHeight - 100) {
        const lastHeading = headings[headings.length - 1];
        if (lastHeading) activeId = lastHeading.id;
      }

      if (currentScrollY < 200 && headings[0]) {
        activeId = headings[0].id;
      }

      if (activeId !== activeSection) {
        setActiveSection(activeId);
      }
    }
  }, [tableOfContents.length, activeSection]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleScrollEvent = () => handleScroll();
    window.addEventListener("scroll", handleScrollEvent, { passive: true });
    window.addEventListener("resize", handleScrollEvent);
    const timer = setTimeout(handleScrollEvent, 100);
    return () => {
      window.removeEventListener("scroll", handleScrollEvent);
      window.removeEventListener("resize", handleScrollEvent);
      clearTimeout(timer);
    };
  }, [handleScroll]);

  const scrollToTop = useCallback(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  const scrollToHeading = useCallback((id: string) => {
    if (typeof window === "undefined") return;
    const element = document.getElementById(id);
    if (!element) return;

    if (window.innerWidth < 1280) {
      const rect = element.getBoundingClientRect();
      const targetScrollY = rect.top + scrollPosition - 100;

      setShowMobileToc(false);
      document.body.classList.remove("toc-open");
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";

      requestAnimationFrame(() => {
        window.scrollTo({ top: Math.max(0, targetScrollY), behavior: "smooth" });
      });
    } else {
      const position = element.getBoundingClientRect().top + window.pageYOffset - 100;
      window.scrollTo({ top: Math.max(0, position), behavior: "smooth" });
    }

    setActiveSection(id);
  }, [scrollPosition]);

  const toggleMobileToc = useCallback(() => {
    setShowMobileToc((prev) => {
      const newValue = !prev;
      if (newValue) {
        const scroll = window.scrollY;
        setScrollPosition(scroll);
        document.body.classList.add("toc-open");
        document.body.style.position = "fixed";
        document.body.style.top = `-${scroll}px`;
        document.body.style.width = "100%";
      } else {
        document.body.classList.remove("toc-open");
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";
        setTimeout(() => {
          if (scrollPosition > 0) window.scrollTo(0, scrollPosition);
        }, 50);
      }
      return newValue;
    });
  }, [scrollPosition]);

  const closeMobileToc = useCallback(() => {
    setShowMobileToc(false);
    document.body.classList.remove("toc-open");
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.width = "";
    setTimeout(() => {
      if (scrollPosition >= 0) window.scrollTo(0, scrollPosition);
    }, 50);
  }, [scrollPosition]);

  useEffect(() => {
    return () => {
      if (typeof document !== "undefined") {
        document.body.classList.remove("toc-open");
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";
      }
    };
  }, []);

  const featuredImage = useMemo(() => {
    return article.images?.find((img) => img.isFeatured)?.url ?? "/fallback.jpg";
  }, [article.images]);

  const hasFeaturedImage = article.images?.some((img) => img.isFeatured);

  const formatDisplayDate = (date: Date): string => {
    try {
      return date.toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" });
    } catch {
      return new Date().toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" });
    }
  };

  return (
    <div className="min-h-screen article-page-container">
      {hasFeaturedImage && (
        <div className="w-full overflow-hidden pt-8 px-4 sm:px-8">
          <div className="relative max-h-[400px] w-full flex justify-center">
            <OptimizedImage src={featuredImage} alt={article.title} className="h-auto max-h-[400px] w-full max-w-[400px] object-contain rounded-md" priority width={400} height={400} />
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="japanese-style-modern">
          <div className="japanese-style-modern-header">
            <h1 className="japanese-style-modern-title">{article.title}</h1>
            <div className="japanese-style-modern-date">{formatDisplayDate(article.updatedAt)}</div>
          </div>

          <div className="japanese-style-modern-container">
            <div className="flex flex-col xl:flex-row gap-8">
              <div className="order-2 xl:order-1 flex-1 min-w-0">
                <div className="japanese-style-modern-content max-w-none">
                  <div className="prose prose-lg prose-invert max-w-none overflow-hidden">{renderedContent}</div>
                </div>
              </div>

              <div className="order-1 xl:order-2 xl:w-80 flex-shrink-0">
                <div className="space-y-6 xl:sticky xl:top-8">
                  {tableOfContents.length > 0 && (
                    <aside className="hidden xl:block japanese-style-modern-sidebar desktop-sidebar scrollbar-custom">
                      <h3 className="japanese-style-modern-sidebar-title">Contents</h3>
                      <nav>
                        {tableOfContents.map((item) => (
                          <div
                            key={item.id}
                            className={`japanese-style-modern-toc-item ${activeSection === item.id ? "active" : ""}`}
                            data-level={item.level}
                            onClick={() => scrollToHeading(item.id)}
                            style={{ cursor: "pointer" }}
                          >
                            {item.text}
                          </div>
                        ))}
                      </nav>
                    </aside>
                  )}

                  <div className="hidden xl:block">
                    <RelatedArticles currentCategory={article.category} currentArticleId={article.id} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <FloatingButtons showScrollTop={showScrollTop} scrollToTop={scrollToTop} toggleMobileToc={toggleMobileToc} />
        </div>

        <div className="block xl:hidden mt-8">
          <RelatedArticles currentCategory={article.category} currentArticleId={article.id} />
        </div>

        <div className="flex flex-col justify-center items-center mt-24 gap-8">
          <Link href={`/${article.category}`}>
            <Button size="lg" className="w-[320px] border border-[#df7163] bg-[#df7163] text-[#f3f3f2] hover:bg-[#f3f3f2] hover:text-[#df7163] hover:border-[#df7163] hover:font-bold shadow hover:shadow-lg whitespace-nowrap w-auto px-6 transition-all duration-300">
              Back to {CATEGORY_LABELS[article.category]} Posts ≫
            </Button>
          </Link>
          <Link href="/all-articles">
            <Button size="lg" className="w-[220px] border border-[#df7163] bg-[#df7163] text-[#f3f3f2] hover:bg-[#f3f3f2] hover:text-[#df7163] hover:border-[#df7163] hover:font-bold shadow hover:shadow-lg whitespace-nowrap w-auto px-6 transition-all duration-300">
              View all posts ≫
            </Button>
          </Link>
        </div>
        <WhiteLine />
        <Redbubble />
      </div>

      {tableOfContents.length > 0 && (
        <div className="xl:hidden">
          <TableOfContents
            tableOfContents={tableOfContents}
            activeSection={activeSection}
            scrollToHeading={scrollToHeading}
            showMobileToc={showMobileToc}
            closeMobileToc={closeMobileToc}
          />
        </div>
      )}
    </div>
  );
};

export default ArticleClientPage;
export type { ArticleTrivia };