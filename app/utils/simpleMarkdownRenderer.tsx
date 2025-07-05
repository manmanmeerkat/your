// utils/simpleMarkdownRenderer.tsx - 完全修正版
"use client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useState, useEffect } from "react";

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
              justifyContent: "center",
              gap: "0.5rem",
              padding: "0.5rem 1rem",
              borderRadius: "0.5rem",
              background:
                "linear-gradient(90deg, #f9fafb 0%, #ffffff 30%, #f9fafb 100%)",
              border: "1px solid #e5e7eb",
              marginBottom: "2rem",
              width: "fit-content",
              margin: "0 auto 2rem auto",
              fontSize: "1rem",
              fontWeight: "500",
              fontFamily: "serif",
              letterSpacing: "0.1em",
              textAlign: "center",
            }}
          >
            <span style={{ color: "#9ca3af", fontSize: "0.875rem" }}>※</span>
            <span
              style={{
                color: "#374151",
                fontSize: "1rem",
                fontWeight: "500",
                textAlign: "center",
                display: "inline-block",
              }}
            >
              {trivia.title || "Trivia"}
            </span>
            <span style={{ color: "#9ca3af", fontSize: "0.875rem" }}>※</span>
          </div>

          {/* 装飾文字 */}
          <div
            style={{
              position: "absolute",
              left: "1rem",
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: "4rem",
              color: "#374151",
              opacity: 0.3,
              fontFamily: '"Noto Serif JP", "Yu Mincho", serif',
              pointerEvents: "none",
              zIndex: 1,
            }}
          >
            「
          </div>

          <div
            style={{
              position: "absolute",
              right: "1rem",
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: "4rem",
              color: "#374151",
              opacity: 0.3,
              fontFamily: '"Noto Serif JP", "Yu Mincho", serif',
              pointerEvents: "none",
              zIndex: 1,
            }}
          >
            」
          </div>

          {/* コンテンツ */}
          <div
            style={{
              position: "relative",
              zIndex: 10,
              padding: "0 2rem",
            }}
          >
            {(trivia.contentEn || trivia.content)
              .split(/\n+/)
              .filter((paragraph) => paragraph.trim())
              .map((paragraph, pIndex) => {
                const isTitle = pIndex === 0;
                return (
                  <p
                    key={pIndex}
                    style={{
                      color: isTitle ? "#fbbf24" : "#f3f4f6",
                      fontSize: isTitle ? "1.2rem" : "1.1rem",
                      lineHeight: "1.7",
                      fontFamily: isTitle
                        ? '"Noto Serif JP", "Yu Mincho", serif'
                        : '"Inter", "Noto Sans JP", "Hiragino Kaku Gothic ProN", sans-serif',
                      letterSpacing: "0.025em",
                      textAlign: isTitle ? "center" : "left",
                      fontWeight: isTitle ? "bold" : "normal",
                      wordWrap: "break-word",
                      overflowWrap: "break-word",
                      wordBreak: "break-word",
                      whiteSpace: "normal",
                      margin: isTitle ? "0 auto 2rem auto" : "0 0 1rem 0",
                      padding: "0",
                      width: "100%",
                      maxWidth: "none",
                      boxSizing: "border-box",
                      display: "block",
                    }}
                  >
                    {paragraph
                      .split(/(重要|ポイント|特に|注目)/g)
                      .map((part, i) =>
                        /^(重要|ポイント|特に|注目)$/.test(part) ? (
                          <strong
                            key={i}
                            style={{
                              color: "#fbbf24",
                              fontWeight: "bold",
                              backgroundColor: "rgba(251, 191, 36, 0.2)",
                              padding: "0.25rem 0.5rem",
                              borderRadius: "0.25rem",
                            }}
                          >
                            {part}
                          </strong>
                        ) : (
                          part
                        )
                      )}
                  </p>
                );
              })}
          </div>

          {/* 下部装飾 */}
          <div
            style={{
              marginTop: "2rem",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <div
              style={{
                width: "0.25rem",
                height: "0.25rem",
                borderRadius: "50%",
                backgroundColor: "#6b7280",
              }}
            />
            <div
              style={{
                width: "3rem",
                height: "1px",
                background:
                  "linear-gradient(90deg, #6b7280 0%, #9ca3af 50%, #6b7280 100%)",
              }}
            />
            <div
              style={{
                width: "0.25rem",
                height: "0.25rem",
                borderRadius: "50%",
                backgroundColor: "#6b7280",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// 🔧 画像コンポーネント（読み込み問題修正版）
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
  const [isLoaded, setIsLoaded] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!src || hasError) {
    return (
      <span
        style={{
          display: "inline-block",
          textAlign: "center",
          backgroundColor: "#f3f4f6",
          borderRadius: "0.5rem",
          padding: "1rem",
          margin: "0.25rem",
          width: width ? `min(${width}px, 100%)` : "100px",
          height: height ? `${height}px` : "60px",
          boxSizing: "border-box",
          verticalAlign: "middle",
          lineHeight: height ? `${height}px` : "60px",
          fontSize: "0.75rem",
          color: "#6b7280",
        }}
      >
        画像エラー
      </span>
    );
  }

  // サーバーサイドまたは読み込み中の表示
  if (!isClient || !isLoaded) {
    return (
      <span
        style={{
          display: "inline-block",
          position: "relative",
          width: "100%",
          height: height ? `${height}px` : "200px",
          backgroundColor: "#f9fafb",
          border: "1px dashed #d1d5db",
          borderRadius: "0.5rem",
          boxSizing: "border-box",
          verticalAlign: "top",
        }}
      >
        {/* ローディングアイコン */}
        <span
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            display: "inline-flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          {/* スピナーアイコン */}
          <span
            style={{
              width: "24px",
              height: "24px",
              border: "3px solid #e5e7eb",
              borderTop: "3px solid #6b7280",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              display: "inline-block",
            }}
          />
          <span
            style={{
              color: "#6b7280",
              fontSize: "0.75rem",
              textAlign: "center",
              whiteSpace: "nowrap",
            }}
          >
            {isClient ? "読み込み中..." : "初期化中..."}
          </span>
        </span>

        {/* 実際の画像（クライアントサイドでのみ読み込み） */}
        {isClient && (
          <img
            src={src}
            alt={alt || ""}
            title={title}
            loading="lazy"
            decoding="async"
            onLoad={() => {
              console.log("画像読み込み完了:", src);
              setIsLoaded(true);
              setHasError(false);
            }}
            onError={(e) => {
              console.error("画像読み込みエラー:", src, e);
              setHasError(true);
              setIsLoaded(false);
            }}
            style={{
              position: "absolute",
              top: "-9999px",
              left: "-9999px",
              width: "1px",
              height: "1px",
              opacity: 0,
              visibility: "hidden",
              pointerEvents: "none",
            }}
          />
        )}

        {/* CSSアニメーション */}
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </span>
    );
  }

  // 読み込み完了後の画像表示
  const getImageStyle = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      borderRadius: "0.5rem",
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
      display: "inline-block",
      verticalAlign: "top",
      width: "100%",
    };

    // サイズ制御
    if (width && height) {
      return {
        ...baseStyle,
        maxWidth: width ? `${width}px` : "none",
        height: `${height}px`,
        objectFit: "cover",
      };
    } else if (width && !height) {
      return {
        ...baseStyle,
        maxWidth: width ? `${width}px` : "none",
        height: "auto",
        objectFit: "contain",
      };
    } else if (!width && height) {
      return {
        ...baseStyle,
        height: `${height}px`,
        width: "auto",
        maxWidth: "100%",
        objectFit: "contain",
      };
    } else {
      return {
        ...baseStyle,
        height: "auto",
        objectFit: "contain",
      };
    }
  };

  return (
    <span
      style={{
        display: "inline-block",
        width: "100%",
        verticalAlign: "top",
      }}
    >
      <img src={src} alt={alt || ""} title={title} style={getImageStyle()} />
      {title && (
        <em
          style={{
            display: "block",
            textAlign: "center",
            fontSize: "0.875rem",
            color: "#6b7280",
            marginTop: "0.5rem",
            fontStyle: "italic",
          }}
        >
          {title}
        </em>
      )}
    </span>
  );
}

