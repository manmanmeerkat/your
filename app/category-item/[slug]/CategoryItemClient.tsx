// app/category-item/[slug]/CategoryItemClient.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { CATEGORY_CONFIG } from "@/constants/constants";
import { BackToHomeBtn } from "@/components/backToHomeBtn/BackToHomeBtn";
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
  images: Image[];
};

// テーブル・オブ・コンテンツの項目型定義
export type TocItem = {
  id: string;
  text: string;
  level: number;
};

// 安全なID生成ヘルパー関数
const safeId = (text: unknown): string => {
  if (typeof text !== "string") {
    return `heading-${Math.random().toString(36).substring(2, 9)}`;
  }

  try {
    return text.toLowerCase().replace(/[^\w]+/g, "-");
  } catch (error) {
    console.error("ID generation error:", error);
    return `heading-${Math.random().toString(36).substring(2, 9)}`;
  }
};

// インライン要素の処理（リンク、強調、コードなど）
const processInlineMarkdown = (text: string): string => {
  if (!text) return "";

  let processed = text;

  // リンクを処理
  processed = processed.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" class="japanese-style-modern-a">$1</a>'
  );

  // 流派名を特別に処理 (太字の前に行う必要がある)
  processed = processed.replace(
    /\*\*(.*?-ryu)\*\*/g,
    '<strong class="ryu-name">$1</strong>'
  );

  // 太字を処理
  processed = processed.replace(
    /\*\*(.*?)\*\*/g,
    '<strong class="japanese-style-modern-strong">$1</strong>'
  );

  // 斜体を処理
  processed = processed.replace(
    /\*(.*?)\*/g,
    '<em class="japanese-style-modern-em">$1</em>'
  );

  // インラインコードを処理
  processed = processed.replace(
    /`([^`]+)`/g,
    '<code class="japanese-style-modern-code">$1</code>'
  );

  // 画像を処理
  processed = processed.replace(
    /!\[([^\]]*)\]\(([^)]+)\)/g,
    '<img src="$2" alt="$1" class="japanese-style-modern-img">'
  );

  return processed;
};

// 改良されたマークダウンレンダラー
const renderEnhancedMarkdown = (content: string): string => {
  if (!content) return "";

  // セクション開始タグの追加
  let html = '<section class="japanese-style-modern-section">';

  // 段落に分割
  const paragraphs = content.split(/\n\s*\n/);

  // 各段落を処理
  for (let i = 0; i < paragraphs.length; i++) {
    const paragraph = paragraphs[i].trim();

    if (!paragraph) continue; // 空の段落はスキップ

    // 見出しを処理
    if (paragraph.startsWith("# ")) {
      const headingText = paragraph.substring(2).trim();
      const id = safeId(headingText);

      // 新しいセクションの開始（最初のセクション以外）
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
    }
    // コードブロックを処理
    else if (paragraph.startsWith("```")) {
      const codePattern = /```(?:(\w+))?\n([\s\S]*?)```/;
      const match = paragraph.match(codePattern);

      if (match) {
        const language = match[1] || "";
        const code = match[2];
        html += `<pre class="japanese-style-modern-pre ${
          language ? `language-${language}` : ""
        }"><code class="japanese-style-modern-code">${code}</code></pre>`;
      } else {
        // マッチしなかった場合は単純な段落として扱う
        html += `<p class="japanese-style-modern-p">${processInlineMarkdown(
          paragraph
        )}</p>`;
      }
    }
    // 引用を処理
    else if (paragraph.startsWith("> ")) {
      // 複数行の引用をサポート
      const quoteLines = paragraph.split("\n");
      const quoteContent = quoteLines
        .map((line) => (line.startsWith("> ") ? line.substring(2) : line))
        .join("\n");

      html += `<blockquote class="japanese-style-modern-blockquote"><p class="japanese-style-modern-p">${processInlineMarkdown(
        quoteContent
      )}</p></blockquote>`;
    }
    // テーブルを処理
    else if (paragraph.includes("|") && paragraph.trim().startsWith("|")) {
      const rows = paragraph.trim().split("\n");
      let tableHtml =
        '<div class="japanese-style-modern-table-container"><table class="japanese-style-modern-table">';

      // ヘッダー行が存在するか確認
      const hasHeader = rows.length > 1 && rows[1].includes("--");

      rows.forEach((row, rowIndex) => {
        // 区切り行（---）はスキップ
        if (row.replace(/[\s|:-]/g, "") === "") return;

        // 行を処理
        const cells = row.split("|").filter((cell) => cell.trim() !== "");
        const isHeaderRow = hasHeader && rowIndex === 0;

        tableHtml += '<tr class="japanese-style-modern-tr">';

        cells.forEach((cell) => {
          const cellContent = cell.trim();
          if (isHeaderRow) {
            tableHtml += `<th class="japanese-style-modern-th">${processInlineMarkdown(
              cellContent
            )}</th>`;
          } else {
            tableHtml += `<td class="japanese-style-modern-td">${processInlineMarkdown(
              cellContent
            )}</td>`;
          }
        });

        tableHtml += "</tr>";
      });

      tableHtml += "</table></div>";
      html += tableHtml;
    }
    // 箇条書きリストを処理（改良版）
    else if (/^\s*-\s/.test(paragraph)) {
      const listLines = paragraph.split("\n");
      let listHtml = '<ul class="japanese-style-modern-ul">';
      let currentItemContent = "";
      let isInItem = false;

      listLines.forEach((line, lineIndex) => {
        const trimmed = line.trim();

        if (trimmed.startsWith("- ")) {
          // 前の項目があれば追加
          if (isInItem) {
            listHtml += `<li class="japanese-style-modern-li">${processInlineMarkdown(
              currentItemContent
            )}</li>`;
          }

          // 新しい項目を開始
          currentItemContent = trimmed.substring(2);
          isInItem = true;
        } else if (isInItem && trimmed !== "") {
          // 現在の項目の続き
          currentItemContent += "\n" + trimmed;
        }

        // 最後の行なら項目を閉じる
        if (lineIndex === listLines.length - 1 && isInItem) {
          listHtml += `<li class="japanese-style-modern-li">${processInlineMarkdown(
            currentItemContent
          )}</li>`;
        }
      });

      listHtml += "</ul>";
      html += listHtml;
    }
    // 番号付きリストを処理（改良版）
    else if (/^\s*\d+\.\s/.test(paragraph)) {
      const listLines = paragraph.split("\n");
      let listHtml = '<ol class="japanese-style-modern-ol">';
      let currentItemContent = "";
      let isInItem = false;

      listLines.forEach((line, lineIndex) => {
        const trimmed = line.trim();
        const numberMatch = trimmed.match(/^\d+\.\s(.+)/);

        if (numberMatch) {
          // 前の項目があれば追加
          if (isInItem) {
            listHtml += `<li class="japanese-style-modern-li">${processInlineMarkdown(
              currentItemContent
            )}</li>`;
          }

          // 新しい項目を開始
          currentItemContent = numberMatch[1];
          isInItem = true;
        } else if (isInItem && trimmed !== "") {
          // 現在の項目の続き
          currentItemContent += "\n" + trimmed;
        }

        // 最後の行なら項目を閉じる
        if (lineIndex === listLines.length - 1 && isInItem) {
          listHtml += `<li class="japanese-style-modern-li">${processInlineMarkdown(
            currentItemContent
          )}</li>`;
        }
      });

      listHtml += "</ol>";
      html += listHtml;
    }
    // 水平線を処理
    else if (
      paragraph === "---" ||
      paragraph === "***" ||
      paragraph === "___"
    ) {
      html += '<hr class="japanese-style-modern-hr" />';
    }
    // 通常の段落を処理
    else {
      // インライン要素を処理して段落タグを追加
      html += `<p class="japanese-style-modern-p">${processInlineMarkdown(
        paragraph
      )}</p>`;
    }
  }

  // セクション終了タグを追加
  html += "</section>";

  return html;
};

