"use client";

import React, { useEffect, useState } from "react";
import { TriviaCard } from "./TriviaCard";
import { TriviaPlaceholder } from "./TriviaPlaceholder";
import { MarkdownRenderer } from "@/app/utils/simpleMarkdownRenderer";
import type { ArticleTrivia } from "@/types/types";

interface ContentWithTriviaProps {
  content: string;
  triviaList?: ArticleTrivia[];
}

export const ContentWithTrivia: React.FC<ContentWithTriviaProps> = ({
  content,
  triviaList,
}) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!triviaList || triviaList.length === 0) {
    return <MarkdownRenderer content={content} />;
  }

  const triviaRegex = /:::trivia\[[^\]]+\]/g;
  const parts = content.split(triviaRegex);
  const elements: React.ReactNode[] = [];
  const usedTrivia = new Set<string>();

  const matches = [...content.matchAll(triviaRegex)];
  let currentIndex = 0;

  parts.forEach((part, index) => {
    if (part.trim()) {
      elements.push(
        <MarkdownRenderer
          key={`content-${index}`}
          content={part.trim()}
        />
      );
    }

    const match = matches[currentIndex++];
    if (!match) return;

    const identifierMatch = match[0].match(/:::trivia\[([^\]]+)\]/);
    const identifier = identifierMatch?.[1];

    if (!identifier) return;

    let trivia: ArticleTrivia | undefined;
    let triviaIndex = 0;

    if (isNaN(Number(identifier))) {
      trivia = triviaList.find((t) => t.id === identifier && t.isActive);
      triviaIndex = triviaList.findIndex((t) => t.id === identifier);
    } else {
      const idx = parseInt(identifier, 10);
      trivia = triviaList[idx];
      triviaIndex = idx;
    }

    if (trivia && trivia.isActive && !usedTrivia.has(trivia.id)) {
      usedTrivia.add(trivia.id);

      elements.push(
        isClient ? (
          <TriviaCard
            key={`trivia-${trivia.id}-${index}`}
            trivia={trivia}
            index={triviaIndex}
          />
        ) : (
          <TriviaPlaceholder
            key={`trivia-placeholder-${index}`}
            index={triviaIndex}
          />
        )
      );
    } else if (
      !trivia &&
      process.env.NODE_ENV === "development" &&
      isClient
    ) {
      elements.push(
        <div
          key={`trivia-error-${index}`}
          className="my-4 p-4 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm"
        >
          ⚠️ 一口メモ &quot;{identifier}&quot; が見つかりません
        </div>
      );
    }
  });

  return <>{elements}</>;
};
