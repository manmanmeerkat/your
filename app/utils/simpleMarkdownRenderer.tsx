"use client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useState, useEffect } from "react";
import React from "react";

interface MarkdownRendererProps {
  content: string;
  triviaList?: ArticleTrivia[];
}

// 一口メモの型定義
type ArticleTrivia = {
  id: string;
  title: string;
  content: string;
  contentEn?: string | null;
  category: string;
  tags: string[];
  iconEmoji?: string | null;
  colorTheme?: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

// 🔧 画像記法の前処理関数（追加）
function preprocessImageSyntax(content: string): string {
  const imageWithOptionsRegex = /!\[([^\]]*?)\]\(([^)]+?)\)\{([^}]+?)\}/g;

  return content.replace(imageWithOptionsRegex, (match, alt, url, options) => {
    if (alt.includes("{") && alt.includes("}")) {
      return match;
    }

    const newAlt = alt.trim() ? `${alt.trim()}{${options}}` : `{${options}}`;
    return `![${newAlt}](${url})`;
  });
}

// 🔧 完全独立版インライン一口メモコンポーネント（Hydration対応）
const InlineTrivia: React.FC<{ trivia: ArticleTrivia; index: number }> = ({
  trivia,
  index,
}) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

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

  // サーバーサイドでは最小限のプレースホルダー
  if (!isClient) {
    return (
      <div
        style={{
          width: "100%",
          height: "200px",
          backgroundColor: "#f3f4f6",
          borderRadius: "1rem",
          margin: "2rem 0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#6b7280",
        }}
      >
        読み込み中...
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100%",
        marginTop: "3rem",
        marginBottom: "3rem",
        padding: "0",
        position: "relative",
        zIndex: 100,
        boxSizing: "border-box",
        display: "block",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 1rem",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            background:
              "linear-gradient(135deg, #111827 0%, #1f2937 30%, #111827 70%, #232323 100%)",
            border: "1px solid #374151",
            borderRadius: "1rem",
            padding: "2rem",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            position: "relative",
            overflow: "hidden",
            boxSizing: "border-box",
          }}
        >
          {/* 上部装飾 */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "1px",
              background:
                "linear-gradient(90deg, transparent 0%, #374151 50%, transparent 100%)",
            }}
          />

          {/* ヘッダー */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "2rem",
              width: "100%",
            }}
          >
            <div
              style={{
                width: "3rem",
                height: "3rem",
                borderRadius: "50%",
                background: "#1f2937",
                border: "1px solid #374151",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1rem",
                fontWeight: "bold",
                color: "#d1d5db",
                fontFamily: '"Noto Serif JP", "Yu Mincho", serif',
                flexShrink: 0,
              }}
            >
              {kanjiNumbers[index] || index + 1}
            </div>

            {trivia.iconEmoji && (
              <div
                style={{
                  width: "3.5rem",
                  height: "3.5rem",
                  borderRadius: "0.75rem",
                  background: "#1f2937",
                  border: "1px solid #374151",
                  padding: "0.5rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <img
                  src={trivia.iconEmoji}
                  alt=""
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    opacity: 0.8,
                  }}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
            )}
          </div>

          {/* タイトル */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "1.5rem",
              flexWrap: "wrap",
              gap: "1rem",
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: "1.5rem",
                fontWeight: "bold",
                color: "#f9fafb",
                fontFamily: '"Noto Serif JP", "Yu Mincho", serif',
                lineHeight: 1.4,
                flex: 1,
                minWidth: 0,
              }}
            >
              {trivia.title}
            </h3>

            {trivia.colorTheme && (
              <div
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: "2rem",
                  fontSize: "0.875rem",
                  fontWeight: "600",
                  color: "#ffffff",
                  background: trivia.colorTheme,
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
              >
                {trivia.category}
              </div>
            )}
          </div>

          {/* コンテンツ */}
          <div
            style={{
              color: "#d1d5db",
              lineHeight: 1.8,
              fontSize: "1rem",
              fontFamily: '"Noto Sans JP", "Hiragino Sans", sans-serif',
            }}
          >
            {trivia.content}
          </div>

          {/* タグ */}
          {trivia.tags && trivia.tags.length > 0 && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "0.5rem",
                marginTop: "1.5rem",
                paddingTop: "1.5rem",
                borderTop: "1px solid #374151",
              }}
            >
              {trivia.tags.map((tag, tagIndex) => (
                <span
                  key={tagIndex}
                  style={{
                    padding: "0.25rem 0.75rem",
                    borderRadius: "1rem",
                    fontSize: "0.75rem",
                    color: "#9ca3af",
                    background: "#1f2937",
                    border: "1px solid #374151",
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* 下部装飾 */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "1px",
              background:
                "linear-gradient(90deg, transparent 0%, #374151 50%, transparent 100%)",
            }}
          />
        </div>
      </div>
    </div>
  );
};

// 🔧 画像表示用コンポーネント（Supabase Storage対応）
function SimpleImage({
  src,
  alt,
  title,
  width,
  height,
}: {
  src?: string;
  alt?: string;
  title?: string;
  width?: number;
  height?: number;
}) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // 初期状態をfalseに変更

  // 画像URLの正規化
  let normalizedSrc = src;

  // Supabase StorageのURLかどうかチェック
  if (src && src.includes("supabase.co")) {
    // Supabase StorageのURLはそのまま使用
    normalizedSrc = src;
  } else if (src && src.startsWith("//")) {
    normalizedSrc = "https:" + src;
  } else if (src && (src.startsWith("http://") || src.startsWith("https://"))) {
    normalizedSrc = src;
  } else if (src && !src.startsWith("/")) {
    normalizedSrc = "/" + src;
  }

  console.log("🔍 SimpleImage URL処理:", {
    original: src,
    normalized: normalizedSrc,
    isSupabase: src && src.includes("supabase.co"),
    width,
    height,
  });

  if (!normalizedSrc || hasError) {
    return <div className="simple-image-error">画像読み込みエラー</div>;
  }

  return (
    <span className="simple-image-container">
      {/* ローディング表示 */}
      {isLoading && (
        <span className="simple-image-loading">
          <span className="simple-image-spinner" />
          <span className="simple-image-loading-text">読み込み中...</span>
        </span>
      )}

      {/* 画像要素 */}
      <img
        src={normalizedSrc}
        alt={alt || ""}
        title={title}
        className={`simple-image ${isLoading ? "simple-image-loading" : ""}`}
        loading="lazy"
        decoding="async"
        width={width}
        height={height}
        style={{
          width: width ? `${width}px !important` : undefined,
          height: height ? `${height}px !important` : undefined,
          maxWidth: "100%",
          maxHeight: "100%",
          display: "block",
        }}
        onLoad={() => {
          console.log("✅ 画像読み込み完了:", normalizedSrc);
          setIsLoading(false);
          setHasError(false);
        }}
        onError={(e) => {
          console.error("❌ 画像読み込みエラー:", normalizedSrc, e);
          setHasError(true);
          setIsLoading(false);
        }}
        onLoadStart={() => {
          console.log("🔄 画像読み込み開始:", normalizedSrc);
          setIsLoading(true);
          setHasError(false);
        }}
      />

      {/* キャプション */}
      {title && !isLoading && !hasError && (
        <span className="simple-image-caption">{title}</span>
      )}
    </span>
  );
}

