// app/category-item/[slug]/CategoryItemClient.tsx - 完成版（デバッグなし）
"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { CATEGORY_CONFIG } from "@/constants/constants";
import { TableOfContents } from "@/components/japanese-style/TableOfContents";

// 和風スタイルを読み込む
import "@/app/styles/japanese-style-modern.css";

// 型定義
type ImageType = {
  id: string;
  url: string;
  altText: string | null;
  isFeatured: boolean;
  createdAt: Date;
  categoryItemId: string;
};

type CategoryItem = {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  category: string;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
  images: ImageType[];
};

export type TocItem = {
  id: string;
  text: string;
  level: number;
};

interface ReturnData {
  url: string;
  exactScrollY: number;
  godsSectionTop: number;
  sectionId: string;
  timestamp: number;
  debug: {
    scrollY1: number;
    scrollY2: number;
    scrollY3: number;
    windowInnerHeight: number;
    documentHeight: number;
  };
}

interface CategoryItemClientProps {
  item: CategoryItem;
}

// ヘルパー関数
const safeId = (text: unknown): string => {
  if (typeof text !== "string") {
    return `heading-${Math.random().toString(36).substring(2, 9)}`;
  }

  try {
    return text.toLowerCase().replace(/[^\w]+/g, "-");
  } catch {
    return `heading-${Math.random().toString(36).substring(2, 9)}`;
  }
};

