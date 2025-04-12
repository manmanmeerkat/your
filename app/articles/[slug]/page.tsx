"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { marked } from "marked";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { WhiteLine } from "@/components/whiteLine/whiteLine";
import { CATEGORY_LABELS } from "@/constants/constants";

// 記事の型定義
type Image = {
  id: string;
  url: string;
  altText?: string;
  isFeatured: boolean;
};

type Article = {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  content: string;
  category: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  images: Image[];
};

export default function ArticleClientPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [article, setArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMarkdown, setIsMarkdown] = useState(false);

  // マークダウンをHTMLに変換する関数
  const renderMarkdown = (content: string) => {
    // マークダウンのパーサーを設定
    marked.setOptions({
      gfm: true, // GitHub Flavored Markdown
      breaks: true, // 改行をbrタグに変換
    });

    return marked.parse(content);
  };

  // useEffectでの非同期処理の正しい実装
  useEffect(() => {
    // 非同期関数を定義
    const fetchArticle = async () => {
      try {
        setIsLoading(true);
        setError(null);

      // デバッグ情報（開発環境のみ）
      if (process.env.NODE_ENV === "development") {
        console.log("記事取得開始 - スラッグ:", slug);
      }

      const encodedSlug = encodeURIComponent(slug);

      if (process.env.NODE_ENV === "development") {
        console.log("エンコードされたスラッグ:", encodedSlug);
      }

      const apiUrl = `/api/articles/${encodedSlug}`;

      if (process.env.NODE_ENV === "development") {
        console.log("API URL:", apiUrl);
      }

      const response = await fetch(apiUrl);

      if (process.env.NODE_ENV === "development") {
        console.log("API レスポンスステータス:", response.status);
      }

      if (!response.ok) {
        let errorMessage = "Failed to retrieve article";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;

          if (process.env.NODE_ENV === "development") {
            console.error("API error data:", errorData);
          }
        } catch (e) {
          if (process.env.NODE_ENV === "development") {
            console.error("Failed to parse API error:", e);
          }
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

      if (process.env.NODE_ENV === "development") {
        console.log("取得した記事データ:", data);
      }
        setArticle(data);

        // マークダウン形式かどうかを判断
        // 簡易的な判定: マークダウンのよくある記号が含まれているかをチェック
        const mdPatterns = [
          /^#\s+.+$/m, // 見出し
          /\*\*.+\*\*/, // 太字
          /\*.+\*/, // 斜体
          /^\s*-\s+.+$/m, // リスト
          /^\s*\d+\.\s+.+$/m, // 番号付きリスト
          /\[.+\]\(.+\)/, // リンク
          /!\[.+\]\(.+\)/, // 画像
        ];

        const contentIsMarkdown = mdPatterns.some((pattern) =>
          pattern.test(data.content)
        );
        
        setIsMarkdown(contentIsMarkdown);
        } catch (err) {
          setError(
            err instanceof Error ? err.message : "不明なエラーが発生しました"
          );
        
          if (process.env.NODE_ENV === "development") {
            console.error("記事取得エラー:", err);
          }
        } finally {
          setIsLoading(false);
        }
    };

    // 関数を呼び出す（async関数を直接useEffectの第一引数にしないこと）
    fetchArticle();
  }, [slug]);

  // カテゴリーの日本語名を取得
  const getCategoryName = (category: string) => {
    const categories: { [key: string]: string } = {
      culture: "culture",
      mythology: "mythology",
      festivals: "festivals",
      customs: "customs",
    };
    return categories[category] || category;
  };

  // ローディング中
  if (isLoading) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
        <p className="text-center mt-4">Loading article...</p>
      </div>
    );
  }

  // エラー発生時
  if (error) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293
                1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10
                8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Something went wrong.
              </h3>
              <p className="mt-2 text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 記事が存在しない場合
  if (!article) {
    return (
      <div className="container mx-auto py-10 px-4">
        <h1 className="text-2xl font-bold">Article not found.</h1>
        <p>The article you're looking for may not exist or is not publicly available.</p>
      </div>
    );
  }

  // 記事表示
  return (
    <div className="bg-slate-950 min-h-screen">
      {/* ヒーローセクション：アイキャッチ画像 */}
      {article.images && article.images.some((img) => img.isFeatured) ? (
  <div className="w-full bg-slate-950 overflow-hidden pt-8">
    <div className="relative max-h-[400px] w-full flex justify-center">
      <img
        src={article.images.find((img) => img.isFeatured)?.url}
        alt={article.title}
        className="h-auto max-h-[400px] object-contain rounded-[5px]"
      />
    </div>
    <WhiteLine/>
  </div>
) : null}

      {/* 記事コンテンツ */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* 記事ヘッダー */}
          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              {article.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <span className="bg-blue-50 text-slate-950 px-3 py-1 rounded-full">
                {getCategoryName(article.category)}
              </span>
              {/* <time dateTime={article.updatedAt} className="flex items-center text-white">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                    clipRule="evenodd"
                  />
                </svg>
                {new Date(article.updatedAt).toLocaleDateString("ja-JP")}
              </time> */}
            </div>
          </header>

          {/* 記事本文 - マークダウン形式かHTMLに応じて表示方法を変更 */}
          <div className="prose prose-lg max-w-none mb-12 article-content text-white text-justify">
            {isMarkdown ? (
              <div
                dangerouslySetInnerHTML={{
                  __html: renderMarkdown(article.content),
                }}
                className="markdown-content"
              />
            ) : (
              <div dangerouslySetInnerHTML={{ __html: article.content }} />
            )}
          </div>

          {/* 関連画像セクション */}
          {/* {article.images &&
            article.images.length > 0 &&
            article.images.some((img) => !img.isFeatured) && (
              <div className="mt-12 pt-8 border-t border-gray-200">
                <h2 className="text-2xl font-bold mb-6">関連画像</h2>
                <div className="grid grid-cols-1 gap-8">
                  {article.images
                    .filter((image) => !image.isFeatured)
                    .map((image) => (
                      <div key={image.id} className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-center">
                          <img
                            src={image.url}
                            alt={image.altText || article.title}
                            className="max-h-[400px] object-contain"
                          />
                        </div>
                        {image.altText && (
                          <p className="mt-4 text-sm text-gray-700 text-center">
                            {image.altText}
                          </p>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )} */}
        </div>
      </div>
      <div className="flex justify-center mt-8">
        <Link href={`/${article.category}`}>
          <Button
            size="lg"
            className="w-[320px] font-normal
                      border border-rose-700 bg-rose-700 text-white
                      hover:bg-white hover:text-rose-700 hover:border-rose-700 hover:font-bold
                      shadow hover:shadow-lg"
          >
            Back to {CATEGORY_LABELS[article.category]} Posts ≫
          </Button>
        </Link>
      </div>
      <WhiteLine/>
    </div>
  );
}
