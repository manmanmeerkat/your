// utils/simpleMarkdownRenderer.tsx - 一口メモ対応版（修正版）
"use client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useState } from "react";

interface MarkdownRendererProps {
  content: string;
  triviaList?: ArticleTrivia[];
}

// 🆕 一口メモの型定義
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

// 🆕 インライン一口メモコンポーネント
const InlineTrivia: React.FC<{ trivia: ArticleTrivia; index: number }> = ({
  trivia,
  index,
}) => {
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
    <div className="inline-trivia-container my-8 relative">
      <div className="group relative">
        <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden">
          {/* 上部装飾ライン */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent"></div>

          {/* 四隅の角飾り */}
          <div className="absolute top-3 left-3 w-2 h-2 border-l border-t border-gray-600 opacity-50"></div>
          <div className="absolute top-3 right-3 w-2 h-2 border-r border-t border-gray-600 opacity-50"></div>
          <div className="absolute bottom-3 left-3 w-2 h-2 border-l border-b border-gray-600 opacity-50"></div>
          <div className="absolute bottom-3 right-3 w-2 h-2 border-r border-b border-gray-600 opacity-50"></div>

          {/* 内容 */}
          <div className="relative p-6 sm:p-8">
            {/* 番号 */}
            <div className="absolute top-4 left-4">
              <div className="w-8 h-8 rounded-full bg-gray-800 border border-gray-700 shadow-sm flex items-center justify-center">
                <span
                  className="text-xs font-bold text-gray-300 tracking-wider"
                  style={{
                    fontFamily: '"Noto Serif JP", "Yu Mincho", serif',
                  }}
                >
                  {kanjiNumbers[index] || index + 1}
                </span>
              </div>
            </div>

            {/* カスタムアイコン */}
            {trivia.iconEmoji && (
              <div className="absolute top-4 right-4">
                <div className="w-10 h-10 rounded-xl bg-gray-800 border border-gray-700 p-2 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                  <img
                    src={trivia.iconEmoji}
                    alt=""
                    className="w-full h-full object-contain opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              </div>
            )}

            {/* メインテキスト */}
            <div className="mt-4 pr-12 relative">
              <div
                className="absolute -left-3 -top-1 text-3xl text-gray-600 leading-none select-none opacity-50"
                style={{
                  fontFamily: '"Noto Serif JP", "Yu Mincho", serif',
                }}
              >
                「
              </div>

              <div className="relative z-10 pr-4 space-y-3">
                {/* タイトルを小見出し風に */}
                <div className="flex items-center justify-center gap-1 py-1 px-3 rounded-md bg-gradient-to-r from-gray-50 via-white to-gray-50 border border-gray-200 mb-3">
                  <span className="text-gray-400 text-sm font-serif">※</span>
                  <span
                    className="text-sm font-medium text-gray-700 font-serif"
                    style={{ letterSpacing: "0.1em" }}
                  >
                    Trivia
                  </span>
                  <span className="text-gray-400 text-sm font-serif">※</span>
                </div>

                {(trivia.contentEn || trivia.content)
                  .split(/\n+/)
                  .map((paragraph, pIndex) => (
                    <p
                      key={pIndex}
                      className="text-gray-200 leading-relaxed text-sm sm:text-base font-normal"
                      style={{
                        fontFamily:
                          '"Inter", "Noto Sans JP", "Hiragino Kaku Gothic ProN", sans-serif',
                        letterSpacing: "0.025em",
                        lineHeight: "1.7",
                      }}
                    >
                      {paragraph
                        .split(/(重要|ポイント|特に|注目)/g)
                        .map((part, i) =>
                          /^(重要|ポイント|特に|注目)$/.test(part) ? (
                            <strong
                              key={i}
                              className="text-yellow-400 font-bold"
                            >
                              {part}
                            </strong>
                          ) : (
                            part
                          )
                        )}
                    </p>
                  ))}
              </div>

              <div
                className="absolute -right-1 -bottom-3 text-3xl text-gray-600 leading-none select-none opacity-50"
                style={{
                  fontFamily: '"Noto Serif JP", "Yu Mincho", serif',
                }}
              >
                」
              </div>
            </div>

            {/* 下部飾り */}
            <div className="mt-6 flex justify-center">
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-gray-500"></div>
                <div className="w-8 h-px bg-gradient-to-r from-gray-600 via-gray-500 to-gray-600"></div>
                <div className="w-1 h-1 rounded-full bg-gray-500"></div>
              </div>
            </div>
          </div>

          {/* 側面装飾 */}
          <div className="absolute left-1 top-8 bottom-8 w-px bg-gradient-to-b from-transparent via-gray-700 to-transparent opacity-50"></div>
          <div className="absolute right-1 top-8 bottom-8 w-px bg-gradient-to-b from-transparent via-gray-700 to-transparent opacity-30"></div>

          {/* ホバー光沢 */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
        </div>
      </div>
    </div>
  );
};

function OptimizedImage({
  src,
  alt,
  title,
  isPriority,
}: {
  src?: string;
  alt?: string;
  title?: string;
  isPriority?: boolean;
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return null;
  }

  return (
    <>
      {!isLoaded && (
        <span className="image-loading-text">画像を読み込み中...</span>
      )}

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt || ""}
        title={title}
        className={`japanese-style-modern-img ${
          isPriority ? "priority-image" : ""
        } ${isLoaded ? "loaded" : "loading"}`}
        loading={isPriority ? "eager" : "lazy"}
        decoding="async"
        onLoad={() => {
          setIsLoaded(true);
          setHasError(false);
        }}
        onError={() => {
          setHasError(true);
          setIsLoaded(false);
        }}
        style={{
          width: "100%",
          height: "auto",
          maxWidth: "100%",
          display: hasError ? "none" : "block",
        }}
      />
    </>
  );
}

