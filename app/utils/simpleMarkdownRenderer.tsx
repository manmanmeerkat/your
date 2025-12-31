"use client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import React from "react";
import { makeHeadingId } from "@/app/utils/headingId";
import Image from "next/image";
// import rehypeUnwrapImages from "rehype-unwrap-images";

interface MarkdownRendererProps {
  content: string;
  triviaList?: ArticleTrivia[];
}

type SimpleImageProps = {
  src?: string;
  alt?: string;
  title?: string;
  width?: number;
  height?: number;
};

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
const InlineTrivia: React.FC<{
  trivia: ArticleTrivia;
  index: number;
}> = ({ trivia, index }) => {
  void index;

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

          {/* ヘッダー：左は “Trivia” ラベルに（スクショ寄せ） */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "2rem",
              width: "100%",
            }}
          >
            <div
              style={{
                padding: "0.7rem 3rem",
                borderRadius: "0.15rem",
                background: "rgba(165,154,202,0.18)",
                border: "1px solid rgba(165,154,202,0.35)",
                color: "#f9fafb",
                fontFamily: '"Noto Serif JP", "Yu Mincho", serif',
                fontWeight: 700,
                fontSize: "2rem",
                letterSpacing: "0.08em",
              }}
            >
              Trivia
            </div>

            {/* 右上アイコンが必要なら残す（任意） */}
            {trivia.iconEmoji && (
              <div
                style={{
                  position: "absolute",
                  top: "1.5rem",
                  right: "1.5rem",
                  width: "3.5rem",
                  height: "3.5rem",
                  borderRadius: "0.75rem",
                  background: "#1f2937",
                  border: "1px solid #374151",
                  padding: "0.5rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
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
          <h3
            style={{
              margin: 0,
              marginBottom: "1.5rem",
              fontSize: "1.35rem",
              fontWeight: "bold",
              color: "#a59aca",
              fontFamily: '"Noto Serif JP", "Yu Mincho", serif',
              lineHeight: 1.4,
              textAlign: "center",
            }}
          >
            {trivia.title}
          </h3>

          {/* コンテンツ：Markdown対応させるならここを TriviaMarkdown に変える */}
          <div
            style={{
              color: "#d1d5db",
              lineHeight: 1.8,
              fontSize: "1rem",
              fontFamily: '"Noto Sans JP", "Hiragino Sans", sans-serif',
              whiteSpace: "pre-wrap",
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

// 画像表示用コンポーネント（Supabase Storage対応）
export function SimpleImage({ src, alt, width, height }: SimpleImageProps) {
  if (!src) {
    return <div className="simple-image-error">画像読み込みエラー</div>;
  }

  const ratio = width && height ? `${width}/${height}` : "16/9";

  return (
    <span
      className="simple-image-wrap"
      style={{
        display: "block",
        width: "100%",
        aspectRatio: ratio,
        minHeight: 220,
        height: "auto",
        position: "relative",
        overflow: "hidden",
        borderRadius: "12px",
      }}
    >
      <Image
        src={src}
        alt={alt ?? ""}
        width={1600}
        height={900}
        sizes="(max-width: 768px) 100vw, 800px"
        style={{ width: "100%", height: "auto" }}
      />
    </span>
  );
}

// 🔧 一口メモをMarkdown処理から分離する関数
const separateTriviaFromMarkdown = (
  content: string,
  triviaList: ArticleTrivia[]
): { markdownContent: string; triviaElements: React.ReactNode[] } => {
  const triviaElements = triviaList.map((trivia, index) => (
    <InlineTrivia key={trivia.id} trivia={trivia} index={index} />
  ));

  return { markdownContent: content, triviaElements };
};

// 🔧 分離されたコンテンツをレンダリングする関数
const renderSeparatedContent = (
  markdownContent: string,
  triviaElements: React.ReactNode[],
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
              // rehypePlugins={[rehypeUnwrapImages]} 
              components={{
                p({ children }) {
                  return <p className="japanese-style-modern-p">{children}</p>;
                },

                img(props) {
                  const { src, title } = props;
                  let alt = props.alt || "";
                  let width: number | undefined;
                  let height: number | undefined;

                  const sizeMatch = alt.match(/\{([^}]+)\}/);
                  if (sizeMatch) {
                    const sizeStr = sizeMatch[1];
                    const widthMatch = sizeStr.match(/width\s*=\s*(\d+)/);
                    const heightMatch = sizeStr.match(/height\s*=\s*(\d+)/);
                    width = widthMatch ? parseInt(widthMatch[1], 10) : undefined;
                    height = heightMatch ? parseInt(heightMatch[1], 10) : undefined;
                    alt = alt.replace(/\{[^}]+\}/, "").trim();
                  }

                  let normalizedSrc = src;
                  if (src && src.includes("supabase.co")) normalizedSrc = src;
                  else if (src && src.startsWith("//")) normalizedSrc = "https:" + src;
                  else if (src && (src.startsWith("http://") || src.startsWith("https://"))) normalizedSrc = src;
                  else if (src && !src.startsWith("/")) normalizedSrc = "/" + src;

                  return (
                    <span className="my-6 block">
                      <SimpleImage
                        src={normalizedSrc}
                        alt={alt}
                        title={title}
                        width={width}
                        height={height}
                      />
                    </span>
                  );
                },

                iframe: (props) => (
                  <div className="my-6" style={{ width: "100%", aspectRatio: "16/9" }}>
                    <iframe
                      {...props}
                      style={{ width: "100%", height: "100%", border: 0 }}
                      loading="lazy"
                      allowFullScreen
                    />
                  </div>
                ),

                h1({ children }) {
                  const text = React.Children.toArray(children).join("").trim();
                  const id = makeHeadingId(text);

                  return (
                    <h1 id={id} className="japanese-style-modern-h1">
                      {children}
                    </h1>
                  );
                },

                h2({ children }) {
                  const text = React.Children.toArray(children).join("").trim();
                  const id = makeHeadingId(text);

                  return (
                    <h2 id={id} className="japanese-style-modern-h2">
                      {children}
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

function preprocessTriviaSyntax(content: string): string {
  // 行単位で :::trivia[0] を <!-- TRIVIA_0 --> に変換
  return content.replace(/^:::\s*trivia\[(\d+)\]\s*$/gm, "<!-- TRIVIA_$1 -->");
}

export function MarkdownRenderer({ content, triviaList }: MarkdownRendererProps) {
  const pre1 = preprocessImageSyntax(content);
  const pre2 = preprocessTriviaSyntax(pre1);

  const { markdownContent, triviaElements } = separateTriviaFromMarkdown(
    pre2,
    triviaList || []
  );

  const renderedElements = renderSeparatedContent(
    markdownContent,
    triviaElements,
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
