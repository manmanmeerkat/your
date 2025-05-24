"use client";

import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
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

// ⭐ 改良された画像コンポーネント（unoptimized + キャッシュ対応）
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
  const imgRef = useRef<HTMLImageElement>(null);

  // ⭐ マウント時にキャッシュ確認
  useEffect(() => {
    // 短い遅延でローダーを非表示にする（UX改善）
    const timer = setTimeout(() => {
      setShouldShowLoader(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // ⭐ src変更時の状態リセット
  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
    setShouldShowLoader(true);

    const timer = setTimeout(() => {
      setShouldShowLoader(false);
    }, 100);

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
      <div
        className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg p-8 text-center text-gray-500 flex items-center justify-center"
        style={{ minHeight: "200px" }}
      >
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
      {shouldShowLoader && !isLoaded && (
        <div
          className="absolute inset-0 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 animate-pulse rounded-lg flex items-center justify-center z-10"
          style={{ minHeight: "200px" }}
        >
          <div className="text-gray-400">Loading...</div>
        </div>
      )}

      {/* Next.js Image (unoptimized) */}
      <Image
        ref={imgRef}
        src={src}
        alt={alt}
        width={width}
        height={height}
        unoptimized={true} // ⭐ Vercel最適化を無効化
        className={`transition-opacity duration-500 ${
          isLoaded ? "opacity-100" : "opacity-0"
        } ${className || ""}`}
        priority={priority}
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

// ⭐ より堅牢なインライン処理関数
const processInlineMarkdown = (text: string): string => {
  if (!text || typeof text !== "string") return "";

  try {
    return (
      text
        // ⭐ 1. コードブロック（最初に処理してエスケープ）
        .replace(
          /`([^`]+)`/g,
          '<code class="japanese-style-modern-code">$1</code>'
        )

        // ⭐ 2. リンク処理（より厳密な正規表現）
        .replace(
          /\[([^\]]+)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g,
          '<a href="$2" class="japanese-style-modern-a" title="$3">$1</a>'
        )

        // ⭐ 3. 画像処理（リンクの後に処理）
        .replace(
          /!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g,
          '<div class="markdown-image-container" data-src="$2" data-alt="$1" data-title="$3"><div class="markdown-image-loader"><div style="color: #9ca3af;">Loading...</div></div></div>'
        )

        // ⭐ 4. 強調テキスト（流派名の特別処理）
        .replace(
          /\*\*([^*]*-ryu[^*]*)\*\*/g,
          '<strong class="ryu-name">$1</strong>'
        )
        .replace(
          /\*\*([^*]+)\*\*/g,
          '<strong class="japanese-style-modern-strong">$1</strong>'
        )

        // ⭐ 5. 斜体（強調の後に処理）
        .replace(/\*([^*]+)\*/g, '<em class="japanese-style-modern-em">$1</em>')

        // ⭐ 6. 特殊文字のエスケープ解除
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
    );
  } catch (error) {
    console.warn("Error processing inline markdown:", error, text);
    return text; // エラー時は元のテキストを返す
  }
};

// ⭐ より堅牢なMarkdownレンダリング関数
const renderEnhancedMarkdown = (content: string): string => {
  if (!content || typeof content !== "string") {
    console.warn("Invalid content provided to renderEnhancedMarkdown");
    return '<section class="japanese-style-modern-section"><p class="japanese-style-modern-p">No content available</p></section>';
  }

  try {
    let html = '<section class="japanese-style-modern-section">';

    // ⭐ より堅牢な段落分割
    const paragraphs = content
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    if (paragraphs.length === 0) {
      return '<section class="japanese-style-modern-section"><p class="japanese-style-modern-p">No content available</p></section>';
    }

    for (let i = 0; i < paragraphs.length; i++) {
      const paragraph = paragraphs[i];
      if (!paragraph) continue;

      try {
        // ⭐ 見出し処理（長い順に処理して正確にマッチング）
        if (paragraph.match(/^###\s+/)) {
          const headingText = paragraph.replace(/^###\s+/, "").trim();
          const id = safeId(headingText);
          console.log("Processing H3:", headingText); // デバッグログ
          html += `<h3 id="${id}" class="japanese-style-modern-h3">${processInlineMarkdown(
            headingText
          )}</h3>`;
        }
        // ⭐ 見出し2
        else if (paragraph.match(/^##\s+/)) {
          const headingText = paragraph.replace(/^##\s+/, "").trim();
          const id = safeId(headingText);
          console.log("Processing H2:", headingText); // デバッグログ
          html += `<h2 id="${id}" class="japanese-style-modern-h2">${processInlineMarkdown(
            headingText
          )}</h2>`;
        }
        // ⭐ 見出し1
        else if (paragraph.match(/^#\s+/)) {
          const headingText = paragraph.replace(/^#\s+/, "").trim();
          const id = safeId(headingText);
          console.log("Processing H1:", headingText); // デバッグログ
          if (i > 0) {
            html += '</section><section class="japanese-style-modern-section">';
          }
          html += `<h1 id="${id}" class="japanese-style-modern-h1">${processInlineMarkdown(
            headingText
          )}</h1>`;
        }
        // ⭐ 引用ブロック
        else if (paragraph.match(/^>\s/)) {
          const quoteLines = paragraph
            .split("\n")
            .map((line) => line.replace(/^>\s?/, "").trim())
            .filter((line) => line.length > 0)
            .join(" ");
          html += `<blockquote class="japanese-style-modern-blockquote"><p class="japanese-style-modern-p">${processInlineMarkdown(
            quoteLines
          )}</p></blockquote>`;
        }
        // ⭐ 箇条書きリスト（改良版）
        else if (paragraph.match(/^\s*-\s/)) {
          const lines = paragraph.split("\n").filter((line) => line.trim());
          let listHtml = '<ul class="japanese-style-modern-ul">';

          lines.forEach((line) => {
            const trimmedLine = line.trim();
            if (trimmedLine.match(/^-\s+/)) {
              const content = trimmedLine.replace(/^-\s+/, "");
              if (content) {
                listHtml += `<li class="japanese-style-modern-li">${processInlineMarkdown(
                  content
                )}</li>`;
              }
            }
          });

          listHtml += "</ul>";
          html += listHtml;
        }
        // ⭐ 番号付きリスト（改良版）
        else if (paragraph.match(/^\s*\d+\.\s/)) {
          const lines = paragraph.split("\n").filter((line) => line.trim());
          let listHtml = '<ol class="japanese-style-modern-ol">';

          lines.forEach((line) => {
            const trimmedLine = line.trim();
            const match = trimmedLine.match(/^\d+\.\s+(.+)$/);
            if (match && match[1]) {
              listHtml += `<li class="japanese-style-modern-li">${processInlineMarkdown(
                match[1]
              )}</li>`;
            }
          });

          listHtml += "</ol>";
          html += listHtml;
        }
        // ⭐ 水平線
        else if (paragraph.match(/^(-{3,}|\*{3,}|_{3,})$/)) {
          html += '<hr class="japanese-style-modern-hr" />';
        }
        // ⭐ 通常の段落
        else {
          // 複数行の段落を正しく処理
          const lines = paragraph
            .split("\n")
            .map((line) => line.trim())
            .filter((line) => line);
          if (lines.length > 0) {
            const content = lines.join(" ");
            html += `<p class="japanese-style-modern-p">${processInlineMarkdown(
              content
            )}</p>`;
          }
        }
      } catch (paragraphError) {
        console.warn("Error processing paragraph:", paragraphError, paragraph);
        // エラーが発生した段落は通常のテキストとして表示
        html += `<p class="japanese-style-modern-p">${processInlineMarkdown(
          paragraph
        )}</p>`;
      }
    }

    html += "</section>";
    return html;
  } catch (error) {
    console.error("Critical error in renderEnhancedMarkdown:", error);
    return `<section class="japanese-style-modern-section">
      <p class="japanese-style-modern-p">Content rendering error. Please check the markdown format.</p>
      <pre style="background: #1a1a1a; padding: 1rem; border-radius: 4px; color: #f3f3f2; font-size: 0.9rem; white-space: pre-wrap;">${content.slice(
        0,
        500
      )}${content.length > 500 ? "..." : ""}</pre>
    </section>`;
  }
};

const extractHeaders = (content: string): TocItem[] => {
  const headers: TocItem[] = [];
  const lines = content.split("\n");

  lines.forEach((line) => {
    const trimmedLine = line.trim();

    // ⭐ 長い順に処理（### → ## → #）
    if (trimmedLine.match(/^###\s+/)) {
      const text = trimmedLine.replace(/^###\s+/, "").trim();
      const id = safeId(text);
      headers.push({ id, text, level: 3 });
      console.log("TOC H3:", text); // デバッグログ
    } else if (trimmedLine.match(/^##\s+/)) {
      const text = trimmedLine.replace(/^##\s+/, "").trim();
      const id = safeId(text);
      headers.push({ id, text, level: 2 });
      console.log("TOC H2:", text); // デバッグログ
    } else if (trimmedLine.match(/^#\s+/)) {
      const text = trimmedLine.replace(/^#\s+/, "").trim();
      const id = safeId(text);
      headers.push({ id, text, level: 1 });
      console.log("TOC H1:", text); // デバッグログ
    }
  });

  return headers;
};

export default function ArticleClientPage({ article }: { article: Article }) {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [showMobileToc, setShowMobileToc] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const { renderedContent, tableOfContents } = useMemo(() => {
    // ⭐ デバッグログを追加
    console.log("Rendering markdown content:", {
      contentLength: article.content?.length,
      updatedAt: article.updatedAt,
      slug: article.slug,
      contentPreview: article.content?.substring(0, 200),
    });

    // ⭐ より厳密なMarkdownパターン検出
    const mdPatterns = [
      /^#{1,3}\s+.+$/m, // 見出し（# ## ###）
      /\*\*.+?\*\*/, // 太字
      /\*.+?\*/, // 斜体
      /^\s*-\s+.+$/m, // 箇条書きリスト
      /^\s*\d+\.\s+.+$/m, // 番号付きリスト
      /\[[^\]]+\]\([^)]+\)/, // リンク
      /!\[[^\]]*\]\([^)]+\)/, // 画像
      /^>\s.+$/m, // 引用
      /^(-{3,}|\*{3,}|_{3,})$/m, // 水平線
      /`[^`]+`/, // インラインコード
    ];

    const contentIsMarkdown = mdPatterns.some((pattern) => {
      const match = pattern.test(article.content);
      if (match) {
        console.log("Detected markdown pattern:", pattern.source);
      }
      return match;
    });

    console.log("Content is markdown:", contentIsMarkdown);

    if (contentIsMarkdown) {
      const html = renderEnhancedMarkdown(article.content);
      const toc = extractHeaders(article.content);
      console.log("Generated TOC:", toc);
      return { renderedContent: html, tableOfContents: toc };
    } else {
      return {
        renderedContent: `<section class="japanese-style-modern-section"><p class="japanese-style-modern-p">${article.content}</p></section>`,
        tableOfContents: [],
      };
    }
  }, [
    article.content,
    article.updatedAt,
    article.slug,
    article.id, // ⭐ 記事IDも依存関係に追加
  ]);

  // ⭐ 記事データ変更の監視とデバッグ
  useEffect(() => {
    console.log("Article data changed:", {
      title: article.title,
      slug: article.slug,
      updatedAt: article.updatedAt,
      contentPreview: article.content?.substring(0, 100) + "...",
    });
  }, [article]);

  // ⭐ スクロール処理
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

  // ⭐ Markdown内画像の動的管理
  useEffect(() => {
    if (!contentRef.current) return;

    const processMarkdownImages = () => {
      const imageContainers = contentRef.current?.querySelectorAll(
        ".markdown-image-container"
      );
      if (!imageContainers) return;

      imageContainers.forEach((container) => {
        const existingImg = container.querySelector("img");
        if (existingImg) return; // 既に処理済み

        const src = container.getAttribute("data-src");
        const alt = container.getAttribute("data-alt") || "";
        const loader = container.querySelector(
          ".markdown-image-loader"
        ) as HTMLElement;

        if (!src || !loader) return;

        // 画像要素を作成
        const img = document.createElement("img");
        img.src = src;
        img.alt = alt;
        img.loading = "lazy";
        img.decoding = "async";
        img.style.cssText = `
          max-width: 100%; 
          height: auto; 
          border-radius: 8px; 
          box-shadow: 0 4px 12px rgba(0,0,0,0.15); 
          display: block; 
          opacity: 0; 
          transition: opacity 0.5s ease;
          margin: 0;
        `;

        // 読み込み完了時の処理
        const handleLoad = () => {
          img.style.opacity = "1";
          if (loader) {
            loader.style.display = "none";
          }
        };

        // エラー時の処理
        const handleError = () => {
          img.style.display = "none";
          if (loader) {
            loader.innerHTML = `
              <div style="text-align: center; color: #9ca3af;">
                <div style="font-size: 2rem; margin-bottom: 0.5rem;">📷</div>
                <div>画像を読み込めませんでした</div>
              </div>
            `;
            loader.style.background =
              "linear-gradient(135deg, #262626, #1a1a1a)";
            loader.style.animation = "none";
          }
        };

        // ⭐ キャッシュされた画像の即座チェック
        if (img.complete && img.naturalHeight !== 0) {
          handleLoad();
        } else {
          img.addEventListener("load", handleLoad);
          img.addEventListener("error", handleError);
        }

        // 画像をコンテナに追加
        container.appendChild(img);
      });
    };

    // DOM更新後に実行
    const timer = setTimeout(processMarkdownImages, 100);

    // MutationObserverで動的コンテンツの変更を監視
    const observer = new MutationObserver(() => {
      processMarkdownImages();
    });

    observer.observe(contentRef.current, {
      childList: true,
      subtree: true,
    });

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [renderedContent]); // renderedContentが変更されたときに再実行

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
      {/* ⭐ Hero image - OptimizedImage使用 */}
      {hasFeaturedImage && (
        <div className="w-full bg-slate-950 overflow-hidden pt-8 px-4 sm:px-8">
          <div className="relative max-h-[500px] w-full flex justify-center">
            <OptimizedImage
              src={featuredImage}
              alt={article.title}
              className="h-auto max-h-[500px] w-full max-w-[800px] object-contain rounded-md"
              priority={true}
              width={800}
              height={500}
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