// 🔧 一口メモをMarkdown処理から分離する関数
const separateTriviaFromMarkdown = (
  content: string,
  triviaList: ArticleTrivia[]
): { markdownContent: string; triviaElements: React.ReactNode[] } => {
  if (!triviaList || triviaList.length === 0) {
    return { markdownContent: content, triviaElements: [] };
  }

  const triviaElements: React.ReactNode[] = [];

  // 一口メモ記法を一意のプレースホルダーに置き換え
  const processedContent = content.replace(
    /:::trivia\[([^\]]+)\]/g,
    (match, identifier) => {
      let trivia: ArticleTrivia | undefined;
      let index = 0;

      // IDまたはインデックスで一口メモを検索
      if (isNaN(Number(identifier))) {
        trivia = triviaList.find((t) => t.id === identifier);
        index = triviaList.findIndex((t) => t.id === identifier);
      } else {
        const triviaIndex = parseInt(identifier);
        trivia = triviaList[triviaIndex];
        index = triviaIndex;
      }

      if (!trivia) {
        return `[一口メモ "${identifier}" が見つかりません]`;
      }

      // プレースホルダーを生成
      const placeholderId = `TRIVIA_SPLIT_${triviaElements.length}`;

      // 一口メモ要素を作成
      triviaElements.push(
        <InlineTrivia
          key={`trivia-${trivia.id}-${index}`}
          trivia={trivia}
          index={index}
        />
      );

      return `\n\n${placeholderId}\n\n`;
    }
  );

  return { markdownContent: processedContent, triviaElements };
};

