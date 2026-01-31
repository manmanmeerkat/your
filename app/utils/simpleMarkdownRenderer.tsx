import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Image from "next/image";
import { makeHeadingId } from "@/app/utils/headingId";

interface MarkdownRendererProps {
  content: string;
  triviaList?: ArticleTrivia[];
}

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

type SimpleImageProps = {
  src: string;
  alt: string;
  title?: string;
  width?: number;
  height?: number;
  className?: string;
};

/** 画像記法の前処理（あなたのまま） */
function preprocessImageSyntax(content: string): string {
  const imageWithOptionsRegex = /!\[([^\]]*?)\]\(([^)]+?)\)\{([^}]+?)\}/g;

  return content.replace(imageWithOptionsRegex, (match, alt, url, options) => {
    if (alt.includes("{") && alt.includes("}")) return match;
    const newAlt = alt.trim() ? `${alt.trim()}{${options}}` : `{${options}}`;
    return `![${newAlt}](${url})`;
  });
}

/** ✅ :::trivia[n] をプレースホルダ文字列へ */
function preprocessTriviaSyntax(content: string): string {
  // 行単位でも、インラインでも拾えるように
  return content.replace(/:::\s*trivia\[(\d+)\]\s*/g, (_m, n) => `TRIVIA_PLACEHOLDER_${n}`);
}

/** src 正規化だけを独立 */
function normalizeSrc(src?: string) {
  if (!src) return "";
  if (src.includes("supabase.co")) return src;
  if (src.startsWith("//")) return "https:" + src;
  if (src.startsWith("http://") || src.startsWith("https://")) return src;
  if (!src.startsWith("/")) return "/" + src;
  return src;
}

// ✅ 一口メモ（あなたの InlineTrivia をそのまま置いてOK）
// ここでは省略せず使う想定
const InlineTrivia: React.FC<{ trivia: ArticleTrivia; index: number }> = ({ trivia }) => {
  return (
    <div style={{ width: "100%", marginTop: "3rem", marginBottom: "3rem" }}>
      {/* ...（あなたの InlineTrivia の中身そのまま）... */}
      <div style={{ color: "#d1d5db", whiteSpace: "pre-wrap" }}>{trivia.content}</div>
    </div>
  );
};

// ✅ 画像表示（あなたの SimpleImage を維持しつつ少し整理）
export function SimpleImage({ src, alt, title, width, height }: SimpleImageProps) {
  if (!src) return null;

  const w = width ?? 1600;
  const h = height ?? 900;
  const ratio = `${w}/${h}`;

  return (
    <span
      className="simple-image-wrap"
      style={{
        display: "block",
        width: "100%",
        position: "relative",
        overflow: "visible",   // ← 切らない
      }}
    >
      <Image
        src={src}
        alt={alt ?? ""}
        title={title}
        fill
        sizes="(max-width: 768px) 100vw, 860px"
        className="object-cover"
      />
    </span>
  );
}

function childrenToText(children: React.ReactNode): string {
  return React.Children.toArray(children)
    .map((child) => {
      if (typeof child === "string") return child;
      if (typeof child === "number") return String(child);
      if (React.isValidElement(child)) {
        return childrenToText(child.props.children);
      }
      return "";
    })
    .join("")
    .trim();
}