// 記事の内容からヘッダー（見出し）を抽出する関数
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

export default function CategoryItemClient({ item }: { item: CategoryItem }) {
  const [tableOfContents, setTableOfContents] = useState<TocItem[]>([]);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [showMobileToc, setShowMobileToc] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [renderedContent, setRenderedContent] = useState<string>("");

  // マークダウンの検出とレンダリング
  useEffect(() => {
    if (!item.content) {
      setRenderedContent(
        '<section class="japanese-style-modern-section"><p class="japanese-style-modern-p">コンテンツがありません。</p></section>'
      );
      return;
    }

    console.log("Item content type:", typeof item.content);
    console.log("Item content sample:", item.content.substring(0, 100));

    // マークダウンかどうかを判定
    const mdPatterns = [
      /^#\s+.+$/m,
      /\*\*.+\*\*/,
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

    console.log("Is Markdown:", contentIsMarkdown);

    // マークダウンの場合、レンダリングと目次抽出
    if (contentIsMarkdown) {
      try {
        // 改良されたマークダウンレンダラーを使用
        const html = renderEnhancedMarkdown(item.content);
        setRenderedContent(html);

        // 目次の抽出
        const extractedToc = extractHeaders(item.content);
        console.log("Extracted TOC:", extractedToc);
        setTableOfContents(extractedToc);
      } catch (error) {
        console.error("Error rendering markdown:", error);
        setRenderedContent(
          "<p class='japanese-style-modern-p'>マークダウンの処理中にエラーが発生しました。</p>"
        );
      }
    } else {
      // マークダウンでない場合はそのまま表示
      setRenderedContent(
        `<section class="japanese-style-modern-section"><p class="japanese-style-modern-p">${item.content}</p></section>`
      );
    }
  }, [item.content]);

  // スクロール処理と目次の位置調整
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);

      // 現在表示されているセクションを特定
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

    // スクロールイベントの設定
    window.addEventListener("scroll", handleScroll);

    // リサイズ時にも位置調整
    window.addEventListener("resize", handleScroll);

    // 初期化時に一度実行
    setTimeout(handleScroll, 100);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [tableOfContents]);

  // トップへスクロール
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 目次項目クリック時のスクロール
  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setActiveSection(id);

      // モバイル版では、クリック後に目次を非表示にする
      if (window.innerWidth <= 768) {
        setShowMobileToc(false);
      }
    }
  };

  // 目次の表示切り替え
  const toggleMobileToc = () => {
    setShowMobileToc(!showMobileToc);
  };

  const sectionId = item.category;
  const returnPath = CATEGORY_CONFIG[item.category]?.path || "/";
  const label = CATEGORY_CONFIG[item.category]?.label || "Category";

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
          {/* ヘッダー部分 */}
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

          <div className="japanese-style-modern-container">
            {/* サイドバー（目次） */}
            <TableOfContents
              tableOfContents={tableOfContents}
              activeSection={activeSection}
              scrollToHeading={scrollToHeading}
              showMobileToc={showMobileToc}
              closeMobileToc={() => setShowMobileToc(false)}
            />

            {/* メインコンテンツ */}
            <div className="japanese-style-modern-content">
              <div
                ref={contentRef}
                dangerouslySetInnerHTML={{
                  __html: renderedContent,
                }}
              />
            </div>
          </div>

          {/* フローティングボタン */}
          <FloatingButtons
            showScrollTop={showScrollTop}
            scrollToTop={scrollToTop}
            toggleMobileToc={toggleMobileToc}
          />
        </div>

        {/* ボタン部分 */}
        <div className="flex flex-col justify-center items-center mt-24 mb-16 gap-8">
          <Link href={`${returnPath}#${sectionId}`}>
            <Button
              size="lg"
              className="
                max-w-[340px] 
                w-full
                border border-[#df7163] bg-[#df7163] text-[#f3f3f2] 
                hover:bg-[#f3f3f2] hover:text-[#df7163] hover:border-[#df7163] hover:font-bold
                shadow hover:shadow-lg
                px-6
                transition-all duration-300
                text-center
                break-words
              "
            >
              Back to {label} ≫
            </Button>
          </Link>
          <BackToHomeBtn />
        </div>
      </div>
    </div>
  );
}
