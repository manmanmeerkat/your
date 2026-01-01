// 
"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

interface TriviaMarkdownProps {
  content: string;
}

export const TriviaMarkdown: React.FC<TriviaMarkdownProps> = ({ content }) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw]}
      components={{
        p: ({ children, ...props }) => (
          <p
            className="text-[0.95rem] leading-7 text-white/85 mb-4 text-left"
            {...props}
          >
            {children}
          </p>
        ),
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
            className="text-[0.95rem] font-semibold text-[#e9c58a] mb-1 mt-3 text-left"
            style={{
              fontFamily:
                '"Inter", "Noto Sans JP", "Hiragino Kaku Gothic ProN", sans-serif',
              letterSpacing: "0.02em",
            }}
            {...props}
          >
            {children}
          </h3>
        ),

        hr: (props) => <hr className="border-white/10 my-4" {...props} />,
        iframe: (props) => (
          <div className="mt-4 flex justify-center">
            <div className="w-full max-w-2xl aspect-video overflow-hidden rounded-xl border border-white/10 bg-black/10">
              <iframe className="w-full h-full" {...props} />
            </div>
          </div>
        ),
        img: (props) => (
          <div className="my-4 flex justify-center">
            <img className="rounded-xl border border-white/10 shadow-lg max-w-full h-auto" {...props} />
          </div>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
};
