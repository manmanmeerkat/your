// components/trivia/ContentWithTrivia.tsx
import React from "react";
import { MarkdownRenderer } from "@/app/utils/simpleMarkdownRenderer";
import TriviaCard from "./TriviaCard";

export interface DisplayTrivia {
  id: string;
  title: string;
  content: string;
  contentEn: string | null;
  tags: string[];
  isActive: boolean;
}

interface ContentWithTriviaProps {
  content: string;
  triviaList: DisplayTrivia[];
}

export const ContentWithTrivia: React.FC<ContentWithTriviaProps> = ({
  content,
  triviaList,
}) => {
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
        <MarkdownRenderer key={`content-${index}`} content={part.trim()} />
      );
    }

    const match = matches[currentIndex++];
    if (!match) return;

    const identifierMatch = match[0].match(/:::trivia\[([^\]]+)\]/);
    const identifier = identifierMatch?.[1];
    if (!identifier) return;

    // ✅ ArticleTrivia ではなく DTO 側の型で扱う
    let trivia: DisplayTrivia | undefined;
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
        <TriviaCard
          key={`trivia-${trivia.id}-${index}`}
          trivia={trivia}
          index={triviaIndex}
        />
      );
    }
  });

  return <>{elements}</>;
};