// インライン要素の処理
const processInlineMarkdown = (text: string): string => {
  if (!text) return "";

  let processed = text;

  processed = processed.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" class="japanese-style-modern-a">$1</a>'
  );

  processed = processed.replace(
    /\*\*(.*?-ryu)\*\*/g,
    '<strong class="ryu-name">$1</strong>'
  );

  processed = processed.replace(
    /\*\*(.*?)\*\*/g,
    '<strong class="japanese-style-modern-strong">$1</strong>'
  );

  processed = processed.replace(
    /\*(.*?)\*/g,
    '<em class="japanese-style-modern-em">$1</em>'
  );

  processed = processed.replace(
    /`([^`]+)`/g,
    '<code class="japanese-style-modern-code">$1</code>'
  );

  processed = processed.replace(
    /!\[([^\]]*)\]\(([^)]+)\)/g,
    '<img src="$2" alt="$1" class="japanese-style-modern-img">'
  );

  return processed;
};

// マークダウンレンダラー
const renderEnhancedMarkdown = (content: string): string => {
  if (!content) return "";

  let html = '<section class="japanese-style-modern-section">';
  const paragraphs = content.split(/\n\s*\n/);

  for (let i = 0; i < paragraphs.length; i++) {
    const paragraph = paragraphs[i].trim();
    if (!paragraph) continue;

    if (paragraph.startsWith("# ")) {
      const headingText = paragraph.substring(2).trim();
      const id = safeId(headingText);
      if (i > 0) {
        html += '</section><section class="japanese-style-modern-section">';
      }
      html += `<h1 id="${id}" class="japanese-style-modern-h1">${processInlineMarkdown(
        headingText
      )}</h1>`;
    } else if (paragraph.startsWith("## ")) {
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
    } else if (paragraph.startsWith("```")) {
      const codePattern = /```(?:(\w+))?\n([\s\S]*?)```/;
      const match = paragraph.match(codePattern);

      if (match) {
        const language = match[1] || "";
        const code = match[2];
        html += `<pre class="japanese-style-modern-pre ${
          language ? `language-${language}` : ""
        }"><code class="japanese-style-modern-code">${code}</code></pre>`;
      } else {
        html += `<p class="japanese-style-modern-p">${processInlineMarkdown(
          paragraph
        )}</p>`;
      }
    } else if (paragraph.startsWith("> ")) {
      const quoteLines = paragraph.split("\n");
      const quoteContent = quoteLines
        .map((line) => (line.startsWith("> ") ? line.substring(2) : line))
        .join("\n");

      html += `<blockquote class="japanese-style-modern-blockquote"><p class="japanese-style-modern-p">${processInlineMarkdown(
        quoteContent
      )}</p></blockquote>`;
    } else if (/^\s*-\s/.test(paragraph)) {
      const listLines = paragraph.split("\n");
      let listHtml = '<ul class="japanese-style-modern-ul">';

      listLines.forEach((line) => {
        const trimmed = line.trim();
        if (trimmed.startsWith("- ")) {
          const content = trimmed.substring(2);
          if (content) {
            listHtml += `<li class="japanese-style-modern-li">${processInlineMarkdown(
              content
            )}</li>`;
          }
        }
      });

      listHtml += "</ul>";
      html += listHtml;
    } else if (/^\s*\d+\.\s/.test(paragraph)) {
      const listLines = paragraph.split("\n");
      let listHtml = '<ol class="japanese-style-modern-ol">';

      listLines.forEach((line) => {
        const trimmed = line.trim();
        const match = trimmed.match(/^\d+\.\s+(.+)$/);
        if (match && match[1]) {
          listHtml += `<li class="japanese-style-modern-li">${processInlineMarkdown(
            match[1]
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

// ヘッダー抽出
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

// メインコンポーネント
export default function CategoryItemClient({ item }: CategoryItemClientProps) {
  const [tableOfContents, setTableOfContents] = useState<TocItem[]>([]);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [showMobileToc, setShowMobileToc] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [renderedContent, setRenderedContent] = useState<string>("");
  const [isClient, setIsClient] = useState(false);
  const [returnData, setReturnData] = useState<ReturnData | null>(null);

  // クライアントサイド確認
  useEffect(() => {
    setIsClient(true);
  }, []);

  // 戻り先データ確認
  useEffect(() => {
    if (!isClient) return;

    const checkReturnData = () => {
      try {
        const savedReturnData = sessionStorage.getItem("gods-return-data");

        if (savedReturnData) {
          const data: ReturnData = JSON.parse(savedReturnData);
          const isRecent = Date.now() - data.timestamp < 5 * 60 * 1000;

          if (isRecent) {
            setReturnData(data);
          } else {
            sessionStorage.removeItem("gods-return-data");
          }
        }
      } catch {
        sessionStorage.removeItem("gods-return-data");
      }
    };

    checkReturnData();
    const timer = setTimeout(checkReturnData, 500);

    return () => clearTimeout(timer);
  }, [isClient]);

  // スマート戻り機能
  const handleSmartReturn = useCallback(() => {
    if (!isClient) return;

    const godsReturnData = sessionStorage.getItem("gods-return-data");
    if (godsReturnData) {
      try {
        const data = JSON.parse(godsReturnData);

        const exactReturnData = {
          originalScrollY: data.exactScrollY,
          godsSectionTop: data.godsSectionTop,
          shouldRestorePosition: true,
          disablePaginationScroll: true,
          timestamp: Date.now(),
          debugInfo: data.debug,
        };

        sessionStorage.setItem(
          "exact-scroll-restore",
          JSON.stringify(exactReturnData)
        );
        sessionStorage.setItem("disable-pagination-scroll", "true");
        sessionStorage.removeItem("gods-return-data");

        setTimeout(() => {
          if (window.history.length > 1) {
            window.history.back();
          } else {
            window.location.href = data.url;
          }
        }, 100);
      } catch {
        window.location.href = "/mythology#about-japanese-gods";
      }
    } else {
      const sectionId = item.category;
      const returnPath = CATEGORY_CONFIG[item.category]?.path || "/";
      window.location.href = `${returnPath}#${sectionId}`;
    }
  }, [isClient, item.category]);

  // マークダウンレンダリング
  useEffect(() => {
    if (!item.content) {
      setRenderedContent(
        '<section class="japanese-style-modern-section"><p class="japanese-style-modern-p">コンテンツがありません。</p></section>'
      );
      return;
    }

    const mdPatterns = [
      /^#\s+.+$/m,
      /\*\*.+\**/,
      /\*.+\*/,
      /^\s*-\s+.+$/m,
      /^\s*\d+\.\s+.+$/m,
      /\[.+\]\(.+\)/,
      /!\[.+\]\(.+\)/,
      /^\|.+\|$/m,
      /^>.+$/m,
      /^```[\s\S]*?```$/m,
    ];

    const contentIsMarkdown = mdPatterns.some((pattern) =>
      pattern.test(item.content!)
    );

    if (contentIsMarkdown) {
      try {
        const html = renderEnhancedMarkdown(item.content);
        setRenderedContent(html);
        const extractedToc = extractHeaders(item.content);
        setTableOfContents(extractedToc);
      } catch {
        setRenderedContent(
          "<p class='japanese-style-modern-p'>マークダウンの処理中にエラーが発生しました。</p>"
        );
      }
    } else {
      setRenderedContent(
        `<section class="japanese-style-modern-section"><p class="japanese-style-modern-p">${item.content}</p></section>`
      );
    }
  }, [item.content]);

  // スクロール処理
  useEffect(() => {
    if (!isClient) return;

    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);

      if (tableOfContents.length > 0) {
        const headings = Array.from(
          document.querySelectorAll(
            ".japanese-style-modern h1, .japanese-style-modern h2, .japanese-style-modern h3"
          )
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
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll);
    setTimeout(handleScroll, 100);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [tableOfContents, isClient]);

  // その他の関数
  const scrollToTop = useCallback(() => {
    if (isClient) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [isClient]);

  const scrollToHeading = useCallback(
    (id: string) => {
      if (!isClient) return;

      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
        setActiveSection(id);
        if (window.innerWidth <= 768) {
          setShowMobileToc(false);
        }
      }
    },
    [isClient]
  );

  const toggleMobileToc = useCallback(() => {
    setShowMobileToc((prev) => !prev);
  }, []);

  // レンダリング変数
  const sectionId = item.category;
  const returnPath = CATEGORY_CONFIG[item.category]?.path || "/";
  const label = CATEGORY_CONFIG[item.category]?.label || "Category";

  // SSR時は基本構造のみ表示
  if (!isClient) {
    return (
      <div className="min-h-screen article-page-container">
        <div className="container mx-auto px-4 py-8">
          <div className="japanese-style-modern">
            <div className="japanese-style-modern-header">
              <h1 className="japanese-style-modern-title">{item.title}</h1>
            </div>
            <div className="text-center">読み込み中...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen article-page-container">
      {/* Hero image */}
      {item.images?.[0] && (
        <div className="w-full overflow-hidden pt-8 px-4 sm:px-8">
          <div className="relative max-h-[400px] w-full flex justify-center">
            <Image
              src={item.images[0].url}
              alt={item.images[0].altText || item.title}
              className="h-auto max-h-[400px] w-full max-w-[400px] object-contain rounded-md"
              width={400}
              height={400}
              unoptimized
            />
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        <div className="japanese-style-modern">
          <div className="japanese-style-modern-header">
            <h1 className="japanese-style-modern-title">{item.title}</h1>
            <div className="japanese-style-modern-date">
              {new Date(item.updatedAt).toLocaleDateString("ja-JP", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          </div>

          {/* 目次とコンテンツ */}
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

          {/* フローティングボタン */}
          <button
            className="japanese-style-modern-toc-button fixed bottom-2 left-2 z-50
              w-12 h-12 bg-[#df7163] border-2 border-[#df7163] rounded-full
              flex items-center justify-center text-white
              hover:bg-white hover:text-[#df7163] transition-all duration-300
              lg:hidden"
            onClick={toggleMobileToc}
            aria-label="目次を表示"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h7"
              />
            </svg>
          </button>

          {showScrollTop && (
            <button
              className="fixed bottom-2 right-2 z-50
                w-12 h-12 bg-[#df7163] border-2 border-[#df7163] rounded-full
                flex items-center justify-center text-white
                hover:bg-white hover:text-[#df7163] transition-all duration-300"
              onClick={scrollToTop}
              aria-label="トップに戻る"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 10l7-7m0 0l7 7m-7-7v18"
                />
              </svg>
            </button>
          )}
        </div>

        {/* 戻りボタン */}
        <div className="flex flex-col justify-center items-center mt-24 mb-16 gap-8">
          {returnData && returnData.sectionId === "about-japanese-gods" ? (
            <button
              onClick={handleSmartReturn}
              className="
                max-w-[340px] w-full
                border border-[#df7163] bg-[#df7163] text-[#f3f3f2] 
                hover:bg-[#f3f3f2] hover:text-[#df7163] hover:border-[#df7163] hover:font-bold
                shadow hover:shadow-lg px-6 py-3
                transition-all duration-300 text-center break-words
                rounded-md font-medium text-lg
              "
            >
              Back to about Japanese Gods ≫
            </button>
          ) : (
            <Link href={`${returnPath}#${sectionId}`}>
              <button
                className="
                  max-w-[340px] w-full
                  border border-[#df7163] bg-[#df7163] text-[#f3f3f2] 
                  hover:bg-[#f3f3f2] hover:text-[#df7163] hover:border-[#df7163] hover:font-bold
                  shadow hover:shadow-lg px-6 py-3
                  transition-all duration-300 text-center break-words
                  rounded-md font-medium text-lg
                "
              >
                Back to {label} ≫
              </button>
            </Link>
          )}

          <Link href="/">
            <button
              className="
                max-w-[340px] w-full
                border border-gray-400 bg-transparent text-gray-300
                hover:bg-gray-700 hover:text-white hover:border-gray-300
                shadow hover:shadow-lg px-6 py-3
                transition-all duration-300 text-center break-words
                rounded-md font-medium text-lg
              "
            >
              ← Back to Home
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
