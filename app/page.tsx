// app/page.tsx (サーバーコンポーネント)
import { prisma } from "@/lib/prisma";
import { Suspense } from "react";
import HeroSection from "@/components/top/hero/HeroSection";
import CategorySection from "@/components/top/category/CategorySection";
import LatestArticlesSection from "@/components/top/latestArticles/LatestArticlesSection";
import Redbubble from "@/components/redBubble/RedBubble";
import { WhiteLine } from "@/components/whiteLine/whiteLine";
import { SimpleContact } from "@/components/getInTouch/simpleContact/SimpleContact";
import { CATEGORY_ITEMS } from "@/constants/constants";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your Secret Japan - 日本の秘密",
  description: "Explore Japan's hidden charms, myths, and traditions",
};

// キャッシュの設定
export const revalidate = 3600; // 1時間ごとに再検証

export default async function Home() {
  // サーバーサイドで直接データ取得 (APIを使用しない)
  const articles = await prisma.article.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    take: 6,
    include: { images: true },
  });

  return (
    <div className="scroll-smooth">
      {/* Hero セクション - インタラクティブな部分 */}
      <HeroSection />

      {/* カテゴリーセクション - 静的な部分 */}
      <section id="categories" className="py-16 bg-slate-950 md:px-16">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h2 className="text-3xl font-bold mb-12 text-center text-white">
            Categories to Explore
          </h2>
          <CategorySection categories={CATEGORY_ITEMS} />
        </div>
      </section>

      <WhiteLine />

      {/* 最新記事セクション - データを渡す */}
      <Suspense
        fallback={
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
          </div>
        }
      >
        <LatestArticlesSection articles={articles} />
      </Suspense>

      <WhiteLine />

      <Redbubble />

      <WhiteLine />

      {/* お問い合わせ */}
      <SimpleContact />

      <WhiteLine />
    </div>
  );
}