// 🆕 一口メモ処理用の関数
const processInlineTriviaPlaceholders = (
  content: string,
  triviaList: ArticleTrivia[]
): string => {
  if (!triviaList || triviaList.length === 0) return content;

  // `:::trivia[id]` または `:::trivia[index]` の形式を処理
  return content.replace(/:::trivia\[([^\]]+)\]/g, (match, identifier) => {
    let trivia: ArticleTrivia | undefined;
    let index = 0;

    // IDまたはインデックスで一口メモを検索
    if (isNaN(Number(identifier))) {
      // ID検索
      trivia = triviaList.find((t) => t.id === identifier);
      index = triviaList.findIndex((t) => t.id === identifier);
    } else {
      // インデックス検索
      const triviaIndex = parseInt(identifier);
      trivia = triviaList[triviaIndex];
      index = triviaIndex;
    }

    if (!trivia) {
      return `**[一口メモ "${identifier}" が見つかりません]**`;
    }

    // プレースホルダーとして一意のIDを生成
    return `TRIVIA_PLACEHOLDER_${btoa(JSON.stringify({ trivia, index }))}`;
  });
};

// 🔧 デバッグ用のコンテンツ前処理関数
const preprocessContent = (content: string): string => {
  console.log("Original content length:", content.length);

  // **Noh**を特別に検索
  const nohMatches = content.match(/\*\*Noh\*\*/g);
  if (nohMatches) {
    console.log("Found **Noh** patterns:", nohMatches);
  } else {
    console.log("**Noh** not found, searching for similar patterns...");

    // Nohを含む任意のパターンを検索
    const nohVariants = content.match(/\*\*[^*]*Noh[^*]*\*\*/gi);
    console.log("Noh variants found:", nohVariants);

    // Nohという単語を検索
    const nohWord = content.match(/Noh/g);
    console.log("Noh word found:", nohWord);

    // **で始まるパターンを検索
    const anyBold = content.match(/\*\*[^*]+\*\*/g);
    console.log(
      "Any bold patterns found:",
      anyBold ? anyBold.slice(0, 5) : "none"
    );
  }

  // 特定の行を検索
  const lines = content.split("\n");
  const nohLine = lines.find((line) => line.includes("Noh"));
  if (nohLine) {
    console.log("Line containing Noh:", nohLine);
    // 文字コードを確認
    console.log(
      "Character codes:",
      nohLine.split("").map((char) => char.charCodeAt(0))
    );
  }

  return content;
};

