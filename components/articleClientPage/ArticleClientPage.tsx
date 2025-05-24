"use client";

import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { WhiteLine } from "@/components/whiteLine/whiteLine";
import { CATEGORY_LABELS } from "@/constants/constants";
import { TableOfContents } from "@/components/japanese-style/TableOfContents";
import { FloatingButtons } from "@/components/japanese-style/FloatingButtons";

// 和風スタイルを読み込む
import "@/app/styles/japanese-style-modern.css";

// 型定義
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
  content: string;
  category: string;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
  images: Image[];
};

export type TocItem = {
  id: string;
  text: string;
  level: number;
};

// ⭐ シンプルな画像コンポーネント（SSR安全）
const SimpleImage = ({
  src,
  alt,
  className,
  priority = false,
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  const handleError = useCallback(() => {
    setHasError(true);
    setIsLoaded(true);
  }, []);

  if (hasError) {
    return (
      <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg p-8 text-center text-gray-500 min-h-[200px] flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-4xl mb-2">📷</div>
          <div>画像を読み込めませんでした</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* スケルトンローダー */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 animate-pulse rounded-lg flex items-center justify-center">
          <div className="text-gray-400">Loading...</div>
        </div>
      )}

      {/* 実際の画像 */}
      <img
        src={src}
        alt={alt}
        className={`transition-opacity duration-500 ${
          isLoaded ? "opacity-100" : "opacity-0"
        } ${className || ""}`}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        onLoad={handleLoad}
        onError={handleError}
        style={{
          maxWidth: "100%",
          height: "auto",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        }}
      />
    </div>
  );
};

const safeId = (text: unknown): string => {
  if (typeof text !== "string") {
    return `heading-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }

  return text
    .toLowerCase()
    .replace(/[^\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+/g, "-");
};

// ⭐ シンプルなインライン処理
const processInlineMarkdown = (text: string): string => {
  if (!text) return "";

  return (
    text
      .replace(
        /\[([^\]]+)\]\(([^)]+)\)/g,
        '<a href="$2" class="japanese-style-modern-a">$1</a>'
      )
      .replace(/\*\*(.*?-ryu)\*\*/g, '<strong class="ryu-name">$1</strong>')
      .replace(
        /\*\*(.*?)\*\*/g,
        '<strong class="japanese-style-modern-strong">$1</strong>'
      )
      .replace(/\*(.*?)\*/g, '<em class="japanese-style-modern-em">$1</em>')
      .replace(
        /`([^`]+)`/g,
        '<code class="japanese-style-modern-code">$1</code>'
      )
      // ⭐ シンプル画像処理
      .replace(
        /!\[([^\]]*)\]\(([^)]+)\)/g,
        '<img src="$2" alt="$1" loading="lazy" decoding="async" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); margin: 1.5rem 0; display: block;">'
      )
  );
};

const renderEnhancedMarkdown = (content: string): string => {
  if (!content) return "";

  let html = '<section class="japanese-style-modern-section">';
  const paragraphs = content.split(/\n\s*\n/).filter((p) => p.trim());

  for (let i = 0; i < paragraphs.length; i++) {
    const paragraph = paragraphs[i].trim();
    if (!paragraph) continue;

    if (paragraph.startsWith("## ")) {
      const headingText = paragraph.substring(3).trim();
      const id = safeId(headingText);
      html += `<h2 id="${id}" class="japanese-style-modern-h2">${processInlineMarkdown(
        headingText
      )}</h2>`;
    } else if (paragraph.startsWith("### ")) {
      const headingText = paragraph.substring(4).trim();
      const id = safeId(headingText);
      html += `<h3 id="${id}" class="japanese-style-modern-h3">${processInlineMarkdown(
        headingText
      )}</h3>`;
    } else if (paragraph.startsWith("# ")) {
      const headingText = paragraph.substring(2).trim();
      const id = safeId(headingText);
      if (i > 0) {
        html += '</section><section class="japanese-style-modern-section">';
      }
      html += `<h1 id="${id}" class="japanese-style-modern-h1">${processInlineMarkdown(
        headingText
      )}</h1>`;
    } else if (paragraph.startsWith("> ")) {
      const quoteContent = paragraph
        .split("\n")
        .map((line) => (line.startsWith("> ") ? line.substring(2) : line))
        .join("\n");
      html += `<blockquote class="japanese-style-modern-blockquote"><p class="japanese-style-modern-p">${processInlineMarkdown(
        quoteContent
      )}</p></blockquote>`;
    } else if (/^\s*-\s/.test(paragraph)) {
      const listItems = paragraph
        .split(/\n\s*-\s/)
        .filter((item) => item.trim());
      let listHtml = '<ul class="japanese-style-modern-ul">';
      listItems.forEach((item) => {
        if (item.trim()) {
          listHtml += `<li class="japanese-style-modern-li">${processInlineMarkdown(
            item.trim()
          )}</li>`;
        }
      });
      listHtml += "</ul>";
      html += listHtml;
    } else if (/^\s*\d+\.\s/.test(paragraph)) {
      const listItems = paragraph
        .split(/\n\s*\d+\.\s/)
        .filter((item) => item.trim());
      let listHtml = '<ol class="japanese-style-modern-ol">';
      listItems.forEach((item) => {
        if (item.trim()) {
          listHtml += `<li class="japanese-style-modern-li">${processInlineMarkdown(
            item.trim()
          )}</li>`;
        }
      });
      listHtml += "</ol>";
      html += listHtml;
    } else if (
      paragraph === "---" ||
      paragraph === "***" ||
      paragraph === "___"
    ) {
      html += '<hr class="japanese-style-modern-hr" />';
    } else {
      html += `<p class="japanese-style-modern-p">${processInlineMarkdown(
        paragraph
      )}</p>`;
    }
  }

  html += "</section>";
  return html;
};

