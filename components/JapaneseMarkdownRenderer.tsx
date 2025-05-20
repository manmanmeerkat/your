// app/components/JapaneseMarkdownRenderer.tsx
"use client";

import React, { useEffect, useState, useRef } from "react";
import { marked } from "marked";
import DOMPurify from "isomorphic-dompurify";

// 目次抽出のためのヘルパー関数
const extractTableOfContents = (markdownContent: string) => {
  const headingRegex = /^(#{1,3})\s+(.+)$/gm;
  const toc = [];
  let match;

  while ((match = headingRegex.exec(markdownContent)) !== null) {
    const level = match[1].length;
    const text = match[2];
    const id =
      typeof text === "string"
        ? text.toLowerCase().replace(/[^\w]+/g, "-")
        : "";

    if (id) {
      toc.push({ id, text, level });
    }
  }

  return toc;
};

// ID生成用のヘルパー関数
const safeId = (text: string): string => {
  if (typeof text !== "string") {
    return ""; // 文字列でない場合は空文字を返す
  }

  try {
    return text.toLowerCase().replace(/[^\w]+/g, "-");
  } catch (error) {
    console.error("ID生成中にエラーが発生しました:", error);
    return "";
  }
};

// 流派名のスタイリング用の後処理関数
const postProcessMarkdown = (html: string) => {
  // マークダウン変換後のHTMLに流派名の強調スタイルを適用
  const ryuPattern =
    /(Hayashizaki Muso-ryu|Tamiya-ryu|Mugai-ryu|[A-Za-z]+-ryu)/g;
  return html.replace(ryuPattern, '<span class="ryu-name">$1</span>');
};

type JapaneseMarkdownRendererProps = {
  content: string;
  onTocUpdate?: (toc: { id: string; text: string; level: number }[]) => void;
  onHeadingChange?: (headingId: string) => void;
  useWhiteTheme?: boolean;
};

const JapaneseMarkdownRenderer: React.FC<JapaneseMarkdownRendererProps> = ({
  content,
  onTocUpdate,
  onHeadingChange,
  useWhiteTheme = false,
}) => {
  const [processedHtml, setProcessedHtml] = useState<string>("");
  const contentRef = useRef<HTMLDivElement>(null);
  const [tableOfContents, setTableOfContents] = useState<
    Array<{ id: string; text: string; level: number }>
  >([]);

  useEffect(() => {
    // マークダウンレンダラーの設定を初期化
    setupMarkedRenderer();

    // 目次を抽出
    const toc = extractTableOfContents(content);
    setTableOfContents(toc);

    // 親コンポーネントに目次情報を渡す
    if (onTocUpdate) {
      onTocUpdate(toc);
    }

    // HTMLを生成して状態にセット
    const html = renderMarkdown(content);
    setProcessedHtml(html);

    // スクロール位置の監視を設定
    const handleScrollForToc = () => {
      if (tableOfContents.length === 0 || !contentRef.current) return;

      // すべての見出し要素を取得
      const headings = Array.from(
        contentRef.current.querySelectorAll("h1, h2, h3")
      );

      // 現在表示されている見出しを特定
      let currentId = "";
      for (const heading of headings) {
        if (heading.getBoundingClientRect().top <= 150) {
          currentId = heading.id;
        } else {
          break;
        }
      }

      // 親コンポーネントに現在の見出しIDを渡す
      if (onHeadingChange && currentId) {
        onHeadingChange(currentId);
      }
    };

    // スクロール監視の設定
    window.addEventListener("scroll", handleScrollForToc);

    // スクロール進捗バーの追加
    setupScrollProgress();

    // 初期表示時の見出しを確認
    setTimeout(handleScrollForToc, 500);

    return () => {
      window.removeEventListener("scroll", handleScrollForToc);
    };
  }, [content, onTocUpdate, onHeadingChange]);

  // マークダウンレンダラーの設定
  const setupMarkedRenderer = () => {
    // マークダウンレンダリングの設定
    marked.setOptions({
      gfm: true,
      breaks: true,
      headerIds: true,
      mangle: false,
    });

    // カスタムレンダラーの設定
    const renderer = new marked.Renderer();

    // 見出しにIDを追加
    renderer.heading = ({ tokens, depth }) => {
      const text = tokens[0].raw;
      const id = safeId(text);
      return `<h${depth}${id ? ` id="${id}"` : ""}>${text}</h${depth}>`;
    };

    // 画像レンダリングをカスタマイズ
    renderer.image = ({ href, title, text, tokens }) => {
      return `
        <figure class="jp-figure">
          <img src="${href}" alt="${
        text || ""
      }" class="jp-image" loading="lazy" />
          ${
            title
              ? `<figcaption class="jp-figcaption">${title}</figcaption>`
              : ""
          }
        </figure>
      `;
    };

    marked.use({ renderer });
  };

  // スクロール進捗バーの設定
  const setupScrollProgress = () => {
    // すでに存在するプログレスバーがあれば削除
    const existingContainer = document.querySelector(
      ".scroll-progress-container"
    );
    if (existingContainer) {
      document.body.removeChild(existingContainer);
    }

    // 進捗バーのコンテナを作成
    const progressContainer = document.createElement("div");
    progressContainer.className = "scroll-progress-container";

    // 進捗バーを作成
    const progressBar = document.createElement("div");
    progressBar.className = "scroll-progress-bar";

    // DOMに追加
    progressContainer.appendChild(progressBar);
    document.body.appendChild(progressContainer);

    // スクロール時に進捗を更新
    const updateProgress = () => {
      const scrollHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = (window.scrollY / scrollHeight) * 100;
      progressBar.style.width = `${scrolled}%`;
    };

    window.addEventListener("scroll", updateProgress);
    // 初回実行
    updateProgress();
  };

  // マークダウンをHTMLに変換
  const renderMarkdown = (markdown: string) => {
    // 通常のマークダウン変換
    const html = marked.parse(markdown);
    // 流派名などの特別な単語を後処理で強調
    const processedHtml = postProcessMarkdown(html);
    // 安全なHTMLに変換
    return DOMPurify.sanitize(processedHtml);
  };

  return (
    <div
      ref={contentRef}
      className={`prose prose-lg max-w-none mb-12 ${
        useWhiteTheme ? "japanese-style-light" : "japanese-style"
      }`}
      dangerouslySetInnerHTML={{ __html: processedHtml }}
    />
  );
};

export default JapaneseMarkdownRenderer;
