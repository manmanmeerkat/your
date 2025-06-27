// components/articleClientPage/ArticleClientPage.tsx - 型修正版
"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { WhiteLine } from "@/components/whiteLine/whiteLine";
import { CATEGORY_LABELS } from "@/constants/constants";
import { TableOfContents } from "@/components/japanese-style/TableOfContents";
import { FloatingButtons } from "@/components/japanese-style/FloatingButtons";
import RelatedArticles from "@/components/sidebar/RelatedArticles";
import Redbubble from "../redBubble/RedBubble";
import { MarkdownRenderer } from "@/app/utils/simpleMarkdownRenderer";

// 🔧 共通型定義から直接インポート
import type { Article, ArticleTrivia, ArticleImage } from "@/types/types";

// 和風スタイルを読み込む
import "@/app/styles/japanese-style-modern.css";

// 既存の型定義（目次用）
export type TocItem = {
  id: string;
  text: string;
  level: number;
};

// 🔧 インターフェースの型をインポートした型に変更
interface ArticleClientPageProps {
  article: Article; // 既にstring型のcreatedAt, updatedAtを持つ型
}

// プラグインを事前にインポート
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

// ReactMarkdownを動的インポートでHydrationエラー回避
const DynamicMarkdown = dynamic(() => import("react-markdown"), {
  ssr: false,
  loading: () => (
    <div className="animate-pulse">
      <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-300 rounded w-1/2"></div>
    </div>
  ),
});

// Hydration安全な一口メモマークダウンレンダラー
const TriviaMarkdown: React.FC<{ content: string }> = ({ content }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // サーバーサイドまたはマウント前はプレーンテキストを表示
  if (!isMounted) {
    return (
      <div className="text-gray-200 leading-relaxed text-sm sm:text-base font-normal space-y-2">
        {content.split("\n").map((line, index) => (
          <p key={index} className="mb-2 last:mb-0">
            {line.replace(/\*\*(.*?)\*\*/g, "$1").replace(/\*(.*?)\*/g, "$1")}
          </p>
        ))}
      </div>
    );
  }

  // クライアントサイドでのみReactMarkdownを使用
  return (
    <DynamicMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw]}
      components={{
        // 段落
        p: ({ children, ...props }) => (
          <p
            className="text-gray-200 leading-relaxed text-sm sm:text-base font-normal mb-3 last:mb-0 text-left"
            style={{
              fontFamily:
                '"Inter", "Noto Sans JP", "Hiragino Kaku Gothic ProN", sans-serif',
              letterSpacing: "0.025em",
              lineHeight: "1.7",
            }}
            {...props}
          >
            {children}
          </p>
        ),

        // 太字
        strong: ({ children, ...props }) => {
          const text = Array.isArray(children)
            ? children.join("")
            : String(children || "");

          // 日本語の重要キーワードは黄色でハイライト
          if (/^(重要|ポイント|特に|注目|注意|必見|覚えておこう)$/.test(text)) {
            return (
              <strong
                className="text-yellow-400 font-bold bg-yellow-400/20 px-1 rounded"
                {...props}
              >
                {children}
              </strong>
            );
          }

          return (
            <strong className="text-white font-bold" {...props}>
              {children}
            </strong>
          );
        },

        // 斜体
        em: ({ children, ...props }) => (
          <em className="text-gray-300 italic" {...props}>
            {children}
          </em>
        ),

        // リンク
        a: ({ children, href, ...props }) => (
          <a
            href={href}
            className="text-blue-400 hover:text-blue-300 underline transition-colors duration-200"
            target={href?.startsWith("http") ? "_blank" : undefined}
            rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
            {...props}
          >
            {children}
          </a>
        ),

        // インラインコード
        code: ({ children, className, ...props }) => {
          const match = /language-(\w+)/.exec(className || "");

          if (!match) {
            // インラインコード
            return (
              <code
                className="bg-gray-700 text-yellow-300 px-2 py-1 rounded text-sm font-mono"
                {...props}
              >
                {children}
              </code>
            );
          }

          // コードブロック
          return (
            <code
              className="block bg-gray-800 text-yellow-300 p-3 rounded text-sm font-mono overflow-x-auto whitespace-pre my-2"
              {...props}
            >
              {children}
            </code>
          );
        },

        // コードブロック
        pre: ({ children, ...props }) => (
          <pre
            className="bg-gray-800 border border-gray-700 rounded-lg p-3 my-3 overflow-x-auto"
            {...props}
          >
            {children}
          </pre>
        ),

        // リスト
        ul: ({ children, ...props }) => (
          <ul
            className="list-disc list-inside text-gray-200 space-y-1 my-2 pl-2 text-left"
            {...props}
          >
            {children}
          </ul>
        ),

        ol: ({ children, ...props }) => (
          <ol
            className="list-decimal list-inside text-gray-200 space-y-1 my-2 pl-2 text-left"
            {...props}
          >
            {children}
          </ol>
        ),

        li: ({ children, ...props }) => (
          <li
            className="text-gray-200 leading-relaxed text-sm text-left"
            {...props}
          >
            {children}
          </li>
        ),

        // 引用
        blockquote: ({ children, ...props }) => (
          <blockquote
            className="border-l-4 border-yellow-400 bg-gray-800/50 pl-3 py-2 my-3 italic text-gray-300 text-sm text-left"
            {...props}
          >
            {children}
          </blockquote>
        ),

        // 見出し（一口メモ内では小さめに）
        h1: ({ children, ...props }) => (
          <h1
            className="text-lg font-bold text-[#c0a2c7] mb-2 mt-3 first:mt-0 text-left"
            {...props}
          >
            {children}
          </h1>
        ),

        h2: ({ children, ...props }) => (
          <h2
            className="text-base font-semibold text-[#c0a2c7] mb-2 mt-2 first:mt-0 text-left"
            {...props}
          >
            {children}
          </h2>
        ),

        h3: ({ children, ...props }) => (
          <h3
            className="text-sm font-semibold text-[#c0a2c7] mb-1 mt-2 first:mt-0 text-left"
            {...props}
          >
            {children}
          </h3>
        ),

        // 水平線
        hr: ({ ...props }) => (
          <hr className="border-gray-600 my-3" {...props} />
        ),

        // 改行をそのまま反映
        br: ({ ...props }) => <br {...props} />,

        // 動画埋め込み（iframe）を中央揃え
        iframe: ({ ...props }) => (
          <div className="flex justify-center my-4">
            <iframe className="rounded-lg shadow-lg" {...props} />
          </div>
        ),

        // 画像も中央揃え
        img: ({ ...props }) => (
          <div className="flex justify-center my-4">
            <img
              className="rounded-lg shadow-lg max-w-full h-auto"
              {...props}
            />
          </div>
        ),
      }}
    >
      {content}
    </DynamicMarkdown>
  );
};