const extractHeaders = (content: string): TocItem[] => {
  const headingRegex = /^(#{1,3})\s+(.+)$/gm;
  const headers: TocItem[] = [];
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    const id = safeId(text);
    headers.push({ id, text, level });
  }

  return headers;
};

export default function ArticleClientPage({ article }: { article: Article }) {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [showMobileToc, setShowMobileToc] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const { renderedContent, tableOfContents } = useMemo(() => {
    const mdPatterns = [
      /^#\s+.+$/m,
      /\*\*.+\*\*/,
      /\*.+\*/,
      /^\s*-\s+.+$/m,
      /^\s*\d+\.\s+.+$/m,
      /\[.+\]\(.+\)/,
      /!\[.+\]\(.+\)/,
      /^>.+$/m,
    ];

    const contentIsMarkdown = mdPatterns.some((pattern) =>
      pattern.test(article.content)
    );

    if (contentIsMarkdown) {
      const html = renderEnhancedMarkdown(article.content);
      const toc = extractHeaders(article.content);
      return { renderedContent: html, tableOfContents: toc };
    } else {
      return {
        renderedContent: `<section class="japanese-style-modern-section"><p class="japanese-style-modern-p">${article.content}</p></section>`,
        tableOfContents: [],
      };
    }
  }, [article.content]);

  // ⭐ シンプルなスクロール処理
  const handleScroll = useCallback(() => {
    if (typeof window === "undefined") return;

    setShowScrollTop(window.scrollY > 300);

    if (tableOfContents.length > 0) {
      const headings = document.querySelectorAll(
        ".japanese-style-modern h1, .japanese-style-modern h2, .japanese-style-modern h3"
      );

      let currentId = "";
      for (const heading of headings) {
        const rect = heading.getBoundingClientRect();
        if (rect.top <= 100) {
          currentId = heading.id;
        } else {
          break;
        }
      }
      setActiveSection(currentId);
    }
  }, [tableOfContents.length]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // ⭐ シンプルなスクロールイベント
    const handleScrollEvent = () => handleScroll();

    window.addEventListener("scroll", handleScrollEvent, { passive: true });
    window.addEventListener("resize", handleScrollEvent);

    // 初回実行
    setTimeout(handleScrollEvent, 100);

    return () => {
      window.removeEventListener("scroll", handleScrollEvent);
      window.removeEventListener("resize", handleScrollEvent);
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
    if (element) {
      const elementPosition =
        element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - 100;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });

      setActiveSection(id);
      if (window.innerWidth <= 768) {
        setShowMobileToc(false);
      }
    }
  }, []);

  const toggleMobileToc = useCallback(() => {
    setShowMobileToc((prev) => !prev);
  }, []);

  const featuredImage = useMemo(
    () => article.images.find((img) => img.isFeatured)?.url ?? "/fallback.jpg",
    [article.images]
  );

  const hasFeaturedImage = article.images?.some((img) => img.isFeatured);

  return (
    <div className="bg-slate-950 min-h-screen article-page-container">
      {/* ⭐ Hero image - シンプル版 */}
      {hasFeaturedImage && (
        <div className="w-full bg-slate-950 overflow-hidden pt-8 px-4 sm:px-8">
          <div className="relative max-h-[500px] w-full flex justify-center">
            <SimpleImage
              src={featuredImage}
              alt={article.title}
              className="h-auto max-h-[500px] w-full max-w-[800px] object-contain rounded-md"
              priority={true}
            />
          </div>
          <WhiteLine />
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        <div className="japanese-style-modern">
          <div className="japanese-style-modern-header">
            <h1 className="japanese-style-modern-title">{article.title}</h1>
            <div className="japanese-style-modern-date">
              {new Date(article.updatedAt).toLocaleDateString("ja-JP", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          </div>

          <div className="japanese-style-modern-container">
            <TableOfContents
              tableOfContents={tableOfContents}
              activeSection={activeSection}
              scrollToHeading={scrollToHeading}
              showMobileToc={showMobileToc}
              closeMobileToc={() => setShowMobileToc(false)}
            />

            <div className="japanese-style-modern-content">
              <div
                ref={contentRef}
                dangerouslySetInnerHTML={{ __html: renderedContent }}
              />
            </div>
          </div>

          <FloatingButtons
            showScrollTop={showScrollTop}
            scrollToTop={scrollToTop}
            toggleMobileToc={toggleMobileToc}
          />
        </div>

        <div className="flex flex-col justify-center items-center mt-8 gap-8">
          <Link href={`/${article.category}`}>
            <Button
              size="lg"
              className="
                w-[320px] 
                border border-rose-700 bg-rose-700 text-white 
                hover:bg-white hover:text-rose-700 hover:border-rose-700 hover:font-bold
                shadow hover:shadow-lg
                whitespace-nowrap
                w-auto
                px-6
                transition-all duration-300
              "
            >
              Back to {CATEGORY_LABELS[article.category]} Posts ≫
            </Button>
          </Link>
          <Link href="/all-articles">
            <Button
              size="lg"
              className="
                w-[220px] 
                border border-rose-700 bg-rose-700 text-white 
                hover:bg-white hover:text-rose-700 hover:border-rose-700 hover:font-bold
                shadow hover:shadow-lg
                whitespace-nowrap
                w-auto
                px-6
                transition-all duration-300
              "
            >
              View all posts ≫
            </Button>
          </Link>
        </div>
        <WhiteLine />
      </div>
    </div>
  );
}
