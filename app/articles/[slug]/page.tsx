"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

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

  // useEffectでの非同期処理の正しい実装
  useEffect(() => {
    // 非同期関数を定義
    const fetchArticle = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`/api/articles/${slug}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "記事の取得に失敗しました");
        }

        const data = await response.json();
        setArticle(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "不明なエラーが発生しました"
        );
        console.error("記事取得エラー:", err);
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
      culture: "文化",
      mythology: "神話",
      tradition: "伝統",
      festivals: "祭り",
      places: "場所",
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
        <p className="text-center mt-4">記事を読み込んでいます...</p>
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
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1
                0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293
                1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10
                8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                エラーが発生しました
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
        <h1 className="text-2xl font-bold">記事が見つかりませんでした</h1>
        <p>指定された記事は存在しないか、非公開になっています。</p>
      </div>
    );
  }

  // 記事表示
  return (
    <div className="bg-white min-h-screen">
      {/* ヒーローセクション：アイキャッチ画像 */}
      {article.images && article.images.some((img) => img.isFeatured) ? (
        <div className="w-full bg-gray-100 overflow-hidden">
          <div className="relative max-h-[400px] w-full flex justify-center">
            <img
              src={article.images.find((img) => img.isFeatured)?.url}
              alt={article.title}
              className="h-auto max-h-[400px] object-contain"
            />
          </div>
        </div>
      ) : null}

      {/* 記事コンテンツ */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* 記事ヘッダー */}
          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              {article.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                {getCategoryName(article.category)}
              </span>
              <time dateTime={article.updatedAt} className="flex items-center">
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
              </time>
            </div>
          </header>

          {/* 記事本文 */}
          <div className="prose prose-lg max-w-none mb-12">
            <div dangerouslySetInnerHTML={{ __html: article.content }} />
          </div>

          {/* 関連画像セクション */}
          {article.images &&
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
            )}
        </div>
      </div>
    </div>
  );
}