// Hydration安全な一口メモコンポーネント
const TriviaCard: React.FC<{ trivia: ArticleTrivia; index: number }> = ({
  trivia,
  index,
}) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // const kanjiNumbers = [
  //   "一",
  //   "二",
  //   "三",
  //   "四",
  //   "五",
  //   "六",
  //   "七",
  //   "八",
  //   "九",
  //   "十",
  // ];

  // 表示するコンテンツを決定（英語版があれば英語版、なければ日本語版）
  const displayContent = trivia.contentEn || trivia.content;

  return (
    <div className="my-2 mx-auto max-w-4xl flex justify-center">
      <div className="relative bg-gradient-to-br from-[#000b00] via-[#302833] to-[#000b00] border border-[#a59aca] rounded-lg shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden group w-full max-w-2xl">

        {/* 四隅の角飾り */}
        <div className="absolute top-3 left-3 w-2 h-2 border-l border-t border-[#f1bf99] rounded-sm opacity-70"></div>
        <div className="absolute top-3 right-3 w-2 h-2 border-r border-t border-[#f1bf99] rounded-sm opacity-70"></div>
        <div className="absolute bottom-3 left-3 w-2 h-2 border-l border-b border-[#f1bf99] rounded-sm opacity-70"></div>
        <div className="absolute bottom-3 right-3 w-2 h-2 border-r border-b border-[#f1bf99] rounded-sm opacity-70"></div>

        {/* 内容 */}
        <div className="relative p-6 sm:p-8 text-center">
          {/* メインテキスト */}
          <div className="mt-4 relative text-center">
            <div className="relative z-10 text-center">
              {/* タイトル */}
              <h4 className="flex items-center justify-center gap-1 py-2 px-10 bg-[#302833] mx-auto w-fit border-l-4 border-[#a59aca]">
                <span className="text-2xl font-bold text-[#f3f3f2] font-serif tracking-widest">
                  Trivia
                </span>
              </h4>
          {/* 上部飾り */}
          <div className="mt-6 flex justify-center">
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-[#f1bf99]"></div>
              <div className="w-8 h-px bg-gradient-to-r from-gray-600 via-[#f19072] to-gray-600"></div>
              <div className="w-1 h-1 rounded-full bg-[#f1bf99]"></div>
            </div>
          </div>

              {/* マークダウンコンテンツをレンダリング（Hydration安全） */}
              <div className="trivia-markdown-content text-center py-6 mt-4">
                <TriviaMarkdown content={displayContent} />
              </div>

              {/* 英語と日本語両方がある場合の補足表示 */}
              {trivia.contentEn &&
                trivia.content !== trivia.contentEn &&
                isClient && (
                  <details className="mt-3 border-t border-gray-600 pt-3 text-center">
                    <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-300">
                      日本語版を表示
                    </summary>
                    <div className="mt-2 text-xs text-gray-400 border-l-2 border-gray-600 pl-3 text-center">
                      <TriviaMarkdown content={trivia.content} />
                    </div>
                  </details>
                )}
            </div>
          </div>

          {/* 下部飾り */}
          <div className="mt-6 flex justify-center">
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-[#f1bf99]"></div>
              <div className="w-8 h-px bg-gradient-to-r from-gray-600 via-[#f19072] to-gray-600"></div>
              <div className="w-1 h-1 rounded-full bg-[#f1bf99]"></div>
            </div>
          </div>

          {/* タグ表示（クライアントサイドのみ） */}
          {trivia.tags && trivia.tags.length > 0 && isClient && (
            <div className="mt-4 flex flex-wrap gap-1 justify-center">
              {trivia.tags.slice(0, 3).map((tag: string, tagIndex: number) => (
                <span
                  key={tagIndex}
                  className="text-xs bg-gray-700/50 text-gray-400 px-2 py-1 rounded-full border border-gray-600"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 側面装飾
        <div className="absolute left-1 top-8 bottom-8 w-px bg-gradient-to-b from-transparent via-gray-700 to-transparent opacity-50"></div>
        <div className="absolute right-1 top-8 bottom-8 w-px bg-gradient-to-b from-transparent via-gray-700 to-transparent opacity-30"></div> */}

        {/* ホバー光沢 */}
        {/* <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div> */}
      </div>
    </div>
  );
};

// プレースホルダーコンポーネント（SSR用）
const TriviaPlaceholder: React.FC<{ index: number }> = ({ index }) => {
  const kanjiNumbers = [
    "一",
    "二",
    "三",
    "四",
    "五",
    "六",
    "七",
    "八",
    "九",
    "十",
  ];

  return (
    <div className="my-8 mx-auto max-w-4xl">
      <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700 rounded-2xl shadow-lg overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent"></div>

        <div className="relative p-6 sm:p-8">
          <div className="absolute top-4 left-4">
            <div className="w-8 h-8 rounded-full bg-gray-800 border border-gray-700 shadow-sm flex items-center justify-center">
              <span className="text-xs font-bold text-gray-300 tracking-wider font-serif">
                {kanjiNumbers[index] || (index + 1).toString()}
              </span>
            </div>
          </div>

          <div className="mt-4 pr-12 relative">
            <div className="absolute -left-3 -top-1 text-3xl text-gray-600 leading-none select-none opacity-50 font-serif">
              「
            </div>

            <div className="relative z-10 pr-4">
              <h4 className="text-base font-semibold text-yellow-400 mb-3 font-serif">
                Trivia
              </h4>

              {/* ローディングプレースホルダー */}
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-gray-700 rounded w-full"></div>
                <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                <div className="h-4 bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>

            <div className="absolute -right-1 -bottom-3 text-3xl text-gray-600 leading-none select-none opacity-50 font-serif">
              」
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-gray-500"></div>
              <div className="w-8 h-px bg-gradient-to-r from-gray-600 via-gray-500 to-gray-600"></div>
              <div className="w-1 h-1 rounded-full bg-gray-500"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Hydration安全なコンテンツレンダリング - コンポーネント化
const ContentWithTrivia: React.FC<{
  content: string;
  triviaList?: ArticleTrivia[];
}> = ({ content, triviaList }) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!triviaList || triviaList.length === 0) {
    return <MarkdownRenderer content={content} />;
  }

  // 一口メモ記法で分割
  const triviaRegex = /(:::trivia\[[^\]]+\])/g;
  const parts = content.split(triviaRegex);
  const elements: React.ReactNode[] = [];
  const usedTrivia = new Set<string>();

  let currentContent = "";

  parts.forEach((part, index) => {
    const triviaMatch = part.match(/:::trivia\[([^\]]+)\]/);

    if (triviaMatch) {
      // 現在のコンテンツがある場合は先にレンダリング
      if (currentContent.trim()) {
        elements.push(
          <MarkdownRenderer
            key={`content-${index}`}
            content={currentContent.trim()}
          />
        );
        currentContent = "";
      }

      // 一口メモを追加
      const identifier = triviaMatch[1];
      let trivia: ArticleTrivia | undefined;
      let triviaIndex = 0;

      // IDまたはインデックスで一口メモを検索
      if (isNaN(Number(identifier))) {
        trivia = triviaList.find((t) => t.id === identifier && t.isActive);
        triviaIndex = triviaList.findIndex((t) => t.id === identifier);
      } else {
        const idx = parseInt(identifier, 10);
        trivia = triviaList[idx];
        triviaIndex = idx;
      }

      if (trivia && trivia.isActive && !usedTrivia.has(trivia.id)) {
        usedTrivia.add(trivia.id);

        // クライアントサイドでのみTriviaCard、サーバーサイドではプレースホルダー
        if (isClient) {
          elements.push(
            <TriviaCard
              key={`trivia-${trivia.id}-${index}`}
              trivia={trivia}
              index={triviaIndex}
            />
          );
        } else {
          elements.push(
            <TriviaPlaceholder
              key={`trivia-placeholder-${index}`}
              index={triviaIndex}
            />
          );
        }
      } else if (
        !trivia &&
        process.env.NODE_ENV === "development" &&
        isClient
      ) {
        // 一口メモが見つからない場合の警告表示（開発時のみ、クライアントサイドのみ）
        elements.push(
          <div
            key={`trivia-error-${index}`}
            className="my-4 p-4 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm"
          >
            ⚠️ 一口メモ &quot;{identifier}&quot; が見つかりません
          </div>
        );
      }
    } else {
      // 通常のマークダウンコンテンツを蓄積
      currentContent += part;
    }
  });

  // 最後に残ったコンテンツを追加
  if (currentContent.trim()) {
    elements.push(
      <MarkdownRenderer key={`content-final`} content={currentContent.trim()} />
    );
  }

  return <>{elements}</>;
};

// 既存のOptimizedImageコンポーネント（変更なし）
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
    const timer = setTimeout(() => {
      setShouldShowLoader(false);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

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

const ArticleClientPage: React.FC<ArticleClientPageProps> = ({ article }) => {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [showMobileToc, setShowMobileToc] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);

  // 目次生成（元のコンテンツから）
  const tableOfContents = useMemo(() => {
    return extractHeaders(article.content);
  }, [article.content]);

  // 一口メモ付きコンテンツをレンダリング（Hydration安全）
  const renderedContent = useMemo(() => {
    const activeTrivia =
      article.trivia?.filter((t: ArticleTrivia) => t.isActive) || [];
    return (
      <ContentWithTrivia content={article.content} triviaList={activeTrivia} />
    );
  }, [article.content, article.trivia]);

  // 既存のスクロール処理（変更なし）
  const handleScroll = useCallback(() => {
    if (typeof window === "undefined") return;

    setShowScrollTop(window.scrollY > 300);

    if (tableOfContents.length > 0) {
      const headings = document.querySelectorAll(
        ".japanese-style-modern-section h1[id], .japanese-style-modern-section h2[id], .japanese-style-modern-section h3[id]"
      );

      if (headings.length === 0) return;

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
        const distanceFromViewportCenter = Math.abs(
          elementTop - viewportCenter
        );

        if (
          elementTop <= currentScrollY + headerOffset &&
          distanceFromViewportCenter < closestDistance
        ) {
          closestDistance = distanceFromViewportCenter;
          activeId = heading.id;
        }
      });

      if (currentScrollY + windowHeight >= documentHeight - 100) {
        const lastHeading = headings[headings.length - 1];
        if (lastHeading) {
          activeId = lastHeading.id;
        }
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

      const element = document.getElementById(id);
      if (!element) return;

      // モバイル・タブレット用の処理
      if (window.innerWidth < 1280) {
        // xl未満
        const elementRect = element.getBoundingClientRect();
        // `scrollPosition`（TOCを開いた時のスクロール位置）を基準にターゲット位置を計算
        const targetScrollY = elementRect.top + scrollPosition - 100; // ヘッダー分のオフセット

        // 先にTOCを閉じる
        setShowMobileToc(false);
        document.body.classList.remove("toc-open");
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";

        // スタイルが適用された後にスクロールを実行
        requestAnimationFrame(() => {
          window.scrollTo({
            top: Math.max(0, targetScrollY),
            behavior: "smooth",
          });
        });
      } else {
        // デスクトップ用の処理 (xl以上)
        const elementPosition =
          element.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - 100;

        window.scrollTo({
          top: Math.max(0, offsetPosition),
          behavior: "smooth",
        });
      }

      setActiveSection(id);
    },
    [scrollPosition]
  );

  const toggleMobileToc = useCallback(() => {
    setShowMobileToc((prev) => {
      const newValue = !prev;

      if (newValue) {
        const currentScroll = window.scrollY;
        setScrollPosition(currentScroll);

        document.body.classList.add("toc-open");
        document.body.style.position = "fixed";
        document.body.style.top = `-${currentScroll}px`;
        document.body.style.width = "100%";
      } else {
        document.body.classList.remove("toc-open");
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";

        setTimeout(() => {
          if (scrollPosition > 0) {
            window.scrollTo(0, scrollPosition);
          }
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
      if (scrollPosition >= 0) {
        window.scrollTo(0, scrollPosition);
      }
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

  const featuredImage = useMemo(
    () =>
      article.images?.find((img: ArticleImage) => img.isFeatured)?.url ??
      "/fallback.jpg",
    [article.images]
  );

  const hasFeaturedImage = article.images?.some(
    (img: ArticleImage) => img.isFeatured
  );

  // 🔧 Date型を安全に文字列に変換
  const formatDisplayDate = (date: Date): string => {
    try {
      return date.toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      console.warn("日付表示エラー:", error);
      return new Date().toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
  };

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

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="japanese-style-modern">
          <div className="japanese-style-modern-header">
            <h1 className="japanese-style-modern-title">{article.title}</h1>
            <div className="japanese-style-modern-date">
              {formatDisplayDate(article.updatedAt)}
            </div>
          </div>

          <div className="japanese-style-modern-container">
            {/* タブレット・デスクトップ用レイアウト修正 */}
            <div className="flex flex-col xl:flex-row gap-8">
              {/* メインコンテンツ */}
              <div className="order-2 xl:order-1 flex-1 min-w-0">
                <div className="japanese-style-modern-content max-w-none">
                  {/* Hydration安全な一口メモ付きコンテンツをレンダリング */}
                  <div className="prose prose-lg prose-invert max-w-none overflow-hidden">
                    {renderedContent}
                  </div>
                </div>
              </div>

              {/* 右サイドバー - xl以上でのみ表示 */}
              <div className="order-1 xl:order-2 xl:w-80 flex-shrink-0">
                <div className="space-y-6 xl:sticky xl:top-8">
                  {/* デスクトップ専用目次 */}
                  {tableOfContents.length > 0 && (
                    <div className="hidden xl:block">
                      <aside className="japanese-style-modern-sidebar desktop-sidebar scrollbar-custom">
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
                  )}

                  {/* 関連記事 - デスクトップ専用サイドバー */}
                  <div className="hidden xl:block">
                    <RelatedArticles
                      currentCategory={article.category}
                      currentArticleId={article.id}
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

        {/* モバイル・タブレット専用関連記事エリア */}
        <div className="block xl:hidden mt-8">
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

      {/* モバイル・タブレット専用目次 */}
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
