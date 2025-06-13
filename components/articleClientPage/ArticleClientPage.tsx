"use client";

import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { WhiteLine } from "@/components/whiteLine/whiteLine";
import { CATEGORY_LABELS } from "@/constants/constants";
import { TableOfContents } from "@/components/japanese-style/TableOfContents";
import { FloatingButtons } from "@/components/japanese-style/FloatingButtons";
import RelatedArticles from "@/components/sidebar/RelatedArticles";
import Redbubble from "../redBubble/RedBubble";

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
      <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg p-8 text-center text-gray-500 flex items-center justify-center min-h-[200px]">
        <div className="text-center">Failed to load image.</div>
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
        ref={imgRef}
        src={src}
        alt={alt}
        width={width}
        height={height}
        unoptimized={true}
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
  return text
    .toLowerCase()
    .replace(/[^\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+/g, "-");
};

// ⭐ テーブル処理関数を追加（黒ベース和風デザイン対応）
const processTable = (tableText: string): string => {
  const lines = tableText.trim().split("\n");
  if (lines.length < 2) return tableText;

  const headerLine = lines[0];
  const separatorLine = lines[1];
  const dataLines = lines.slice(2);

  // セパレーター行の確認（|---|---|のような形式）
  if (!separatorLine.match(/^\s*\|?[\s\-:|]+\|\s*$/)) {
    return tableText; // テーブル形式でない場合は元のテキストを返す
  }

  // ヘッダーの解析
  const headers = headerLine
    .split("|")
    .map((cell) => cell.trim())
    .filter((cell) => cell !== "");

  if (headers.length === 0) return tableText;

  // 黒ベース和風カラーパレット
  const colors = {
    primary: "#1a1a1a",
    primaryLight: "#2d2d2d",
    accent: "#df7163",
    accentLight: "#e8998f",
    textPrimary: "#ffffff",
    textSecondary: "#e2e8f0",
    border: "#404040",
    borderAccent: "#df7163",
    alternateRow: "#262626",
    hoverRow: "#333333",
  };

  // テーブルHTMLの構築（黒ベース和風スタイル）
  let tableHtml = `
    <div class="table-wrapper" style="
      overflow-x: auto; 
      margin: 2rem 0; 
      border-radius: 12px; 
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(223, 113, 99, 0.2);
      background: linear-gradient(135deg, rgba(26, 26, 26, 0.95), rgba(45, 45, 45, 0.95));
      padding: 1px;
    ">
      <table class="japanese-style-modern-table" style="
        width: 100%; 
        border-collapse: collapse; 
        border-radius: 11px; 
        overflow: hidden;
        background: ${colors.primary};
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans JP', sans-serif;
      ">`;

  // ヘッダー行（黒ベースに朱色アクセント）
  tableHtml += `
    <thead style="
      background: linear-gradient(135deg, ${colors.primary}, ${colors.primaryLight});
      position: relative;
      border-bottom: 2px solid ${colors.accent};
    ">
      <tr>`;

  headers.forEach((header, index) => {
    const borderRight =
      index < headers.length - 1
        ? `border-right: 1px solid rgba(223, 113, 99, 0.3);`
        : "";
    tableHtml += `
      <th style="
        padding: 18px 24px; 
        text-align: left; 
        font-weight: 700; 
        color: ${colors.textPrimary}; 
        font-size: 1rem;
        letter-spacing: 0.8px;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
        ${borderRight}
        position: relative;
        background: linear-gradient(135deg, rgba(223, 113, 99, 0.1), rgba(232, 153, 143, 0.05));
      ">${processInlineMarkdown(header)}</th>`;
  });

  tableHtml += `
      </tr>
      <tr style="height: 3px;">
        <td colspan="${headers.length}" style="
          background: linear-gradient(90deg, 
            transparent 0%, 
            rgba(223, 113, 99, 0.5) 20%, 
            rgba(223, 113, 99, 0.8) 50%, 
            rgba(223, 113, 99, 0.5) 80%, 
            transparent 100%
          );
          padding: 0;
          border: none;
        "></td>
      </tr>
    </thead>`;

  // データ行（黒ベースの交互背景、ホバーエフェクトなし）
  tableHtml += "<tbody>";
  dataLines.forEach((line, index) => {
    const cells = line
      .split("|")
      .map((cell) => cell.trim())
      .filter((cell) => cell !== "");

    if (cells.length > 0) {
      const isEven = index % 2 === 0;
      const bgColor = isEven ? colors.primary : colors.alternateRow;

      tableHtml += `
        <tr style="
          background-color: ${bgColor};
          border-bottom: 1px solid ${colors.border};
        ">`;

      // ヘッダー数に合わせてセルを調整
      for (let i = 0; i < headers.length; i++) {
        const cellContent = cells[i] || "";
        const borderRight =
          i < headers.length - 1
            ? `border-right: 1px solid ${colors.border};`
            : "";

        tableHtml += `
          <td style="
            padding: 16px 24px; 
            color: ${colors.textPrimary};
            font-size: 0.95rem;
            line-height: 1.7;
            ${borderRight}
            vertical-align: top;
            font-weight: 400;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
          ">${processInlineMarkdown(cellContent)}</td>`;
      }
      tableHtml += "</tr>";
    }
  });

  tableHtml += "</tbody></table></div>";

  return tableHtml;
};

