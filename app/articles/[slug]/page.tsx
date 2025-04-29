// app/articles/[slug]/page.tsx
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ArticleContent from "./ArticleContent";
import { Metadata } from "next";
import Script from "next/script";

// 動的なメタデータ生成
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const article = await getArticle(params.slug);

  if (!article) {
    return {
      title: "記事が見つかりません",
      description: "お探しの記事は存在しないか、公開されていません。",
    };
  }

  return {
    title: `${article.title} | Your Secret Japan`,
    description:
      article.summary || `${article.title} - Japanese culture and traditions`,
    openGraph: {
      title: article.title,
      description:
        article.summary || `${article.title} - Japanese culture and traditions`,
      images: article.images?.some((img) => img.isFeatured)
        ? [{ url: article.images.find((img) => img.isFeatured)?.url || "" }]
        : [],
    },
  };
}

// キャッシュの設定
export const revalidate = 3600; // 1時間ごとに再検証

// サーバーサイドでデータを取得
async function getArticle(slug: string) {
  try {
    // URLデコードを行ってから検索
    const decodedSlug = decodeURIComponent(slug);

    // 複数の可能性を試す
    const article = await prisma.article.findFirst({
      where: {
        OR: [
          { slug: decodedSlug },
          { slug: slug },
          // 全角括弧を半角に置換したバージョンも試す
          { slug: decodedSlug.replace(/（/g, "(").replace(/）/g, ")") },
        ],
        published: true,
      },
      include: { images: true },
    });

    console.log(
      "検索したスラグ:",
      decodedSlug,
      "結果:",
      article ? "記事あり" : "記事なし"
    );

    return article;
  } catch (error) {
    console.error("記事取得エラー:", error);
    return null;
  }
}

export default async function ArticlePage({
  params,
}: {
  params: { slug: string };
}) {
  const article = await getArticle(params.slug);

  if (!article) {
    notFound(); // Next.jsの404ページにリダイレクト
  }

  // 日付を文字列に変換
  const formattedArticle = {
    ...article,
    createdAt: article.createdAt.toISOString(),
    updatedAt: article.updatedAt.toISOString(),
  };

  // すでにサーバー側でマークダウン変換を行い、HTMLを生成
  const renderedContent = await renderMarkdown(article.content);

  return (
    <>
      <ArticleContent
        article={formattedArticle}
        renderedContent={renderedContent}
      />
      {/* 必要なスクリプトを最適な方法で読み込み */}
      <Script src="/js/article-highlight.js" strategy="lazyOnload" />
    </>
  );
}

// マークダウン変換をサーバーサイドで行う関数
async function renderMarkdown(content: string): Promise<{
  isMarkdown: boolean;
  html: string;
}> {
  // マークダウン形式かどうかを判断
  const mdPatterns = [
    /^#\s+.+$/m, // 見出し
    /\*\*.+\*\*/, // 太字
    /\*.+\*/, // 斜体
    /^\s*-\s+.+$/m, // リスト
    /^\s*\d+\.\s+.+$/m, // 番号付きリスト
    /\[.+\]\(.+\)/, // リンク
    /!\[.+\]\(.+\)/, // 画像
  ];

  const isMarkdown = mdPatterns.some((pattern) => pattern.test(content));

  if (isMarkdown) {
    // サーバーサイドでmarkedをインポート
    const { marked } = await import("marked");
    marked.setOptions({
      gfm: true,
      breaks: true,
    });
    return {
      isMarkdown: true,
      html: await marked.parse(content),
    };
  }

  return {
    isMarkdown: false,
    html: content,
  };
}