// 🔧 マークダウンコンテンツを分割してレンダリング（Hydration対応）
const renderSeparatedContent = (
  markdownContent: string,
  triviaElements: React.ReactNode[]
): React.ReactNode[] => {
  const elements: React.ReactNode[] = [];
  const parts = markdownContent.split(/TRIVIA_SPLIT_\d+/);

  parts.forEach((part, index) => {
    // マークダウン部分をレンダリング
    if (part.trim()) {
      elements.push(
        <div
          key={`markdown-${index}`}
          className="japanese-style-modern-container"
        >
          <div className="japanese-style-modern-content">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                // 🔧 段落コンポーネント（Hydrationエラー修正）
                p({ node, children }) {
                  // 子要素に画像やブロック要素があるかチェック
                  const hasBlockElements = node?.children?.some(
                    (child: { type?: string; tagName?: string }) =>
                      child.tagName === "img" ||
                      (child.type === "element" &&
                        child.tagName &&
                        ["div", "figure", "blockquote"].includes(child.tagName))
                  );

                  if (hasBlockElements) {
                    // ブロック要素がある場合はdivを使用
                    return (
                      <div className="japanese-style-modern-p">{children}</div>
                    );
                  }

                  // 通常の段落
                  return <p className="japanese-style-modern-p">{children}</p>;
                },

                // 🔧 画像コンポーネント（完全修正版）
                img(props) {
                  const { src, alt, title } = props;

                  if (!src) {
                    return null;
                  }

                  const altText = alt || "";

                  // 🔧 各種パラメータの解析
                  const captionMatch = altText.match(/\{caption:\s*([^}]+)\}/);
                  const caption = captionMatch ? captionMatch[1].trim() : null;

                  const sizeMatch = altText.match(/\{size:\s*(\d+)x(\d+)\}/);
                  const widthMatch = altText.match(/\{width:\s*(\d+)\}/);
                  const heightMatch = altText.match(/\{height:\s*(\d+)\}/);

                  const width = sizeMatch
                    ? parseInt(sizeMatch[1])
                    : widthMatch
                    ? parseInt(widthMatch[1])
                    : undefined;
                  const height = sizeMatch
                    ? parseInt(sizeMatch[2])
                    : heightMatch
                    ? parseInt(heightMatch[1])
                    : undefined;

                  // 🔧 代替テキストから設定を除去
                  const cleanAlt = altText
                    .replace(/\{caption:\s*[^}]+\}/, "")
                    .replace(/\{size:\s*\d+x\d+\}/, "")
                    .replace(/\{width:\s*\d+\}/, "")
                    .replace(/\{height:\s*\d+\}/, "")
                    .replace(/\{priority\}/, "")
                    .trim();

                  // HTMLのwidth/height属性も確認
                  const htmlWidth = props.width
                    ? parseInt(props.width.toString())
                    : width;
                  const htmlHeight = props.height
                    ? parseInt(props.height.toString())
                    : height;

                  // 🔧 キャプション付き画像
                  if (caption) {
                    return (
                      <>
                        <SimpleImage
                          src={src}
                          alt={cleanAlt}
                          title={title}
                          width={htmlWidth}
                          height={htmlHeight}
                        />
                        <em
                          style={{
                            display: "block",
                            textAlign: "center",
                            fontSize: "0.875rem",
                            color: "#6b7280",
                            marginTop: "0.5rem",
                            fontStyle: "italic",
                          }}
                        >
                          {caption}
                        </em>
                      </>
                    );
                  }

                  // 🔧 通常の画像
                  return (
                    <SimpleImage
                      src={src}
                      alt={cleanAlt}
                      title={title}
                      width={htmlWidth}
                      height={htmlHeight}
                    />
                  );
                },

                h1(props) {
                  const text = Array.isArray(props.children)
                    ? props.children.join("")
                    : String(props.children || "");
                  const id = text
                    .toLowerCase()
                    .replace(
                      /[^\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+/g,
                      "-"
                    )
                    .replace(/^-+|-+$/g, "");

                  return (
                    <section className="japanese-style-modern-section">
                      <h1 id={id} className="japanese-style-modern-h1">
                        {props.children}
                      </h1>
                    </section>
                  );
                },

                h2(props) {
                  const text = Array.isArray(props.children)
                    ? props.children.join("")
                    : String(props.children || "");
                  const id = text
                    .toLowerCase()
                    .replace(
                      /[^\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+/g,
                      "-"
                    )
                    .replace(/^-+|-+$/g, "");

                  return (
                    <h2 id={id} className="japanese-style-modern-h2">
                      {props.children}
                    </h2>
                  );
                },

                h3(props) {
                  const text = Array.isArray(props.children)
                    ? props.children.join("")
                    : String(props.children || "");
                  const id = text
                    .toLowerCase()
                    .replace(
                      /[^\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+/g,
                      "-"
                    )
                    .replace(/^-+|-+$/g, "");

                  return (
                    <h3 id={id} className="japanese-style-modern-h3">
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

                  if (text.includes("-ryu")) {
                    return (
                      <strong className="ryu-name">{props.children}</strong>
                    );
                  }

                  return (
                    <strong
                      className="japanese-style-modern-strong"
                      style={{ fontWeight: "bold" }}
                    >
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
                  const { href, title, children, ...rest } = props;
                  return (
                    <a
                      {...rest}
                      href={href}
                      className="japanese-style-modern-a"
                      title={title}
                    >
                      {children}
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
                    <div className="japanese-style-modern-table-container">
                      <table className="japanese-style-modern-table">
                        {props.children}
                      </table>
                    </div>
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

                // @ts-expect-error - ReactMarkdownの型定義との互換性の問題を回避
                code(props: { inline?: boolean; children: React.ReactNode }) {
                  const { inline, children } = props;
                  if (inline) {
                    return (
                      <code className="japanese-style-modern-code">
                        {children}
                      </code>
                    );
                  }
                  return (
                    <code className="japanese-style-modern-code-block">
                      {children}
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

    // 対応する一口メモ要素を追加
    if (index < triviaElements.length) {
      elements.push(triviaElements[index]);
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
    triviaElements
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
