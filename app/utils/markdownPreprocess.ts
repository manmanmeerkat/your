// app/utils/markdownPreprocess.ts
export type ArticleTrivia = { title: string; /* 必要なら他も */ isActive?: boolean };

export function preprocessImageSyntax(content: string): string {
  const imageWithOptionsRegex = /!\[([^\]]*?)\]\(([^)]+?)\)\{([^}]+?)\}/g;

  return content.replace(imageWithOptionsRegex, (match, alt, url, options) => {
    if (alt.includes("{") && alt.includes("}")) return match;
    const newAlt = alt.trim() ? `${alt.trim()}{${options}}` : `{${options}}`;
    return `![${newAlt}](${url})`;
  });
}

export function separateTriviaFromMarkdown<T extends { isActive?: boolean }>(
  content: string,
  triviaList: T[]
): { markdownContent: string } {
  let markdownContent = content;

  triviaList.forEach((trivia, index) => {
    // あなたの仕様：:::trivia[index] を置換するならここで対応
    // （今は ContentWithTrivia 側で実際どう置換してるかに合わせる）
    const placeholder = `<!-- TRIVIA_${index} -->`;
    markdownContent = markdownContent.replace(
      new RegExp(`:::trivia\\[${index}\\]`, "g"),
      placeholder
    );
  });

  return { markdownContent };
}
