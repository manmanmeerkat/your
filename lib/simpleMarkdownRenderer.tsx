// utils/simpleMarkdownRenderer.tsx - テーブルデバッグ版
"use client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm"; // GFMサポートを追加
import { useState } from "react";

interface MarkdownRendererProps {
  content: string;
}

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
          console.log("✅ Image loaded successfully:", alt);
        }}
        onError={() => {
          setHasError(true);
          setIsLoaded(false);
          console.warn("⚠️ Image failed to load (hiding):", alt, src);
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

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="japanese-style-modern-container">
      <div className="japanese-style-modern-content">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]} // 🚨 GFMプラグインを追加
          components={{
            img(props) {
              const { src, alt, title } = props;
              console.log("🖼️ Processing image:", { src, alt, title });

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

            p(props) {
              const { children } = props;

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

            h1(props) {
              return (
                <section className="japanese-style-modern-section">
                  <h1 className="japanese-style-modern-h1">{props.children}</h1>
                </section>
              );
            },

            h2(props) {
              return (
                <h2 className="japanese-style-modern-h2">{props.children}</h2>
              );
            },

            h3(props) {
              return (
                <h3 className="japanese-style-modern-h3">{props.children}</h3>
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

            strong(props) {
              const text =
                typeof props.children === "string" ? props.children : "";
              if (text.includes("-ryu")) {
                return <strong className="ryu-name">{props.children}</strong>;
              }
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

            // 🚨 テーブル関連のデバッグ強化
            table(props) {
              console.log("📊 Table component called with:", props);
              console.log("📊 Table children:", props.children);
              return (
                <div className="japanese-style-modern-table-container">
                  <table className="japanese-style-modern-table">
                    {props.children}
                  </table>
                </div>
              );
            },

            thead(props) {
              console.log("📊 Thead component called:", props);
              return (
                <thead className="japanese-style-modern-thead">
                  {props.children}
                </thead>
              );
            },

            tbody(props) {
              console.log("📊 Tbody component called:", props);
              return (
                <tbody className="japanese-style-modern-tbody">
                  {props.children}
                </tbody>
              );
            },

            tr(props) {
              console.log("📊 Tr component called:", props);
              return (
                <tr className="japanese-style-modern-tr">{props.children}</tr>
              );
            },

            th(props) {
              console.log("📊 Th component called:", props.children);
              return (
                <th className="japanese-style-modern-th">{props.children}</th>
              );
            },

            td(props) {
              console.log("📊 Td component called:", props.children);
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
          {content}
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