export function MarkdownRenderer({
  content,
  triviaList,
}: MarkdownRendererProps) {
  // 🔧 デバッグ用のコンテンツ前処理
  const debugContent = preprocessContent(content);

  // 🆕 一口メモのプレースホルダー処理
  const processedContent = triviaList
    ? processInlineTriviaPlaceholders(debugContent, triviaList)
    : debugContent;

  console.log("Processed content:", processedContent);

  return (
    <div className="japanese-style-modern-container">
      <div className="japanese-style-modern-content">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            // 🆕 一口メモプレースホルダーの処理
            p(props) {
              const { children } = props;

              // 文字列の場合、一口メモプレースホルダーをチェック
              if (
                typeof children === "string" &&
                children.startsWith("TRIVIA_PLACEHOLDER_")
              ) {
                const encodedData = children.replace("TRIVIA_PLACEHOLDER_", "");
                try {
                  const { trivia, index } = JSON.parse(atob(encodedData));
                  return <InlineTrivia trivia={trivia} index={index} />;
                } catch (e) {
                  console.warn("Error decoding trivia:", e);
                  return (
                    <div className="text-red-500">
                      一口メモの処理中にエラーが発生しました
                    </div>
                  );
                }
              }

              // 画像のみの段落の処理
              if (children && Array.isArray(children)) {
                const hasOnlyImages = children.every(
                  (child) =>
                    typeof child === "object" &&
                    child !== null &&
                    "type" in child &&
                    child.type === "img"
                );

                if (hasOnlyImages) {
                  return <>{children}</>;
                }
              }

              if (
                children &&
                typeof children === "object" &&
                "type" in children &&
                children.type === "img"
              ) {
                return <>{children}</>;
              }

              return <p className="japanese-style-modern-p">{children}</p>;
            },

            img(props) {
              const { src, alt, title } = props;

              if (!src) {
                return null;
              }

              const altText = alt || "";
              const captionMatch = altText.match(/\{caption: (.*?)\}/);
              const caption = captionMatch ? captionMatch[1] : null;
              const cleanAlt = altText.replace(/\{caption: (.*?)\}/, "").trim();
              const isPriority = altText.toLowerCase().includes("{priority}");

              if (caption) {
                return (
                  <figure className="markdown-figure">
                    <OptimizedImage
                      src={src}
                      alt={cleanAlt}
                      title={title}
                      isPriority={isPriority}
                    />
                    <figcaption className="markdown-caption">
                      {caption}
                    </figcaption>
                  </figure>
                );
              }

              return (
                <OptimizedImage
                  src={src}
                  alt={cleanAlt}
                  title={title}
                  isPriority={isPriority}
                />
              );
            },

            h1(props) {
              // IDを生成
              const text = Array.isArray(props.children)
                ? props.children.join("")
                : String(props.children || "");
              const id = text
                .toLowerCase()
                .replace(/[^\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+/g, "-")
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
                .replace(/[^\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+/g, "-")
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
                .replace(/[^\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+/g, "-")
                .replace(/^-+|-+$/g, "");

              return (
                <h3 id={id} className="japanese-style-modern-h3">
                  {props.children}
                </h3>
              );
            },

            h4(props) {
              return (
                <h4 className="japanese-style-modern-h4">{props.children}</h4>
              );
            },

            blockquote(props) {
              return (
                <blockquote className="japanese-style-modern-blockquote">
                  {props.children}
                </blockquote>
              );
            },

            // 🔧 修正：strongコンポーネントのデバッグと修正
            strong(props) {
              console.log("Strong component received:", props.children);

              const text = Array.isArray(props.children)
                ? props.children.join("")
                : String(props.children || "");

              console.log("Strong text:", text);

              // 流派名の特別処理
              if (text.includes("-ryu")) {
                console.log("Ryu name detected:", text);
                return <strong className="ryu-name">{props.children}</strong>;
              }

              // 通常の太字処理
              console.log("Regular strong applied to:", text);
              return (
                <strong className="japanese-style-modern-strong">
                  {props.children}
                </strong>
              );
            },

            em(props) {
              return (
                <em className="japanese-style-modern-em">{props.children}</em>
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
                <ul className="japanese-style-modern-ul">{props.children}</ul>
              );
            },

            ol(props) {
              return (
                <ol className="japanese-style-modern-ol">{props.children}</ol>
              );
            },

            li(props) {
              return (
                <li className="japanese-style-modern-li">{props.children}</li>
              );
            },

            // テーブル関連（デバッグログ削除）
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
                <tr className="japanese-style-modern-tr">{props.children}</tr>
              );
            },

            th(props) {
              return (
                <th className="japanese-style-modern-th">{props.children}</th>
              );
            },

            td(props) {
              return (
                <td className="japanese-style-modern-td">{props.children}</td>
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
                  <code className="japanese-style-modern-code">{children}</code>
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
          {processedContent}
        </ReactMarkdown>
      </div>
    </div>
  );
}

export function configureMarkedRenderer() {
  const renderMarkdown = async (content: string): Promise<string> => {
    return content;
  };

  return { renderMarkdown };
}

export default MarkdownRenderer;
