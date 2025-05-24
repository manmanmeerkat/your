"use client";

import { useCallback, useEffect, useState } from "react";
import { articleType } from "@/types/types";
import { CATEGORY_ITEMS } from "@/constants/constants";
import HeroSection from "@/components/top/heroSection/HeroSection";
import CategoriesSection from "@/components/top/categoriesSection/CategoriesSection";
import LatestArticlesSection from "@/components/top/latestArticlesSection/LatestArticlesSection";
import ArticlesLoader from "@/components/loaders/ArticlesLoader";
import { WhiteLine } from "@/components/whiteLine/whiteLine";
import Redbubble from "@/components/redBubble/RedBubble";
import { SimpleContact } from "@/components/getInTouch/simpleContact/SimpleContact";

// クライアントコンポーネント版の記事読み込み
export default function Home() {
  const [articles, setArticles] = useState<articleType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchArticles = useCallback(async () => {
    try {
      setIsLoading(true);

      // 相対URLを使用
      console.log("記事API呼び出し開始...");
      const response = await fetch("/api/articles?published=true&pageSize=6", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // キャッシュ関連のヘッダー
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
        },
      });

      if (!response.ok) {
        throw new Error(`APIエラー: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log("API応答:", data);

      if (!data || !data.articles || !Array.isArray(data.articles)) {
        console.error("不正なAPIレスポンス:", data);
        throw new Error("APIレスポンスの形式が不正です");
      }

      console.log(`取得した記事数: ${data.articles.length}`);

      setArticles(data.articles);
      setError(null);
    } catch (err) {
      console.error("記事取得エラー:", err);
      setError(err instanceof Error ? err.message : String(err));
      setArticles([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  return (
    <div className="scroll-smooth">
      {/* Hero セクション */}
      <HeroSection />

      {/* カテゴリーセクション */}
      <CategoriesSection categories={CATEGORY_ITEMS} />

      <WhiteLine />

      {/* 最新記事セクション */}
      <section id="latest-articles" className="py-16 md:px-16 bg-slate-950">
        <div className="container mx-auto px-4 text-center">
          {isLoading ? (
            <ArticlesLoader />
          ) : (
            <>
              {error && (
                <div className="text-red-500 mb-4">読み込みエラー: {error}</div>
              )}
              <LatestArticlesSection articles={articles} />

              {/* デバッグ用エリア - 本番では削除 */}
              {error && (
                <div className="mt-8 text-left">
                  <details>
                    <summary className="cursor-pointer text-gray-500">
                      デバッグ情報を表示
                    </summary>
                    <div className="mt-2 p-4 bg-gray-900 text-gray-300 rounded text-sm overflow-auto">
                      <p>Error: {error}</p>
                    </div>
                  </details>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <WhiteLine />

      <Redbubble />

      <WhiteLine />

      {/* お問い合わせ */}
      <SimpleContact />

      <WhiteLine />
    </div>
  );
}
