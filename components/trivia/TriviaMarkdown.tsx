import React from "react";
import dynamic from "next/dynamic";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

// Dynamic import to avoid SSR mismatch
const DynamicMarkdown = dynamic(() => import("react-markdown"), {
  ssr: false,
  loading: () => (
    <div className="animate-pulse space-y-2 px-10">
      <div className="h-4 bg-gray-300 rounded w-3/4" />
      <div className="h-4 bg-gray-300 rounded w-1/2" />
    </div>
  ),
});

interface TriviaMarkdownProps {
  content: string;
}

export const TriviaMarkdown: React.FC<TriviaMarkdownProps> = ({ content }) => {
  return (
    <DynamicMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw]}
      components={{
        p: ({ children, ...props }) => (
          <p
            className="text-gray-200 leading-relaxed text-base font-normal mb-0 text-left"
            style={{
              fontFamily:
                '"Inter", "Noto Sans JP", "Hiragino Kaku Gothic ProN", sans-serif',
              letterSpacing: "0.025em",
              lineHeight: "1.7",
            }}
            {...props}
          >
            {children}
          </p>
        ),
        strong: ({ children, ...props }) => {
          const text = Array.isArray(children)
            ? children.join("")
            : String(children || "");

          return (
            <strong
              className={
                /^(重要|ポイント|特に|注目|注意|必見|覚えておこう)$/.test(text)
                  ? "text-yellow-400 font-bold bg-yellow-400/20 px-1 rounded"
                  : "text-white font-bold"
              }
              {...props}
            >
              {children}
            </strong>
          );
        },
        em: ({ children, ...props }) => (
          <em className="text-gray-300 italic" {...props}>
            {children}
          </em>
        ),
        a: ({ children, href, ...props }) => (
          <a
            href={href}
            className="text-[#83ccd2] no-underline transition-all duration-200 ease-in-out px-1 pb-[1px] border-b border-[#84b9cb] hover:border-[#a0d8ef] hover:bg-[rgba(245,158,11,0.1)] hover:text-[#f3f3f2]"
            target={href?.startsWith("http") ? "_blank" : undefined}
            rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
            {...props}
          >
            {children}
          </a>
        ),
        code: ({ children, className, ...props }) => {
          const match = /language-(\w+)/.exec(className || "");
          return match ? (
            <code
              className="block bg-gray-800 text-yellow-300 p-3 rounded text-sm font-mono overflow-x-auto whitespace-pre my-2"
              {...props}
            >
              {children}
            </code>
          ) : (
            <code
              className="bg-gray-700 text-yellow-300 px-2 py-1 rounded text-sm font-mono"
              {...props}
            >
              {children}
            </code>
          );
        },
        pre: ({ children, ...props }) => (
          <pre
            className="bg-gray-800 border border-gray-700 rounded-lg p-3 my-3 overflow-x-auto"
            {...props}
          >
            {children}
          </pre>
        ),
        ul: ({ children, ...props }) => (
          <ul
            className="list-disc list-inside text-gray-200 space-y-1 my-2 pl-2 text-left"
            {...props}
          >
            {children}
          </ul>
        ),
        ol: ({ children, ...props }) => (
          <ol
            className="list-decimal list-inside text-gray-200 space-y-1 my-2 pl-2 text-left"
            {...props}
          >
            {children}
          </ol>
        ),
        li: ({ children, ...props }) => (
          <li className="text-gray-200 leading-relaxed text-sm text-left" {...props}>
            {children}
          </li>
        ),
        blockquote: ({ children, ...props }) => (
          <blockquote
            className="border-l-4 border-yellow-400 bg-gray-800/50 pl-3 py-2 my-3 italic text-gray-300 text-sm text-left"
            {...props}
          >
            {children}
          </blockquote>
        ),
        h1: ({ children, ...props }) => (
          <h1 className="text-lg font-bold text-[#a59aca] mb-2 mt-3 first:mt-0 text-left" {...props}>
            {children}
          </h1>
        ),
        h2: ({ children, ...props }) => (
          <h2 className="text-base font-semibold text-[#a59aca] mb-2 mt-2 first:mt-0 text-left" {...props}>
            {children}
          </h2>
        ),
        h3: ({ children, ...props }) => (
          <h3 className="text-sm font-semibold text-[#a59aca] mb-1 mt-2 first:mt-0 text-left" {...props}>
            {children}
          </h3>
        ),
        div: ({ children, ...props }) => (
          <div className="text-lg font-bold text-[#a59aca] text-center mb-8 mt-2 first:mt-0 text-left" {...props}>
            {children}
          </div>
        ),
        hr: (props) => <hr className="border-gray-600 my-3" {...props} />,
        br: (props) => <br {...props} />,
        iframe: (props) => (
          <div className="px-4 mt-0 my-6 flex justify-center">
            <div className="w-full max-w-2xl aspect-video">
              <iframe
                className="w-full h-full rounded-lg shadow-lg"
                {...props}
              />
            </div>
          </div>
        ),
        img: (props) => (
          <div className="flex justify-center my-4">
            <img className="rounded-lg shadow-lg max-w-full h-auto" {...props} />
          </div>
        ),
      }}
    >
      {content}
    </DynamicMarkdown>
  );
};
