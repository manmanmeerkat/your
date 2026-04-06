import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { makeHeadingId } from "@/app/utils/headingId";
import styles from "@/app/styles/japanese-style-modern.module.css";

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

function preprocessImageSyntax(content: string): string {
  const imageWithOptionsRegex = /!\[([^\]]*?)\]\(([^)]+?)\)\{([^}]+?)\}/g;

  return content.replace(imageWithOptionsRegex, (match, alt, url, options) => {
    if (alt.includes("{") && alt.includes("}")) return match;
    const newAlt = alt.trim() ? `${alt.trim()}{${options}}` : `{${options}}`;
    return `![${newAlt}](${url})`;
  });
}

function preprocessTriviaSyntax(content: string): string {
  return content.replace(/:::\s*trivia\[(\d+)\]\s*/g, (_m, n) => `TRIVIA_PLACEHOLDER_${n}`);
}

function normalizeSrc(src?: string) {
  if (!src) return "";
  if (src.includes("supabase.co")) return src;
  if (src.startsWith("//")) return "https:" + src;
  if (src.startsWith("http://") || src.startsWith("https://")) return src;
  if (!src.startsWith("/")) return "/" + src;
  return src;
}

const InlineTrivia: React.FC<{ trivia: ArticleTrivia; index: number }> = ({ trivia }) => {
  return (
    <div style={{ width: "100%", marginTop: "3rem", marginBottom: "3rem" }}>
      <div style={{ color: "#d1d5db", whiteSpace: "pre-wrap" }}>{trivia.content}</div>
    </div>
  );
};

export function SimpleImage({
  src,
  alt,
  title,
  width,
  height,
  className = "",
}: SimpleImageProps) {
  if (!src) return null;

  const style: React.CSSProperties = {};
  if (width && height && width > 0 && height > 0) {
    style.aspectRatio = `${width} / ${height}`;
  }

  return (
    <img
      src={src}
      alt={alt ?? ""}
      title={title}
      loading="lazy"
      decoding="async"
      style={{
        display: "block",
        width: "100%",
        height: "auto",
        ...style,
      }}
      className={className}
    />
  );
}

function preprocessSummarySyntax(content: string): string {
  return content.replace(
    /:::\s*summary\[(.*?)\]\s*([\s\S]*?):::/g,
    (_m, title, body) => {
      const encoded = encodeURIComponent(
        JSON.stringify({
          title: title.trim(),
          body: body.trim(),
        })
      );
      return `@@SUMMARY:${encoded}@@`;
    }
  );
}

function childrenToText(children: React.ReactNode): string {
  return React.Children.toArray(children)
    .map((child) => {
      if (typeof child === "string") return child;
      if (typeof child === "number") return String(child);
      if (React.isValidElement(child)) {
        return childrenToText((child.props as { children?: React.ReactNode }).children);
      }
      return "";
    })
    .join("")
    .trim();
}

export function MarkdownRenderer({ content, triviaList = [] }: MarkdownRendererProps) {
  const pre = preprocessSummarySyntax(preprocessTriviaSyntax(preprocessImageSyntax(content)));

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p({ children }) {
          const text = childrenToText(children);

          if (text.startsWith("@@SUMMARY:") && text.endsWith("@@")) {
            const raw = text.replace(/^@@SUMMARY:/, "").replace(/@@$/, "");

            type SummaryData = {
              title: string;
              body: string;
            };

            const { title, body } = JSON.parse(decodeURIComponent(raw)) as SummaryData;

            return (
              <div className={styles.summaryBox}>
                <p className={styles.summaryBoxTitle}>{title}</p>
                {body.split(/\n\s*\n/).map((paragraph: string, i: number) => (
                  <ReactMarkdown
                    key={i}
                    remarkPlugins={[remarkGfm]}
                    components={{
                      ul: (p) => <ul className={styles.summaryBoxUl}>{p.children}</ul>,
                      li: (p) => <li className={styles.summaryBoxLi}>{p.children}</li>,
                      p: (p) => <p className={styles.summaryBoxText}>{p.children}</p>,
                    }}
                  >
                    {paragraph}
                  </ReactMarkdown>
                ))}
              </div>
            );
          }

          if (text.startsWith("TRIVIA_PLACEHOLDER_")) {
            const idx = Number(text.replace("TRIVIA_PLACEHOLDER_", ""));
            const trivia = triviaList[idx];
            if (!trivia) return null;
            return <InlineTrivia trivia={trivia} index={idx} />;
          }

          return <p className={styles.p}>{children}</p>;
        },

        img(props) {
          const { src } = props;
          let alt = props.alt || "";
          let width: number | undefined;
          let height: number | undefined;

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

          return (
            <span className="my-4 block not-prose">
              <span className="block w-full overflow-hidden rounded-xl border border-white/10 shadow-lg aspect-[16/9] flex items-center justify-center">
                <img
                  src={normalizedSrc}
                  alt={alt ?? ""}
                  loading="lazy"
                  decoding="async"
                  className="block w-full h-full object-contain m-0"
                />
              </span>
            </span>
          );
        },

        iframe: (props) => (
          <div
            className="my-6"
            style={{ width: "100%", aspectRatio: "16/9", position: "relative" }}
          >
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
          return <h1 id={id} className={styles.h1}>{children}</h1>;
        },

        h2({ children }) {
          const text = childrenToText(children);
          const id = makeHeadingId(text);
          return <h2 id={id} className={styles.h2}>{children}</h2>;
        },

        h3: (p) => <h3 className={styles.h3}>{p.children}</h3>,
        h4: (p) => <h4 className={styles.h4}>{p.children}</h4>,

        blockquote: (p) => (
          <blockquote className={styles.blockquote}>{p.children}</blockquote>
        ),

        strong: (p) => <strong className={styles.strong}>{p.children}</strong>,
        em: (p) => <em className={styles.em}>{p.children}</em>,

        a(props) {
          return (
            <a
              className={styles.a}
              href={props.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              {props.children}
            </a>
          );
        },

        ul: (p) => <ul className={styles.ul}>{p.children}</ul>,
        ol: (p) => <ol className={styles.ol}>{p.children}</ol>,
        li: (p) => <li className={styles.li}>{p.children}</li>,

        table: (p) => <table className={styles.table}>{p.children}</table>,
        thead: (p) => <thead className={styles.thead}>{p.children}</thead>,
        tbody: (p) => <tbody className={styles.tbody}>{p.children}</tbody>,
        tr: (p) => <tr className={styles.tr}>{p.children}</tr>,
        th: (p) => <th className={styles.th}>{p.children}</th>,
        td: (p) => <td className={styles.td}>{p.children}</td>,

        hr: () => <hr className={styles.hr} />,

        code(props: React.ComponentProps<"code"> & { inline?: boolean }) {
          if (props.inline) {
            return <code className={styles.codeInline}>{props.children}</code>;
          }
          return <code className={styles.code}>{props.children}</code>;
        },

        pre: (p) => <pre className={styles.pre}>{p.children}</pre>,
      }}
    >
      {pre}
    </ReactMarkdown>
  );
}

export default MarkdownRenderer;