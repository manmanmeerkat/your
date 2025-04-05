"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useEffect, useState } from "react";

interface Article {
  id: string;
  slug: string;
  title: string;
  category: string;
  content: string;
  summary?: string;
  createdAt: string;
  images?: Array<{
    url: string;
    altText?: string;
  }>;
}

// スライドショー用の画像データ
const backgroundImages = [
  "/images/mythology.png", // 京都の紅
  "/images/fujiyama.png", // 祭りの様子
  "/images/kimono.png", // 神社の鳥居
  "/images/ninja.png", // 伝統的な和食
  "/images/sakura.png", // 伝統的な和食
];

// 背景スライドショーコンポーネント
function BackgroundSlideshow() {
  const [currentSlide, setCurrentSlide] = useState(0);

  // 自動スライド切り替え
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % backgroundImages.length);
    }, 5000); // 5秒ごとに切り替え

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {backgroundImages.map((image, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1500 ${
            index === currentSlide ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* 画像コンテナ */}
          <div className="absolute inset-0 overflow-hidden">
            <img
              src={image}
              alt={`スライド ${index + 1}`}
              className="w-full h-full object-cover"
              style={{ objectPosition: "center" }}
            />
          </div>

          {/* 暗いオーバーレイを追加（不透明度を下げる） */}
          <div className="absolute inset-0 bg-black opacity-40"></div>
        </div>
      ))}
    </>
  );
}

export default function Home() {
  const [latestArticles, setLatestArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  // useEffectを使用して記事データを取得
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        // API URLの構築（ベースURLの設定）
        const baseUrl =
          process.env.NEXT_PUBLIC_SITE_URL ||
          (process.env.NODE_ENV === "development"
            ? "http://localhost:3000"
            : "https://yourwebsite.com");

        // 公開済み記事のみを取得
        const res = await fetch(`${baseUrl}/api/articles?published=true`, {
          cache: "no-cache",
        });

        if (!res.ok) {
          setLatestArticles([]);
          return;
        }

        const data = await res.json();

        // 記事を作成日時でソートし、最新6件を取得
        const sortedArticles = [...(data.articles || [])]
          .sort(
            (a: Article, b: Article) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
          .slice(0, 6);

        setLatestArticles(sortedArticles);
      } catch (error) {
        console.error("記事の取得に失敗しました:", error);
        setLatestArticles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  return (
    <div>
      {/* ヒーローセクション（背景スライドショー付き） */}
      <section className="relative bg-slate-900 text-white">
        {/* 背景スライドショー */}
        <div className="absolute inset-0 z-0">
          <BackgroundSlideshow />
        </div>

        <div className="container mx-auto px-4 py-32 relative z-10">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-lg">
              日本の隠れた魅力を探求しよう
            </h1>
            <p className="text-xl mb-8 drop-shadow-md">
              古代から続く神話、四季折々の祭り、豊かな伝統文化。
              あなたの知らない日本の姿をご紹介します。
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/mythology">
                <Button size="lg" className="bg-red-600 hover:bg-red-700">
                  神話を探る
                </Button>
              </Link>
              <Link href="/culture">
                <Button
                  size="lg"
                  className="bg-transparent border border-white hover:bg-white/10"
                >
                  文化を学ぶ
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* カテゴリーセクション */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">
            探索するカテゴリー
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Link href="/culture" className="block group">
              <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform group-hover:scale-105">
                <div className="h-48 bg-slate-200 relative">
                  <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                    <Image
                      src="/images/culture-category.png"
                      alt="culture-img"
                      width={350}
                      height={194}
                    />
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-bold mb-2">文化</h3>
                  <p className="text-slate-600">
                    茶道、生け花、着物など、日本独特の文化とその背景。
                  </p>
                </div>
              </div>
            </Link>

            <Link href="/mythology" className="block group">
              <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform group-hover:scale-105">
                <div className="h-48 bg-slate-200 relative">
                  <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                    <Image
                      src="/images/mythology-category.png"
                      alt="mythology-img"
                      width={350}
                      height={194}
                    />
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-bold mb-2">神話</h3>
                  <p className="text-slate-600">
                    天照大神、スサノオ、八岐大蛇など日本神話の神々と物語。
                  </p>
                </div>
              </div>
            </Link>

            <Link href="/tradition" className="block group">
              <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform group-hover:scale-105">
                <div className="h-48 bg-slate-200 relative">
                  <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                    <Image
                      src="/images/tradition-category.png"
                      alt="tradition-img"
                      width={350}
                      height={194}
                    />
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-bold mb-2">伝統</h3>
                  <p className="text-slate-600">
                    武士道、歌舞伎、相撲など、日本の誇る伝統とその精神。
                  </p>
                </div>
              </div>
            </Link>

            <Link href="/festivals" className="block group">
              <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform group-hover:scale-105">
                <div className="h-48 bg-slate-200 relative">
                  <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                    <Image
                      src="/images/festival-category.png"
                      alt="festival-img"
                      width={350}
                      height={194}
                    />
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-bold mb-2">祭り</h3>
                  <p className="text-slate-600">
                    祇園祭、ねぶた祭りなど、全国各地の伝統的な祭りとその由来。
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* 最新記事セクション */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">最新の記事</h2>

          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          ) : latestArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {latestArticles.map((article: Article) => (
                <Card key={article.id} className="flex h-full overflow-hidden">
                  <div className="flex flex-col md:flex-row w-full">
                    {/* 画像部分 - 左側に配置 */}
                    <div className="md:w-1/3 bg-slate-100 flex items-center justify-center shrink-0">
                      {article.images && article.images[0] ? (
                        <img
                          src={article.images[0].url}
                          alt={article.images[0].altText || article.title}
                          className="max-h-40 md:max-h-full max-w-full object-contain md:h-full md:w-auto"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-40 md:h-full w-full text-slate-400">
                          No image
                        </div>
                      )}
                    </div>

                    {/* コンテンツ部分 - 右側に配置 */}
                    <div className="md:w-2/3 p-4 flex flex-col justify-between">
                      <div>
                        {/* カテゴリーバッジ */}
                        <div className="mb-1">
                          <span className="inline-block bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-xs font-medium">
                            {article.category === "mythology" && "神話"}
                            {article.category === "culture" && "文化"}
                            {article.category === "tradition" && "伝統"}
                            {article.category === "festivals" && "祭り"}
                          </span>
                        </div>

                        <h3 className="text-lg font-bold mb-2">
                          {article.title}
                        </h3>
                        <p className="text-sm text-gray-500 mb-3">
                          {new Date(article.createdAt).toLocaleDateString(
                            "ja-JP"
                          )}
                        </p>
                        <p className="mb-4 line-clamp-3 text-sm">
                          {article.summary ||
                            (article.content &&
                              article.content.substring(0, 100) + "...") ||
                            "記事の内容はありません。"}
                        </p>
                      </div>
                      <div className="mt-auto">
                        <Link href={`/articles/${article.slug}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full md:w-auto"
                          >
                            続きを読む
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center text-slate-500">まだ記事がありません。</p>
          )}

          <div className="mt-10 text-center">
            <Link href="/articles">
              <Button variant="outline" size="lg">
                すべての記事を見る
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* お問い合わせセクション */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">お問い合わせ</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            ご質問、ご提案、または日本文化に関するお問い合わせがございましたら、お気軽にご連絡ください。
          </p>
          <Link href="/contact">
            <Button size="lg">お問い合わせフォーム</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