export function MarkdownRenderer({ content, triviaList = [] }: MarkdownRendererProps) {
  const pre = preprocessTriviaSyntax(preprocessImageSyntax(content));

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        /** ✅ ここで Trivia プレースホルダだけを差し替える */
        p({ children }) {
          // children が単一テキストのケースが多いのでここで拾う
          const text =
            typeof children === "string"
              ? children
              : Array.isArray(children) && children.length === 1 && typeof children[0] === "string"
              ? children[0]
              : null;

          if (text && text.startsWith("TRIVIA_PLACEHOLDER_")) {
            const idx = Number(text.replace("TRIVIA_PLACEHOLDER_", ""));
            const trivia = triviaList[idx];
            if (!trivia) return null;
            return <InlineTrivia trivia={trivia} index={idx} />;
          }

          return <p className="japanese-style-modern-p">{children}</p>;
        },

        img(props) {
          const { src, title } = props;
          let alt = props.alt || "";
          let width: number | undefined;
          let height: number | undefined;

          // {width=xxx height=yyy} を alt から読む
          const sizeMatch = alt.match(/\{([^}]+)\}/);
          if (sizeMatch) {
            const sizeStr = sizeMatch[1];
            const w = sizeStr.match(/width\s*=\s*(\d+)/);
            const h = sizeStr.match(/height\s*=\s*(\d+)/);
            width = w ? parseInt(w[1], 10) : undefined;
            height = h ? parseInt(h[1], 10) : undefined;
            alt = alt.replace(/\{[^}]+\}/, "").trim();
          }

          const normalizedSrc = normalizeSrc(src);

          const hasSize = typeof width === "number" && typeof height === "number" && width > 0 && height > 0;

          // ✅ サイズが無いなら 16:9 枠を確保してレイアウトシフトを抑える
          return (
            <span className="my-6 block">
              <span
                className={[
                  "relative block w-full overflow-hidden", "grid place-items-center",  
                  hasSize ? "" : "aspect-[16/10]",
                ].join(" ")}
              >
                <SimpleImage
                  src={normalizedSrc}
                  alt={alt}
                  // title は渡さない（ツールチップや不要表示の原因になるため）
                  // title={title}
                  width={width}
                  height={height}
                  className={[
                    "block w-full",
                    hasSize
                      ? "h-auto"
                      : "absolute inset-0 h-full w-full object-contain", // ✅ 切れない
                  ].join(" ")}
                />
              </span>
            </span>
          );
        },

        iframe: (props) => (
          <div className="my-6" style={{ width: "100%", aspectRatio: "16/9", position: "relative" }}>
            <iframe
              {...props}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }}
              loading="lazy"
              allowFullScreen
            />
          </div>
          ),
        h1({ children }) {
          const text = childrenToText(children);
          const id = makeHeadingId(text);
          return <h1 id={id} className="japanese-style-modern-h1">{children}</h1>;
        },
        h2({ children }) {
          const text = childrenToText(children);
          const id = makeHeadingId(text);
          return <h2 id={id} className="japanese-style-modern-h2">{children}</h2>;
        },
        h3: (p) => <h3 className="japanese-style-modern-h3">{p.children}</h3>,
        h4: (p) => <h4 className="japanese-style-modern-h4">{p.children}</h4>,

        blockquote: (p) => (
          <blockquote className="japanese-style-modern-blockquote">{p.children}</blockquote>
        ),

        strong: (p) => <strong className="japanese-style-modern-strong">{p.children}</strong>,
        em: (p) => <em className="japanese-style-modern-em">{p.children}</em>,

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

        ul: (p) => <ul className="japanese-style-modern-ul">{p.children}</ul>,
        ol: (p) => <ol className="japanese-style-modern-ol">{p.children}</ol>,
        li: (p) => <li className="japanese-style-modern-li">{p.children}</li>,

        table: (p) => <table className="japanese-style-modern-table">{p.children}</table>,
        thead: (p) => <thead className="japanese-style-modern-thead">{p.children}</thead>,
        tbody: (p) => <tbody className="japanese-style-modern-tbody">{p.children}</tbody>,
        tr: (p) => <tr className="japanese-style-modern-tr">{p.children}</tr>,
        th: (p) => <th className="japanese-style-modern-th">{p.children}</th>,
        td: (p) => <td className="japanese-style-modern-td">{p.children}</td>,

        hr: () => <hr className="japanese-style-modern-hr" />,

        code(props: React.ComponentProps<"code"> & { inline?: boolean }) {
          if (props.inline) {
            return <code className="japanese-style-modern-code-inline">{props.children}</code>;
          }
          return <code className="japanese-style-modern-code">{props.children}</code>;
        },

        pre: (p) => <pre className="japanese-style-modern-pre">{p.children}</pre>,
      }}
    >
      {pre}
    </ReactMarkdown>
  );
}

export default MarkdownRenderer;
