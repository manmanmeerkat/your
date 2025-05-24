// app/page.tsx - Server Component版
import { articleType } from "@/types/types";
import { CATEGORY_ITEMS } from "@/constants/constants";
import HeroSection from "@/components/top/heroSection/HeroSection";
import CategoriesSection from "@/components/top/categoriesSection/CategoriesSection";
import LatestArticlesSection from "@/components/top/latestArticlesSection/LatestArticlesSection";
import { WhiteLine } from "@/components/whiteLine/whiteLine";
import Redbubble from "@/components/redBubble/RedBubble";
import { SimpleContact } from "@/components/getInTouch/simpleContact/SimpleContact";
import { Suspense } from "react";
import ArticlesLoader from "@/components/loaders/ArticlesLoader";

// データフェッチング関数（サーバーサイド）
async function getLatestArticles(): Promise<articleType[]> {
  try {
    // 本番環境では完全なURLを使用
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const response = await fetch(
      `${baseUrl}/api/articles?published=true&pageSize=6`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        // キャッシュ戦略を改善
        next: {
          revalidate: 300, // 5分間キャッシュ
          tags: ["articles"], // タグベースの無効化
        },
      }
    );

    if (!response.ok) {
      console.error(`APIエラー: ${response.status} ${response.statusText}`);
      return [];
    }

    const data = await response.json();

    if (!data || !data.articles || !Array.isArray(data.articles)) {
      console.error("不正なAPIレスポンス:", data);
      return [];
    }

    return data.articles;
  } catch (error) {
    console.error("記事取得エラー:", error);
    return [];
  }
}

// メインのページコンポーネント
export default async function Home() {
  return (
    <div className="scroll-smooth">
      <HeroSection />
      <CategoriesSection categories={CATEGORY_ITEMS} />
      <WhiteLine />

      {/* 最新記事セクション - Suspenseでラップ */}
      <section id="latest-articles" className="py-16 md:px-16 bg-slate-950">
        <div className="container mx-auto px-4 text-center">
          <Suspense fallback={<ArticlesLoader />}>
            <LatestArticlesServerComponent />
          </Suspense>
        </div>
      </section>

      <WhiteLine />
      <Redbubble />
      <WhiteLine />
      <SimpleContact />
      <WhiteLine />
    </div>
  );
}

// 記事データを取得するサーバーコンポーネント
async function LatestArticlesServerComponent() {
  const articles = await getLatestArticles();

  return <LatestArticlesSection articles={articles} />;
}

// メタデータの最適化
export const metadata = {
  title: "Your Secret Japan - 日本の隠された文化を発見",
  description: "日本の神話、祭り、習慣、文化について深く学べるウェブサイト",
};

// 動的レンダリングの設定（必要に応じて）
// export const dynamic = 'force-dynamic'; // 常に最新データが必要な場合
// export const revalidate = 300; // 5分間のISR（Incremental Static Regeneration）
