// components/articleClientPage/ArticleClientPage.tsx - 展開可能目次付き完全版
"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { WhiteLine } from "@/components/whiteLine/whiteLine";
import { CATEGORY_LABELS } from "@/constants/constants";
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
        className={`transition-opacity duration-500 ${
          isLoaded ? "opacity-100" : "opacity-0"
        } max-w-full h-auto rounded-lg shadow-lg ${className || ""}`}
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
  const [isTocExpanded, setIsTocExpanded] = useState(false); // 目次展開状態

  const tableOfContents = useMemo(
    () => extractHeaders(article.content),
    [article.content]
  );

  // 目次の表示制御
  const initialVisibleItems = 3;
  const shouldShowViewMore = tableOfContents.length > initialVisibleItems;
  const visibleTocItems = isTocExpanded
    ? tableOfContents
    : tableOfContents.slice(0, initialVisibleItems);

  const toggleTocExpanded = () => {
    setIsTocExpanded((prev) => !prev);
  };

  const renderedContent = useMemo(() => {
    const activeTrivia =
      article.trivia?.filter((t: ArticleTrivia) => t.isActive) || [];
    return (
      <ContentWithTrivia content={article.content} triviaList={activeTrivia} />
    );
  }, [article.content, article.trivia]);

  // レンダリング後に見出しにIDを設定
  useEffect(() => {
    const timer = setTimeout(() => {
      const headings = document.querySelectorAll(
        ".japanese-style-modern-content h1, .japanese-style-modern-content h2, .japanese-style-modern-content h3"
      );
      headings.forEach((heading) => {
        if (!heading.id && heading.textContent) {
          heading.id = safeId(heading.textContent);
        }
      });
    }, 100);
    return () => clearTimeout(timer);
  }, [article.content]);

  const handleScroll = useCallback(() => {
    if (typeof window === "undefined") return;

    setShowScrollTop(window.scrollY > 300);

    if (tableOfContents.length > 0) {
      const headings = document.querySelectorAll(
        ".japanese-style-modern-content h1[id], .japanese-style-modern-content h2[id], .japanese-style-modern-content h3[id]"
      );
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

        if (
          elementTop <= currentScrollY + headerOffset &&
          distance < closestDistance
        ) {
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

  const scrollToHeading = useCallback(
    (id: string) => {
      if (typeof window === "undefined") return;

      // まずIDで要素を探す
      let element = document.getElementById(id);

      // IDで見つからない場合は、テキストで見出しを探す
      if (!element) {
        const headings = document.querySelectorAll(
          ".japanese-style-modern-content h1, .japanese-style-modern-content h2, .japanese-style-modern-content h3"
        );

        // 目次アイテムのテキストと完全一致する見出しを探す
        const tableOfContentsItem = tableOfContents.find(
          (item) => item.id === id
        );
        if (tableOfContentsItem) {
          headings.forEach((heading) => {
            if (heading.textContent?.trim() === tableOfContentsItem.text) {
              element = heading as HTMLElement;
              return;
            }
          });
        }
      }

      if (!element) return;

      // スクロール実行
      const rect = element.getBoundingClientRect();
      const position = rect.top + window.pageYOffset - 120;
      window.scrollTo({ top: Math.max(0, position), behavior: "smooth" });

      setActiveSection(id);
    },
    [tableOfContents]
  );

  const featuredImage = useMemo(() => {
    return (
      article.images?.find((img) => img.isFeatured)?.url ?? "/fallback.jpg"
    );
  }, [article.images]);

  const hasFeaturedImage = article.images?.some((img) => img.isFeatured);

  const formatDisplayDate = (date: Date): string => {
    try {
      return date.toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return new Date().toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
  };

  return (
    <div className="min-h-screen article-page-container">
      <div className="container mx-auto px-4 pb-8 max-w-7xl">
        {/* フレックスコンテナで上部を揃える */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* メインコンテンツエリア - 70% */}
          <div className="flex-1 lg:w-[70%] min-w-0">
            <div className="japanese-style-modern">
              <div className="japanese-style-modern-header">
                <h1 className="japanese-style-modern-title">{article.title}</h1>
                <div className="japanese-style-modern-date">
                  {formatDisplayDate(article.updatedAt)}
                </div>
              </div>

              {hasFeaturedImage && (
                <div className="w-full overflow-hidden mb-6 px-6">
                  <div className="relative max-h-[400px] w-full flex justify-center">
                    <OptimizedImage
                      src={featuredImage}
                      alt={article.title}
                      className="h-auto max-h-[400px] w-full max-w-[400px] object-contain rounded-md"
                      priority
                      width={400}
                      height={400}
                    />
                  </div>
                </div>
              )}

              {/* 展開可能な目次 - 元の背景色に戻す */}
              {tableOfContents.length > 0 && (
                <div
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(27, 27, 27, 0.9) 0%, rgba(22, 22, 14, 0.7) 50%, rgba(27, 27, 27, 0.9) 100%)",
                    border: "1px solid rgba(241, 144, 114, 0.3)",
                    borderRadius: "12px",
                    margin: "0 1.5rem 2rem 1.5rem",
                    boxShadow:
                      "0 4px 16px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(241, 144, 114, 0.1)",
                    padding: "0",
                    overflow: "hidden",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "1.3rem",
                      fontWeight: "600",
                      color: "#f3f3f2",
                      margin: "0",
                      textAlign: "center",
                      padding: "1rem 0",
                      background:
                        "linear-gradient(135deg, rgba(241, 144, 114, 0.12) 0%, rgba(241, 191, 153, 0.08) 50%, rgba(241, 144, 114, 0.12) 100%)",
                      borderBottom: "1px solid rgba(241, 144, 114, 0.2)",
                      letterSpacing: "0.1em",
                      textShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
                    }}
                  >
                    Contents
                  </h3>

                  <nav
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.375rem",
                      padding: "1.5rem",
                    }}
                  >
                    {/* 表示する目次項目 - 左バーと文字のスペース調整 */}
                    {visibleTocItems.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => scrollToHeading(item.id)}
                        style={{
                          padding:
                            item.level === 1
                              ? "0.75rem 1rem 0.75rem 1.25rem"
                              : item.level === 2
                              ? "0.625rem 1rem 0.625rem 2rem"
                              : "0.5rem 1rem 0.5rem 2.75rem",
                          background: "transparent",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          fontSize:
                            item.level === 1
                              ? "1.1rem"
                              : item.level === 2
                              ? "0.95rem"
                              : "0.85rem",
                          fontWeight: item.level === 1 ? "600" : "500",
                          color:
                            activeSection === item.id ? "#daa520" : "#ffffff",
                          lineHeight: "1.4",
                          position: "relative",
                          letterSpacing: "0.02em",
                        }}
                        onMouseEnter={(e) => {
                          if (activeSection !== item.id) {
                            e.currentTarget.style.color = "#daa520";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (activeSection !== item.id) {
                            e.currentTarget.style.color = "#ffffff";
                          }
                        }}
                      >
                        {/* 左のオレンジバー - スペース調整版 */}
                        <div
                          style={{
                            position: "absolute",
                            left:
                              item.level === 1
                                ? "0"
                                : item.level === 2
                                ? "0.75rem"
                                : "1.5rem",
                            top: "0",
                            bottom: "0",
                            width: "3px",
                            backgroundColor:
                              item.level === 1
                                ? "#daa520"
                                : item.level === 2
                                ? "#cd853f"
                                : "#bc9a6a",
                          }}
                        />
                        {item.text}
                      </div>
                    ))}

                    {/* View more / View less ボタン - より洗練されたデザイン */}
                    {shouldShowViewMore && (
                      <div
                        style={{
                          background:
                            "linear-gradient(135deg, #8b6914 0%, #a0752d 30%, #daa520 70%, #8b6914 100%)",
                          borderTop: "1px solid rgba(218, 165, 32, 0.3)",
                          marginTop: "1rem",
                          borderRadius: "0 0 8px 8px",
                          position: "relative",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            position: "absolute",
                            top: "0",
                            left: "0",
                            right: "0",
                            height: "1px",
                            background:
                              "linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 20%, rgba(255, 255, 255, 0.5) 50%, rgba(255, 255, 255, 0.3) 80%, transparent 100%)",
                          }}
                        />
                        <button
                          onClick={toggleTocExpanded}
                          style={{
                            width: "100%",
                            padding: "1rem 1.25rem",
                            background: "transparent",
                            border: "none",
                            color: "#f4e4bc",
                            fontSize: "0.95rem",
                            fontWeight: "600",
                            cursor: "pointer",
                            textAlign: "center" as const,
                            letterSpacing: "0.075em",
                            transition: "all 0.3s ease",
                            fontFamily: "inherit",
                            textShadow: "0 1px 3px rgba(0, 0, 0, 0.6)",
                            position: "relative",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background =
                              "rgba(0, 0, 0, 0.15)";
                            e.currentTarget.style.color = "#ffffff";
                            e.currentTarget.style.transform =
                              "translateY(-1px)";
                            e.currentTarget.style.textShadow =
                              "0 2px 4px rgba(0, 0, 0, 0.8)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "transparent";
                            e.currentTarget.style.color = "#f4e4bc";
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.textShadow =
                              "0 1px 3px rgba(0, 0, 0, 0.6)";
                          }}
                          type="button"
                          aria-label={
                            isTocExpanded
                              ? "目次を折りたたむ"
                              : "目次をもっと見る"
                          }
                        >
                          {isTocExpanded ? "View less <<" : "View more >>"}
                        </button>
                      </div>
                    )}
                  </nav>
                </div>
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

          {/* 関連記事サイドバー - 30% */}
          <div className="lg:w-[30%] flex-shrink-0">
            {/* メインコンテンツの japanese-style-modern のマージン（2rem = 32px）と同じ余白を追加 */}
            <div style={{ marginTop: "2rem" }}>
              <RelatedArticles
                currentCategory={article.category}
                currentArticleId={article.id}
              />
            </div>
          </div>
        </div>
      </div>

      {/* モバイル用関連記事は削除（重複を防ぐ） */}

      <div className="flex flex-col justify-center items-center mt-24 gap-8">
        <Link href={`/${article.category}`}>
          <Button
            size="lg"
            className="w-[320px] border border-[#df7163] bg-[#df7163] text-[#f3f3f2] hover:bg-[#f3f3f2] hover:text-[#df7163] hover:border-[#df7163] hover:font-bold shadow hover:shadow-lg whitespace-nowrap w-auto px-6 transition-all duration-300"
          >
            Back to {CATEGORY_LABELS[article.category]} Posts ≫
          </Button>
        </Link>
        <Link href="/all-articles">
          <Button
            size="lg"
            className="w-[220px] border border-[#df7163] bg-[#df7163] text-[#f3f3f2] hover:bg-[#f3f3f2] hover:text-[#df7163] hover:border-[#df7163] hover:font-bold shadow hover:shadow-lg whitespace-nowrap w-auto px-6 transition-all duration-300"
          >
            View all posts ≫
          </Button>
        </Link>
      </div>
      <WhiteLine />
      <Redbubble />

      {showScrollTop && (
        <button
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
        </button>
      )}
    </div>
  );
};

export default ArticleClientPage;
export type { ArticleTrivia };
