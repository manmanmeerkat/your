// app/category-item/[slug]/CategoryItemClient.tsx - 完全修正版
"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { WhiteLine } from "@/components/whiteLine/whiteLine";
import { CATEGORY_LABELS } from "@/constants/constants";
import { MarkdownRenderer } from "@/lib/simpleMarkdownRenderer";

import "@/app/styles/japanese-style-modern.css";

export type TocItem = {
  id: string;
  text: string;
  level: number;
};

interface CategoryItemImage {
  id: string;
  url: string;
  altText?: string;
  isFeatured: boolean;
  createdAt: string;
  categoryItemId: string;
}

interface CategoryItem {
  id: string;
  title: string;
  slug: string;
  content: string;
  category: string;
  published: boolean;
  description?: string;
  createdAt: string;
  updatedAt: string;
  images?: CategoryItemImage[];
}

interface CategoryItemClientProps {
  item: CategoryItem;
}

interface RelatedItem {
  id: string;
  title: string;
  description: string;
  category: string;
  slug: string;
  icon: string;
  color: string;
  thumbnail?: string;
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
  const headingRegex = /^(#{1,2})\s+(.+)$/gm;
  const headers: TocItem[] = [];
  let match;
  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    headers.push({ id: safeId(text), text, level });
  }
  return headers;
};

