// app/page.tsx
import { prisma } from "@/lib/prisma";
import { articleType } from "@/types/types";
import { CATEGORY_ITEMS } from "@/constants/constants";
import HeroSection from "@/components/top/heroSection/HeroSection";
import CategoriesSection from "@/components/top/categoriesSection/CategoriesSection";
import LatestArticlesSection from "@/components/top/latestArticlesSection/LatestArticlesSection";
import { WhiteLine } from "@/components/whiteLine/whiteLine";
import Redbubble from "@/components/redBubble/RedBubble";
import { SimpleContact } from "@/components/getInTouch/simpleContact/SimpleContact";

// サーバーサイドで最新記事を取得する関数（最適化版）
async function getLatestArticles(): Promise<articleType[]> {
  try {
    console.log("サーバーサイドで記事取得開始（最適化版）...");

    const articles = await prisma.article.findMany({
      where: {
        published: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 6,
      select: {
        // ホームページで必要な項目のみ（content除外で大幅軽量化）
        id: true,
        slug: true,
        title: true,
        category: true,
        // content: true, // ← 除外！（データ転送量大幅削減）
        summary: true,
        createdAt: true,
        images: {
          select: {
            url: true,
            altText: true,
          },
          take: 1, // 最初の1枚のみ（さらに軽量化）
        },
      },
    });

    console.log(`取得した記事数: ${articles.length}`);

    // articleType に完全準拠した形で変換
    return articles.map((article) => ({
      id: article.id,
      slug: article.slug,
      title: article.title,
      category: article.category as
        | "mythology"
        | "culture"
        | "festivals"
        | "customs",
      content: "", // 空文字（ホームページでは不使用）
      summary: article.summary || undefined, // null を undefined に変換
      createdAt: article.createdAt.toISOString(), // Date を string に変換
      images: article.images.map((img) => ({
        url: img.url,
        altText: img.altText || undefined, // null を undefined に変換
      })),
    }));
  } catch (error) {
    console.error("記事取得エラー:", error);
    // エラー発生時も空配列を返して画面は表示する
    return [];
  } finally {
    // 接続を適切に閉じる
    await prisma.$disconnect();
  }
}

// Server Component（async function）
export default async function HomePage() {
  // サーバー側で記事データを取得
  const articles = await getLatestArticles();

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
          <LatestArticlesSection articles={articles} />
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

// ISR（Incremental Static Regeneration）の設定
// 5分間キャッシュして、その後バックグラウンドで更新
export const revalidate = 300;