// ⭐ より堅牢なインライン処理関数（改行防止対応）
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

        // ⭐ 4. 括弧内テキストの改行防止
        .replace(
          /\(([^)]+)\)/g,
          '<span style="white-space: nowrap;">($1)</span>'
        )

        // ⭐ 5. 強調テキスト（流派名の特別処理）
        .replace(
          /\*\*([^*]*-ryu[^*]*)\*\*/g,
          '<strong class="ryu-name">$1</strong>'
        )
        .replace(
          /\*\*([^*]+)\*\*/g,
          '<strong class="japanese-style-modern-strong">$1</strong>'
        )

        // ⭐ 6. 斜体（強調の後に処理）
        .replace(/\*([^*]+)\*/g, '<em class="japanese-style-modern-em">$1</em>')

        // ⭐ 7. 特殊文字のエスケープ解除
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
    );
  } catch (error) {
    console.warn("Error processing inline markdown:", error, text);
    return text; // エラー時は元のテキストを返す
  }
};

// ⭐ より堅牢なMarkdownレンダリング関数（テーブル対応追加）
const renderEnhancedMarkdown = (content: string): string => {
  if (!content || typeof content !== "string") {
    console.warn("Invalid content provided to renderEnhancedMarkdown");
    return '<section class="japanese-style-modern-section"><p class="japanese-style-modern-p">No content available</p></section>';
  }

  try {
    let html = '<section class="japanese-style-modern-section">';

    // ⭐ テーブルを先に処理して置換
    const tableRegex = /(\|[^\n]*\|\n\|[\s\-:|]*\|\n(?:\|[^\n]*\|\n?)*)/g;
    const contentWithTables = content.replace(tableRegex, (match) => {
      return `\n\nTABLE_PLACEHOLDER_${btoa(match)}\n\n`;
    });

    // ⭐ より堅牢な段落分割
    const paragraphs = contentWithTables
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
        // ⭐ テーブルプレースホルダーの処理
        if (paragraph.startsWith("TABLE_PLACEHOLDER_")) {
          const encodedTable = paragraph.replace("TABLE_PLACEHOLDER_", "");
          try {
            const tableText = atob(encodedTable);
            html += processTable(tableText);
          } catch (e) {
            console.warn("Error decoding table:", e);
            html += `<p class="japanese-style-modern-p">テーブルの処理中にエラーが発生しました</p>`;
          }
        }
        // ⭐ 見出し1
        else if (paragraph.match(/^#\s+/)) {
          const headingText = paragraph.replace(/^#\s+/, "").trim();
          const id = safeId(headingText);
          if (i > 0) {
            html += '</section><section class="japanese-style-modern-section">';
          }
          html += `<h1 id="${id}" class="japanese-style-modern-h1">${processInlineMarkdown(
            headingText
          )}</h1>`;
        }
        // ⭐ 見出し2
        else if (paragraph.match(/^##\s+/)) {
          const headingText = paragraph.replace(/^##\s+/, "").trim();
          const id = safeId(headingText);
          html += `<h2 id="${id}" class="japanese-style-modern-h2">${processInlineMarkdown(
            headingText
          )}</h2>`;
        }
        // ⭐ 見出し3
        else if (paragraph.match(/^###\s+/)) {
          const headingText = paragraph.replace(/^###\s+/, "").trim();
          const id = safeId(headingText);
          html += `<h3 id="${id}" class="japanese-style-modern-h3">${processInlineMarkdown(
            headingText
          )}</h3>`;
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
  const [scrollPosition, setScrollPosition] = useState(0); // スクロール位置を保存
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
      /\|[^\n]*\|/, // テーブル検出パターンを追加
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

  // 🚨 改善版：より精密な見出し検出
  const handleScroll = useCallback(() => {
    if (typeof window === "undefined") return;

    setShowScrollTop(window.scrollY > 300);

    if (tableOfContents.length > 0) {
      // 🚨 改善：より精密な見出し検出
      const headings = document.querySelectorAll(
        ".japanese-style-modern-section h1[id], .japanese-style-modern-section h2[id], .japanese-style-modern-section h3[id]"
      );

      if (headings.length === 0) return;

      // 現在のスクロール位置
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // 🚨 改善：より正確な判定のための調整値
      const headerOffset = 120; // ヘッダーの高さ + マージン
      const viewportCenter = scrollPosition + windowHeight / 3; // ビューポートの上部1/3を基準点に

      let activeId = "";
      let closestDistance = Infinity;

      // 各見出しとの距離を計算して最も近いものを選択
      headings.forEach((heading) => {
        const rect = heading.getBoundingClientRect();
        const elementTop = rect.top + scrollPosition;

        // 🚨 改善：見出しがビューポートの上部1/3に入った時点でアクティブに
        const distanceFromViewportCenter = Math.abs(
          elementTop - viewportCenter
        );

        // 見出しが画面上部に来た場合、または最も近い見出しの場合
        if (
          elementTop <= scrollPosition + headerOffset &&
          distanceFromViewportCenter < closestDistance
        ) {
          closestDistance = distanceFromViewportCenter;
          activeId = heading.id;
        }
      });

      // 🚨 改善：ページの最下部近くの場合、最後の見出しをアクティブに
      if (scrollPosition + windowHeight >= documentHeight - 100) {
        const lastHeading = headings[headings.length - 1];
        if (lastHeading) {
          activeId = lastHeading.id;
        }
      }

      // 🚨 改善：ページトップ付近の場合、最初の見出しをアクティブに
      if (scrollPosition < 200 && headings[0]) {
        activeId = headings[0].id;
      }

      // アクティブ状態を更新（変更があった場合のみ）
      if (activeId !== activeSection) {
        setActiveSection(activeId);

        // 🚨 デバッグ用ログ（本番では削除）
        console.log(
          "Active section changed:",
          activeId,
          "Scroll position:",
          scrollPosition
        );
      }
    }
  }, [tableOfContents.length, activeSection]);

  // 🚨 改善：Intersection Observer を使ったより高精度な検出（オプション）
  const useIntersectionObserver = () => {
    useEffect(() => {
      if (typeof window === "undefined" || tableOfContents.length === 0) return;

      const headings = document.querySelectorAll(
        ".japanese-style-modern-section h1[id], .japanese-style-modern-section h2[id], .japanese-style-modern-section h3[id]"
      );

      if (headings.length === 0) return;

      const observer = new IntersectionObserver(
        (entries) => {
          // 現在表示されている見出しを収集
          const visibleHeadings = entries
            .filter((entry) => entry.isIntersecting)
            .sort((a, b) => {
              // Y座標でソート（上から順番）
              return a.boundingClientRect.top - b.boundingClientRect.top;
            });

          if (visibleHeadings.length > 0) {
            // 最も上にある見出しをアクティブに
            const activeId = visibleHeadings[0].target.id;
            if (activeId !== activeSection) {
              setActiveSection(activeId);
            }
          }
        },
        {
          rootMargin: "-20% 0px -80% 0px",
          threshold: 0,
        }
      );

      headings.forEach((heading) => observer.observe(heading));

      return () => {
        headings.forEach((heading) => observer.unobserve(heading));
        observer.disconnect();
      };
    }, [tableOfContents.length, activeSection]);
  };

  // カスタムフックを使用
  useIntersectionObserver();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleScrollEvent = () => handleScroll();
    window.addEventListener("scroll", handleScrollEvent, { passive: true });
    window.addEventListener("resize", handleScrollEvent);
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

  // ⭐ コンポーネントのアンマウント時にbodyクラスをクリーンアップ
  useEffect(() => {
    return () => {
      document.body.classList.remove("toc-open");
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
    };
  }, []);

  const scrollToTop = useCallback(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  // 🚨 完全修正: scrollToHeading 関数（スクロール位置復元を完全排除）
  // 🚨 最終修正: scrollToHeading 関数（位置計算方法を改善）
  const scrollToHeading = useCallback(
    (id: string) => {
      if (typeof window === "undefined") return;

      console.log("クリックされた見出しID:", id);

      const element = document.getElementById(id);
      if (!element) {
        console.log("要素が見つかりません:", id);
        const allHeadings = document.querySelectorAll("h1[id], h2[id], h3[id]");
        console.log(
          "利用可能な見出し:",
          Array.from(allHeadings).map((h) => h.id)
        );
        return;
      }

      console.log("要素が見つかりました:", element);

      // モバイルの場合
      if (window.innerWidth <= 768) {
        // 🚨 重要: body固定解除前に要素の絶対位置を計算
        const elementRect = element.getBoundingClientRect();
        const currentScrollY = window.scrollY;
        const absoluteElementPosition = elementRect.top + currentScrollY;

        console.log("body固定前の要素位置計算:");
        console.log("- element.getBoundingClientRect().top:", elementRect.top);
        console.log("- window.scrollY:", currentScrollY);
        console.log("- 絶対位置:", absoluteElementPosition);

        // 1. 目次を閉じる
        setShowMobileToc(false);

        // 2. body の固定を解除
        document.body.classList.remove("toc-open");
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";

        console.log("モバイル: body固定解除完了");

        // 🚨 重要: 計算済みの絶対位置を使用してスクロール
        requestAnimationFrame(() => {
          const offsetPosition = absoluteElementPosition - 100;

          console.log("計算済み位置でスクロール開始:", offsetPosition);

          // 負の値の場合は0に調整
          const finalPosition = Math.max(0, offsetPosition);

          window.scrollTo({
            top: finalPosition,
            behavior: "smooth",
          });

          setActiveSection(id);
        });
      } else {
        // デスクトップの場合は通常のスクロール
        const elementPosition =
          element.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - 100;

        console.log("デスクトップ スクロール開始:", offsetPosition);

        window.scrollTo({
          top: Math.max(0, offsetPosition), // 負の値を防ぐ
          behavior: "smooth",
        });

        setActiveSection(id);
      }
    },
    [] // 依存関係を完全に削除
  );

  // 🚨 修正: toggleMobileToc関数（見出しクリック時の処理を分離）
  const toggleMobileToc = useCallback(() => {
    setShowMobileToc((prev) => {
      const newValue = !prev;

      if (newValue) {
        // 目次を開く - 現在のスクロール位置を保存
        const currentScroll = window.scrollY;
        setScrollPosition(currentScroll);

        document.body.classList.add("toc-open");
        document.body.style.position = "fixed";
        document.body.style.top = `-${currentScroll}px`;
        document.body.style.width = "100%";

        console.log("目次を開く: スクロール位置保存:", currentScroll);
      } else {
        // 🚨 重要: toggleMobileToc経由で閉じる場合のみスクロール位置を復元
        // （×ボタンやオーバーレイクリック時）
        document.body.classList.remove("toc-open");
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";

        // 少し遅延してからスクロール位置を復元
        setTimeout(() => {
          if (scrollPosition > 0) {
            window.scrollTo(0, scrollPosition);
            console.log("目次を閉じる: スクロール位置復元:", scrollPosition);
          }
        }, 50);
      }

      return newValue;
    });
  }, [scrollPosition]);

  // 🚨 修正: closeMobileToc関数（×ボタン・オーバーレイ専用、必ずスクロール位置復元）
  const closeMobileToc = useCallback(() => {
    console.log("closeMobileToc呼び出し - スクロール位置復元あり");

    setShowMobileToc(false);

    document.body.classList.remove("toc-open");
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.width = "";

    // ×ボタン・オーバーレイクリック時は必ずスクロール位置を復元
    setTimeout(() => {
      if (scrollPosition >= 0) {
        // 0以上で復元（ページトップでも0は有効）
        window.scrollTo(0, scrollPosition);
        console.log(
          "×ボタン/オーバーレイ: スクロール位置復元:",
          scrollPosition
        );
      }
    }, 50);
  }, [scrollPosition]);

  const featuredImage = useMemo(
    () => article.images.find((img) => img.isFeatured)?.url ?? "/fallback.jpg",
    [article.images]
  );

  const hasFeaturedImage = article.images?.some((img) => img.isFeatured);

  return (
    <div className="min-h-screen article-page-container">
      {/* Hero image */}
      {hasFeaturedImage && (
        <div className="w-full overflow-hidden pt-8 px-4 sm:px-8">
          <div className="relative max-h-[400px] w-full flex justify-center">
            <OptimizedImage
              src={featuredImage}
              alt={article.title}
              className="h-auto max-h-[400px] w-full max-w-[400px] object-contain rounded-md"
              priority={true}
              width={400}
              height={400}
            />
          </div>
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
            <div className="flex flex-col lg:flex-row gap-8">
              {/* 🚨 修正：右サイドバー - レスポンシブ対応 */}
              <div className="order-1 lg:order-2 lg:w-80 flex-shrink-0">
                <div className="space-y-6 lg:sticky lg:top-8">
                  {/* デスクトップ用目次（モバイルでは非表示） */}
                  <div className="hidden lg:block">
                    <aside className="japanese-style-modern-sidebar scrollbar-custom">
                      <h3 className="japanese-style-modern-sidebar-title">
                        Contents
                      </h3>
                      <nav>
                        {tableOfContents.map((item) => (
                          <div
                            key={item.id}
                            className={`japanese-style-modern-toc-item ${
                              activeSection === item.id ? "active" : ""
                            }`}
                            data-level={item.level}
                            onClick={() => scrollToHeading(item.id)}
                            style={{ cursor: "pointer" }}
                          >
                            {item.text}
                          </div>
                        ))}
                      </nav>
                    </aside>
                  </div>

                  {/* 🚨 修正：関連記事 - デスクトップ用サイドバー */}
                  <div className="hidden lg:block">
                    <RelatedArticles
                      currentCategory={article.category}
                      currentArticleId={article.id}
                    />
                  </div>
                </div>
              </div>

              {/* メインコンテンツ */}
              <div className="order-2 lg:order-1 flex-1 min-w-0">
                <div className="flex-1 min-w-0">
                  <div className="japanese-style-modern-content">
                    <div
                      ref={contentRef}
                      dangerouslySetInnerHTML={{ __html: renderedContent }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <FloatingButtons
            showScrollTop={showScrollTop}
            scrollToTop={scrollToTop}
            toggleMobileToc={toggleMobileToc}
          />
        </div>

        {/* 🚨 追加：モバイル・タブレット専用関連記事エリア */}
        <div className="block lg:hidden mt-8">
          <RelatedArticles
            currentCategory={article.category}
            currentArticleId={article.id}
          />
        </div>

        <div className="flex flex-col justify-center items-center mt-24 gap-8">
          <Link href={`/${article.category}`}>
            <Button
              size="lg"
              className="
                w-[320px] 
                border border-[#df7163] bg-[#df7163] text-[#f3f3f2]
                hover:bg-[#f3f3f2] hover:text-[#df7163] hover:border-[#df7163] hover:font-bold
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
                border border-[#df7163] bg-[#df7163] text-[#f3f3f2] 
                hover:bg-[#f3f3f2] hover:text-[#df7163] hover:border-[#df7163] hover:font-bold
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
        <Redbubble />
      </div>

      {/* 🚨 重要：モバイル目次を記事コンテナの外側に配置 */}
      <TableOfContents
        tableOfContents={tableOfContents}
        activeSection={activeSection}
        scrollToHeading={scrollToHeading}
        showMobileToc={showMobileToc}
        closeMobileToc={closeMobileToc}
      />
    </div>
  );
}
