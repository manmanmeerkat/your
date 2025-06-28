"use client";

import React, { useEffect, useState } from "react";
import { TriviaMarkdown } from "./TriviaMarkdown";
import type { ArticleTrivia } from "@/types/types";

interface TriviaCardProps {
  trivia: ArticleTrivia;
  index: number;
}

const TriviaCard: React.FC<TriviaCardProps> = ({ trivia }) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const displayContent = trivia.contentEn || trivia.content;

  return (
    <div className="my-2 mx-auto max-w-4xl flex justify-center">
      <div className="relative bg-gradient-to-br from-[#000b00] via-[#302833] to-[#000b00] border border-[#a59aca] rounded-lg shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden group w-full max-w-2xl">

        {/* 四隅の角飾り */}
        <div className="absolute top-3 left-3 w-2 h-2 border-l border-t border-[#f1bf99] rounded-sm opacity-70" />
        <div className="absolute top-3 right-3 w-2 h-2 border-r border-t border-[#f1bf99] rounded-sm opacity-70" />
        <div className="absolute bottom-3 left-3 w-2 h-2 border-l border-b border-[#f1bf99] rounded-sm opacity-70" />
        <div className="absolute bottom-3 right-3 w-2 h-2 border-r border-b border-[#f1bf99] rounded-sm opacity-70" />

        <div className="relative py-2 pb-8 text-center">
          {/* タイトル */}
          <div className="relative z-10 text-center">
            <h4 className="flex items-center justify-center gap-1 py-2 px-10 bg-[#302833] mx-auto w-fit border-l-4 border-[#a59aca]">
              <span className="text-2xl font-bold text-[#f3f3f2] font-serif tracking-widest">
                Trivia
              </span>
            </h4>
          </div>

          {/* Markdown コンテンツ */}
          <div className="trivia-markdown-content text-center py-6 mt-4 pb-2 px-8">
            <TriviaMarkdown content={displayContent} />
          </div>

          {/* 補足（日本語版の表示） */}
          {trivia.contentEn &&
            trivia.content !== trivia.contentEn &&
            isClient && (
              <details className="mt-3 border-t border-gray-600 pt-3 text-center">
                <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-300">
                  日本語版を表示
                </summary>
                <div className="mt-2 text-xs text-gray-400 border-l-2 border-gray-600 pl-3 text-center">
                  <TriviaMarkdown content={trivia.content} />
                </div>
              </details>
            )}

          {/* タグ表示 */}
          {trivia.tags && trivia.tags.length > 0 && isClient && (
            <div className="mt-4 flex flex-wrap gap-1 justify-center">
              {trivia.tags.slice(0, 3).map((tag, tagIndex) => (
                <span
                  key={tagIndex}
                  className="text-xs bg-gray-700/50 text-gray-400 px-2 py-1 rounded-full border border-gray-600"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TriviaCard;
