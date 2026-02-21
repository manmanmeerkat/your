// 
"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import LiteYouTube from "./liteyoutube/LiteYouTube";

interface TriviaMarkdownProps {
  content: string;
}

export const TriviaMarkdown: React.FC<TriviaMarkdownProps> = ({ content }) => {

  function getYouTubeVideoId(src?: string) {
    if (!src) return null;

    try {
      const u = new URL(src);

      // 例: https://www.youtube.com/embed/fj-1J8NDt1w?si=...
      if (u.hostname === "www.youtube.com" || u.hostname === "youtube.com") {
        const m = u.pathname.match(/^\/embed\/([a-zA-Z0-9_-]{6,})/);
        if (m) return m[1];
      }

      // もし将来 youtu.be を混ぜる可能性があるなら（保険）
      if (u.hostname === "youtu.be") {
        const id = u.pathname.replace("/", "");
        if (id) return id;
      }

      return null;
    } catch {
      return null;
    }
  }

  return (
    <div className="px-4 sm:px-6 md:px-8">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          p: ({ children, ...props }) => {
            // children が配列になることがあるので正規化
            const childArray = React.Children.toArray(children);
            const first = childArray[0];

            // 先頭要素が <img>（ReactMarkdownのimg置換後）なら <p> を作らない
            if (React.isValidElement(first) && first.type === "img") {
              return <>{children}</>;
            }

            // iframeも同様に避けたいなら（任意）
            if (React.isValidElement(first) && first.type === "iframe") {
              return <>{children}</>;
            }

            return (
              <p className="text-[0.95rem] leading-7 text-white/85 mb-4 text-left" {...props}>
                {children}
              </p>
            );
          },

          strong: ({ children, ...props }) => (
            <strong className="text-[#f5ede3] font-semibold" {...props}>
              {children}
            </strong>
          ),
          em: ({ children, ...props }) => (
            <em className="text-white/75 italic" {...props}>
              {children}
            </em>
          ),
          a: ({ children, href, ...props }) => (
            <a
              href={href}
              className="text-[#83ccd2] no-underline border-b border-[#84b9cb]/70
                        hover:border-[#a0d8ef] hover:text-[#f5ede3] transition-colors"
              target={href?.startsWith("http") ? "_blank" : undefined}
              rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
              {...props}
            >
              {children}
            </a>
          ),
          ul: ({ children, ...props }) => (
            <ul className="list-disc list-inside text-white/85 space-y-1 my-3 pl-1 text-left" {...props}>
              {children}
            </ul>
          ),
          ol: ({ children, ...props }) => (
            <ol className="list-decimal list-inside text-white/85 space-y-1 my-3 pl-1 text-left" {...props}>
              {children}
            </ol>
          ),
          li: ({ children, ...props }) => (
            <li className="text-[0.95rem] leading-7 text-white/85" {...props}>
              {children}
            </li>
          ),
          blockquote: ({ children, ...props }) => (
            <blockquote
              className="border-l-2 border-[#c96a5d]/60 bg-black/20 pl-4 py-2 my-4 text-white/75"
              {...props}
            >
              {children}
            </blockquote>
          ),
          h1: ({ children, ...props }) => (
            <h1
              className="text-[1.05rem] font-semibold text-[#e9c58a] mb-2 mt-4 text-left"
              style={{
                fontFamily:
                  '"Inter", "Noto Sans JP", "Hiragino Kaku Gothic ProN", sans-serif',
                letterSpacing: "0.02em",
              }}
              {...props}
            >
              {children}
            </h1>
          ),

          h2: ({ children, ...props }) => (
            <h2
              className="text-[1rem] font-semibold text-[#e9c58a] mb-2 mt-3 text-left"
              style={{
                fontFamily:
                  '"Inter", "Noto Sans JP", "Hiragino Kaku Gothic ProN", sans-serif',
                letterSpacing: "0.02em",
              }}
              {...props}
            >
              {children}
            </h2>
          ),

          h3: ({ children, ...props }) => (
            <h3
              className="
                text-[1.05rem]
                font-medium
                text-white/70
                mb-4
                mt-2
                text-left
                leading-relaxed
              "
              style={{
                fontFamily:
                  '"Inter", "Noto Serif JP", "Hiragino Mincho ProN", serif',
                letterSpacing: "0.015em",
              }}
              {...props}
            >
              {children}
            </h3>
          ),

          hr: (props) => <hr className="border-white/10 my-4" {...props} />,
          iframe: ({ src, title, ...props }) => {
            const videoId = getYouTubeVideoId(typeof src === "string" ? src : undefined);

            // ✅ YouTubeだけ軽量化
            if (videoId) {
              return (
                <div className="mt-4 flex justify-center">
                  <div className="w-full max-w-2xl aspect-video overflow-hidden rounded-xl border border-white/10 bg-black/10">
                    <LiteYouTube
                      videoId={videoId}
                      title={typeof title === "string" ? title : "YouTube video"}
                      className="w-full h-full"
                    />
                  </div>
                </div>
              );
            }

            // ✅ それ以外の iframe は従来通り
            return (
              <div className="mt-4 flex justify-center">
                <div className="w-full max-w-2xl aspect-video overflow-hidden rounded-xl border border-white/10 bg-black/10">
                  <iframe className="w-full h-full" src={src} title={title} {...props} />
                </div>
              </div>
            );
          },
          img: ({ alt, ...props }) => (
            <img
              alt={alt ?? ""}
              className="
                my-5
                block mx-auto
                w-full
                max-w-none
                rounded-xl
                border border-white/10
                shadow-lg
                sm:max-w-[520px]
                md:max-w-[640px]
                lg:max-w-[720px]
              "
              {...props}
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