// 🔧 一口メモをMarkdown処理から分離する関数
const separateTriviaFromMarkdown = (
  content: string,
  triviaList: ArticleTrivia[]
): { markdownContent: string; triviaElements: React.ReactNode[] } => {
  let markdownContent = content;
  const triviaElements: React.ReactNode[] = [];

  triviaList.forEach((trivia, index) => {
    const triviaPlaceholder = `<!-- TRIVIA_${index} -->`;
    markdownContent = markdownContent.replace(
      new RegExp(`\\[一口メモ\\s*${index + 1}\\]`, "g"),
      triviaPlaceholder
    );
    triviaElements.push(
      <InlineTrivia key={trivia.id} trivia={trivia} index={index} />
    );
  });

  return { markdownContent, triviaElements };
};

// 🔧 分離されたコンテンツをレンダリングする関数
const renderSeparatedContent = (
  markdownContent: string,
  triviaElements: React.ReactNode[],
  triviaList: ArticleTrivia[]
): React.ReactNode[] => {
  const elements: React.ReactNode[] = [];
  const parts = markdownContent.split(/(<!-- TRIVIA_\d+ -->)/);

  parts.forEach((part, index) => {
    if (part.startsWith("<!-- TRIVIA_")) {
      const triviaIndex = parseInt(part.match(/TRIVIA_(\d+)/)?.[1] || "0");
      if (triviaIndex < triviaElements.length) {
        elements.push(triviaElements[triviaIndex]);
      }
    } else if (part.trim()) {
      elements.push(
        <div key={`markdown-${index}`} className="markdown-section">
          <div className="markdown-container">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                p({ children }) {
                  // 子要素に画像があるかチェック
                  const hasImage = React.Children.toArray(children).some(
                    (child) => {
                      if (React.isValidElement(child)) {
                        return (
                          child.type === "img" ||
                          (child.type &&
                            typeof child.type === "function" &&
                            child.type.name === "SimpleImage")
                        );
                      }
                      return false;
                    }
                  );

                  if (hasImage) {
                    // 画像がある場合はdivを使用
                    return (
                      <div className="japanese-style-modern-p">{children}</div>
                    );
                  }

                  // 通常の段落
                  return <p className="japanese-style-modern-p">{children}</p>;
                },

                img(props) {
                  const { src, title } = props;
                  let alt = props.alt || "";
                  let width: number | undefined;
                  let height: number | undefined;

                  // altに {width=400 height=250} のような指定があればパース
                  const sizeMatch = alt.match(/\{([^}]+)\}/);
                  if (sizeMatch) {
                    const sizeStr = sizeMatch[1];
                    const widthMatch = sizeStr.match(/width\s*=\s*(\d+)/);
                    const heightMatch = sizeStr.match(/height\s*=\s*(\d+)/);
                    width = widthMatch
                      ? parseInt(widthMatch[1], 10)
                      : undefined;
                    height = heightMatch
                      ? parseInt(heightMatch[1], 10)
                      : undefined;
                    // altテキストからサイズ指定部分を除去
                    alt = alt.replace(/\{[^}]+\}/, "").trim();
                  }

                  // 画像URLの正規化（既存の処理を流用）
                  let normalizedSrc = src;
                  if (src && src.includes("supabase.co")) {
                    normalizedSrc = src;
                  } else if (src && src.startsWith("//")) {
                    normalizedSrc = "https:" + src;
                  } else if (
                    src &&
                    (src.startsWith("http://") || src.startsWith("https://"))
                  ) {
                    normalizedSrc = src;
                  } else if (src && !src.startsWith("/")) {
                    normalizedSrc = "/" + src;
                  }

                  return (
                    <SimpleImage
                      src={normalizedSrc}
                      alt={alt}
                      title={title}
                      width={width}
                      height={height}
                    />
                  );
                },

                h1(props) {
                  return (
                    <h1 className="japanese-style-modern-h1">
                      {props.children}
                    </h1>
                  );
                },

                h2(props) {
                  return (
                    <h2 className="japanese-style-modern-h2">
                      {props.children}
                    </h2>
                  );
                },

                h3(props) {
                  return (
                    <h3 className="japanese-style-modern-h3">
                      {props.children}
                    </h3>
                  );
                },

                h4(props) {
                  return (
                    <h4 className="japanese-style-modern-h4">
                      {props.children}
                    </h4>
                  );
                },

                blockquote(props) {
                  return (
                    <blockquote className="japanese-style-modern-blockquote">
                      {props.children}
                    </blockquote>
                  );
                },

                strong(props) {
                  const text = Array.isArray(props.children)
                    ? props.children.join("")
                    : String(props.children || "");

                  // 一口メモの記法をチェック
                  const triviaMatch = text.match(/^一口メモ[：:]\s*(.+)$/);
                  if (triviaMatch) {
                    const triviaTitle = triviaMatch[1];
                    const trivia = triviaList?.find(
                      (t) => t.title === triviaTitle
                    );
                    if (trivia) {
                      return <InlineTrivia trivia={trivia} index={0} />;
                    }
                  }

                  return (
                    <strong className="japanese-style-modern-strong">
                      {props.children}
                    </strong>
                  );
                },

                em(props) {
                  return (
                    <em className="japanese-style-modern-em">
                      {props.children}
                    </em>
                  );
                },

                a(props) {
                  return (
                    <a
                      className="japanese-style-modern-a"
                      href={props.href}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {props.children}
                    </a>
                  );
                },

                ul(props) {
                  return (
                    <ul className="japanese-style-modern-ul">
                      {props.children}
                    </ul>
                  );
                },

                ol(props) {
                  return (
                    <ol className="japanese-style-modern-ol">
                      {props.children}
                    </ol>
                  );
                },

                li(props) {
                  return (
                    <li className="japanese-style-modern-li">
                      {props.children}
                    </li>
                  );
                },

                table(props) {
                  return (
                    <table className="japanese-style-modern-table">
                      {props.children}
                    </table>
                  );
                },

                thead(props) {
                  return (
                    <thead className="japanese-style-modern-thead">
                      {props.children}
                    </thead>
                  );
                },

                tbody(props) {
                  return (
                    <tbody className="japanese-style-modern-tbody">
                      {props.children}
                    </tbody>
                  );
                },

                tr(props) {
                  return (
                    <tr className="japanese-style-modern-tr">
                      {props.children}
                    </tr>
                  );
                },

                th(props) {
                  return (
                    <th className="japanese-style-modern-th">
                      {props.children}
                    </th>
                  );
                },

                td(props) {
                  return (
                    <td className="japanese-style-modern-td">
                      {props.children}
                    </td>
                  );
                },

                hr() {
                  return <hr className="japanese-style-modern-hr" />;
                },

                code(
                  props: React.ComponentProps<"code"> & { inline?: boolean }
                ) {
                  if (props.inline) {
                    return (
                      <code className="japanese-style-modern-code-inline">
                        {props.children}
                      </code>
                    );
                  }
                  return (
                    <code className="japanese-style-modern-code">
                      {props.children}
                    </code>
                  );
                },

                pre(props) {
                  return (
                    <pre className="japanese-style-modern-pre">
                      {props.children}
                    </pre>
                  );
                },
              }}
            >
              {part.trim()}
            </ReactMarkdown>
          </div>
        </div>
      );
    }
  });

  return elements;
};

export function MarkdownRenderer({
  content,
  triviaList,
}: MarkdownRendererProps) {
  // 🔧 画像記法の前処理を実行
  const preprocessedContent = preprocessImageSyntax(content);

  // 🔧 一口メモをMarkdown処理から分離
  const { markdownContent, triviaElements } = separateTriviaFromMarkdown(
    preprocessedContent,
    triviaList || []
  );

  // 🔧 分離されたコンテンツをレンダリング
  const renderedElements = renderSeparatedContent(
    markdownContent,
    triviaElements,
    triviaList || []
  );

  return <>{renderedElements}</>;
}

export function configureMarkedRenderer() {
  const renderMarkdown = async (content: string): Promise<string> => {
    return content;
  };

  return { renderMarkdown };
}

export default MarkdownRenderer;