// カテゴリアイテム用の関連記事コンポーネント
const CategoryItemRelatedArticles = ({
  currentCategory,
  currentItemId,
}: {
  currentCategory: string;
  currentItemId: string;
}) => {
  const [relatedItems, setRelatedItems] = useState<CategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRelatedItems = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(
          `/api/category-items/related?category=${currentCategory}&excludeId=${currentItemId}&limit=6`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch related items");
        }

        const data = await response.json();

        if (data.items && data.items.length > 0) {
          const shuffled = [...data.items].sort(() => Math.random() - 0.5);
          setRelatedItems(shuffled.slice(0, 3));
        } else {
          setRelatedItems([]);
        }
      } catch (err) {
        console.error("Error fetching related items:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
        setRelatedItems([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRelatedItems();
  }, [currentCategory, currentItemId]);

  // カテゴリに応じたタイトルを決定
  const getSectionTitle = (category: string): string => {
    if (category.includes("gods") || category.includes("mythology")) {
      return "About Japanese Gods";
    }
    if (category.includes("culture")) {
      return "More Japanese Culture";
    }
    if (category.includes("festival")) {
      return "Other Japanese Festivals";
    }
    if (category.includes("custom")) {
      return "Other Japanese Customs";
    }
    return "Related Articles";
  };

  // フォールバック用の神々データ
  const getFallbackItems = (): RelatedItem[] => {
    const allFallbacks: RelatedItem[] = [
      {
        id: "amaterasu-fallback",
        title: "Amaterasu Omikami",
        description: "Sun Goddess and ruler of the heavens",
        category: "about-japanese-gods",
        slug: "amaterasu-omikami",
        icon: "天",
        color: "bg-yellow-500",
        thumbnail: "/images/fallback-deity.jpg",
      },
      {
        id: "susanoo-fallback",
        title: "Susanoo-no-Mikoto",
        description: "Storm God of Sea and Wind",
        category: "about-japanese-gods",
        slug: "susanoo-no-mikoto",
        icon: "須",
        color: "bg-blue-600",
        thumbnail: "/images/fallback-deity.jpg",
      },
      {
        id: "tsukuyomi-fallback",
        title: "Tsukuyomi-no-Mikoto",
        description: "Moon God of the night sky",
        category: "about-japanese-gods",
        slug: "tsukuyomi-no-mikoto",
        icon: "月",
        color: "bg-indigo-600",
        thumbnail: "/images/fallback-deity.jpg",
      },
      {
        id: "inari-fallback",
        title: "Inari Okami",
        description: "Deity of rice, sake, and prosperity",
        category: "about-japanese-gods",
        slug: "inari-okami",
        icon: "稲",
        color: "bg-orange-500",
        thumbnail: "/images/fallback-deity.jpg",
      },
    ];

    const shuffled = [...allFallbacks].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
  };

  if (isLoading) {
    return (
      <div className="w-full bg-[#1b1b1b] rounded-xl border border-[#5e4740] overflow-hidden shadow-xl">
        <div className="p-6">
          <h3 className="text-xl font-bold mb-6 text-center text-orange-400 pb-3 border-b border-slate-700">
            {getSectionTitle(currentCategory)}
          </h3>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse flex gap-4 p-3 rounded-lg">
                <div className="bg-slate-600 w-20 h-20 rounded-lg flex-shrink-0"></div>
                <div className="flex-1 space-y-3 py-2">
                  <div className="bg-slate-600 h-4 rounded w-3/4"></div>
                  <div className="bg-slate-600 h-3 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const displayItems =
    relatedItems.length > 0 ? relatedItems : getFallbackItems();

  return (
    <div className="w-full bg-[#1b1b1b] rounded-xl border border-[#5e4740] overflow-hidden shadow-xl">
      <div className="p-6">
        <h3 className="japanese-style-modern-sidebar-title">
          {getSectionTitle(currentCategory)}
        </h3>

        <div className="space-y-4">
          {displayItems.slice(0, 3).map((displayItem, index) => {
            const isRealData = relatedItems.length > 0;
            const itemSlug = isRealData
              ? displayItem.slug
              : (displayItem as RelatedItem).slug;
            const itemTitle = isRealData
              ? displayItem.title
              : (displayItem as RelatedItem).title;
            const itemDescription = isRealData
              ? displayItem.description || "Japanese Deity"
              : (displayItem as RelatedItem).description;

            const thumbnail = isRealData
              ? (displayItem as CategoryItem).images?.[0]?.url ||
                "/images/fallback-deity.jpg"
              : (displayItem as RelatedItem).thumbnail ||
                "/images/fallback-deity.jpg";

            const icon = isRealData
              ? itemTitle.charAt(0).toUpperCase()
              : (displayItem as RelatedItem).icon;
            const colorClass = isRealData
              ? ["bg-orange-500", "bg-red-500", "bg-blue-500"][index]
              : (displayItem as RelatedItem).color;

            return (
              <RelatedItemCard
                key={displayItem.id}
                itemSlug={itemSlug}
                itemTitle={itemTitle}
                itemDescription={itemDescription}
                thumbnail={thumbnail}
                icon={icon}
                colorClass={colorClass}
              />
            );
          })}
        </div>

        <div className="mt-8 pt-6 border-t border-slate-700 text-center px-2">
          {currentCategory.includes("gods") ||
          currentCategory.includes("mythology") ? (
            <Link
              href="/mythology#about-japanese-gods"
              className="font-normal border border-[#df7163] bg-[#df7163] text-[#f3f3f2] hover:bg-[#f3f3f2] hover:text-[#df7163] hover:border-[#df7163] hover:font-bold shadow hover:shadow-lg w-full px-4 py-2 rounded-md text-center break-words inline-block"
            >
              <span className="block sm:inline">
                About Japanese Gods <span className="text-lg ml-1">≫</span>
              </span>
            </Link>
          ) : (
            <Link
              href="/all-articles"
              className="font-normal border border-[#df7163] bg-[#df7163] text-[#f3f3f2] hover:bg-[#f3f3f2] hover:text-[#df7163] hover:border-[#df7163] hover:font-bold shadow hover:shadow-lg w-full px-4 py-2 rounded-md text-center break-words inline-block"
            >
              <span className="block sm:inline">
                View All Articles <span className="text-lg ml-1">≫</span>
              </span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

// 関連記事カードコンポーネント
const RelatedItemCard = ({
  itemSlug,
  itemTitle,
  thumbnail,
  icon,
  colorClass,
}: {
  itemSlug: string;
  itemTitle: string;
  itemDescription: string;
  thumbnail: string;
  icon: string;
  colorClass: string;
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <Link
      href={`/category-item/${itemSlug}`}
      className="group flex gap-4 p-3 rounded-lg bg-[#2c2929] hover:bg-[#bbc8e6] transition-all duration-300 border border-slate-600/50 hover:border-[#bbc8e6] hover:shadow-lg"
    >
      {/* 画像エリア */}
      <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden relative border border-slate-500 bg-slate-700">
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {imageError && (
          <div
            className={`w-full h-full ${colorClass} rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg`}
          >
            {icon}
          </div>
        )}

        {!imageError && (
          <Image
            src={thumbnail}
            alt={itemTitle}
            width={80}
            height={80}
            className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-110 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            style={{ margin: 0, padding: 0, display: "block" }}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            unoptimized
          />
        )}
      </div>

      {/* コンテンツエリア */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <h4 className="font-semibold text-[#f3f3f2] group-hover:text-[#1b1b1b] transition-colors duration-200 leading-tight mb-3 line-clamp-2">
          {itemTitle}
        </h4>

        <div className="inline-flex items-center gap-2 text-sm font-medium text-[#df7163] group-hover:text-orange-300 transition-all duration-200">
          <Button
            size="sm"
            className="w-[160px] font-normal border border-[#df7163] bg-[#df7163] text-[#f3f3f2] rounded-full hover:bg-[#f3f3f2] hover:text-[#df7163] hover:border-[#df7163] hover:font-bold shadow hover:shadow-lg"
          >
            Read more ≫
          </Button>
        </div>
      </div>
    </Link>
  );
};

export default function CategoryItemClient({ item }: CategoryItemClientProps) {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [isTocExpanded, setIsTocExpanded] = useState(false);

  const tableOfContents = useMemo(
    () => extractHeaders(item.content),
    [item.content]
  );

  // スクロールバーを非表示にするCSSを追加
  useEffect(() => {
    const style = document.createElement("style");
    style.setAttribute("data-sidebar-scrollbar", "true");
    style.textContent = `
     .sidebar-sticky-container::-webkit-scrollbar {
       display: none;
     }
     .sidebar-sticky-container {
       scrollbar-width: none;
       -ms-overflow-style: none;
     }
   `;

    if (!document.head.querySelector("style[data-sidebar-scrollbar]")) {
      document.head.appendChild(style);
    }

    return () => {
      const existingStyle = document.head.querySelector(
        "style[data-sidebar-scrollbar]"
      );
      if (existingStyle) {
        document.head.removeChild(existingStyle);
      }
    };
  }, []);

  const initialVisibleItems = 5;
  const shouldShowViewMore = tableOfContents.length > initialVisibleItems;
  const visibleTocItems = isTocExpanded
    ? tableOfContents
    : tableOfContents.slice(0, initialVisibleItems);

  const toggleTocExpanded = () => {
    setIsTocExpanded((prev) => !prev);
  };

  const renderedContent = useMemo(() => {
    return <MarkdownRenderer content={item.content} />;
  }, [item.content]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const headings = document.querySelectorAll(
        ".japanese-style-modern-content h1, .japanese-style-modern-content h2"
      );
      headings.forEach((heading) => {
        if (!heading.id && heading.textContent) {
          heading.id = safeId(heading.textContent);
        }
      });
    }, 100);
    return () => clearTimeout(timer);
  }, [item.content]);

  const handleScroll = useCallback(() => {
    if (typeof window === "undefined") return;

    setShowScrollTop(window.scrollY > 300);

    if (tableOfContents.length > 0) {
      const headings = document.querySelectorAll(
        ".japanese-style-modern-content h1[id], .japanese-style-modern-content h2[id]"
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

      let element = document.getElementById(id);

      if (!element) {
        const headings = document.querySelectorAll(
          ".japanese-style-modern-content h1, .japanese-style-modern-content h2"
        );

        const tableOfContentsItem = tableOfContents.find(
          (tocItem) => tocItem.id === id
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

      const rect = element.getBoundingClientRect();
      const position = rect.top + window.pageYOffset - 120;
      window.scrollTo({ top: Math.max(0, position), behavior: "smooth" });

      setActiveSection(id);
    },
    [tableOfContents]
  );

  const featuredImage = useMemo(() => {
    return item.images?.find((img) => img.isFeatured)?.url ?? "/fallback.jpg";
  }, [item.images]);

  const hasFeaturedImage = item.images?.some((img) => img.isFeatured);

  const formatDisplayDate = (date: string): string => {
    try {
      return new Date(date).toLocaleDateString("ja-JP", {
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
                <h1 className="japanese-style-modern-title">{item.title}</h1>
                <div className="japanese-style-modern-date">
                  {formatDisplayDate(item.updatedAt)}
                </div>
              </div>

              {hasFeaturedImage && (
                <div className="w-full overflow-hidden mb-6 px-6">
                  <div className="relative max-h-[400px] w-full flex justify-center">
                    <OptimizedImage
                      src={featuredImage}
                      alt={item.title}
                      className="h-auto max-h-[400px] w-full max-w-[400px] object-contain rounded-md"
                      priority
                      width={400}
                      height={400}
                    />
                  </div>
                </div>
              )}

              {/* 展開可能な目次（記事詳細ページと同じように本文内、画像の下に配置） */}
              {tableOfContents.length > 0 && (
                <div className="rounded-xl border border-[rgba(241,144,114,0.3)] mx-6 mb-8 shadow-[0_4px_16px_rgba(0,0,0,0.3),_inset_0_1px_0_rgba(241,144,114,0.1)] bg-gradient-to-br from-[#1b1b1bcc] via-[#16160e] to-[#1b1b1bcc] overflow-hidden">
                  <h3 className="text-[1.3rem] font-semibold text-[#f3f3f2] m-0 text-center py-4 bg-gradient-to-br from-[rgba(241,144,114,0.12)] via-[rgba(241,191,153,0.08)] to-[rgba(241,144,114,0.12)] border-b border-[rgba(241,144,114,0.2)] tracking-wider shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
                    Contents
                  </h3>

                  <nav className="flex flex-col gap-1.5 p-6">
                    {visibleTocItems.map((tocItem) => (
                      <div
                        key={tocItem.id}
                        onClick={() => scrollToHeading(tocItem.id)}
                        className={`relative cursor-pointer transition-all duration-200 ${
                          tocItem.level === 1
                            ? "pl-5 pr-4 py-3 text-[1.1rem] font-semibold"
                            : "pl-8 pr-4 py-2.5 text-[0.95rem] font-medium"
                        } ${
                          activeSection === tocItem.id
                            ? "text-[#daa520]"
                            : "text-white hover:text-[#daa520]"
                        }`}
                      >
                        <div
                          className={`absolute w-[3px] h-[60%] top-1/2 -translate-y-1/2 ${
                            tocItem.level === 1
                              ? "left-0 bg-[#f19072]"
                              : "left-3 bg-[#f19072]"
                          }`}
                        />
                        {tocItem.text}
                      </div>
                    ))}

                    {shouldShowViewMore && (
                      <div className="mt-4 rounded-b-lg relative overflow-hidden bg-gradient-to-r from-[#8b6914] via-[#a0752d] to-[#daa520] border-t border-[rgba(218,165,32,0.3)]">
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />
                        <button
                          onClick={toggleTocExpanded}
                          type="button"
                          aria-label={
                            isTocExpanded
                              ? "目次を折りたたむ"
                              : "目次をもっと見る"
                          }
                          className="w-full py-4 px-5 text-[#f4e4bc] font-semibold text-[0.95rem] bg-transparent border-none text-center tracking-wider transition-all duration-300 relative hover:bg-black/15 hover:text-white hover:-translate-y-[1px] hover:shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
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

          {/* スティッキーサイドバー - 30% */}
          <div className="lg:w-[30%] flex-shrink-0">
            <div
              className="sticky sidebar-sticky-container"
              style={{
                top: "0.5rem",
                paddingTop: "2rem",
                maxHeight: "calc(100vh - 1rem)",
                overflowY: "auto",
                paddingBottom: "2rem",
              }}
            >
              {/* カテゴリアイテム用の関連記事コンポーネント */}
              <CategoryItemRelatedArticles
                currentCategory={item.category}
                currentItemId={item.id}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-center items-center mt-24 gap-8 px-4">
        {item.category.includes("gods") ||
        item.category.includes("mythology") ? (
          <Link
            href="/mythology#about-japanese-gods"
            className="w-full max-w-sm"
          >
            <Button
              size="lg"
              className="border border-[#df7163] bg-[#df7163] text-[#f3f3f2] hover:bg-[#f3f3f2] hover:text-[#df7163] hover:border-[#df7163] hover:font-bold shadow hover:shadow-lg w-full px-4 py-3 transition-all duration-300 text-center break-words"
            >
              <span className="block sm:inline">
                Back to about Japanese Gods Posts{" "}
                <span className="ml-1">≫</span>
              </span>
            </Button>
          </Link>
        ) : (
          <Link href={`/${item.category}`} className="w-full max-w-sm">
            <Button
              size="lg"
              className="border border-[#df7163] bg-[#df7163] text-[#f3f3f2] hover:bg-[#f3f3f2] hover:text-[#df7163] hover:border-[#df7163] hover:font-bold shadow hover:shadow-lg w-full px-4 py-3 transition-all duration-300 text-center break-words"
            >
              <span className="block sm:inline">
                Back to {CATEGORY_LABELS[item.category] || item.category} Posts{" "}
                <span className="ml-1">≫</span>
              </span>
            </Button>
          </Link>
        )}
        <Link href="/all-articles" className="w-full max-w-sm">
          <Button
            size="lg"
            className="border border-[#df7163] bg-[#df7163] text-[#f3f3f2] hover:bg-[#f3f3f2] hover:text-[#df7163] hover:border-[#df7163] hover:font-bold shadow hover:shadow-lg w-full px-4 py-3 transition-all duration-300 text-center break-words"
          >
            <span className="block sm:inline">
              View all posts <span className="ml-1">≫</span>
            </span>
          </Button>
        </Link>
      </div>
      <WhiteLine />

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
}
