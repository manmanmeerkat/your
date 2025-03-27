// app/festivals/page.tsx
import Image from "next/image";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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

async function getFestivalArticles() {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.NODE_ENV === "development"
        ? "http://localhost:3000"
        : "https://yourwebsite.com");

    const res = await fetch(
      `${baseUrl}/api/articles?category=festivals&published=true`,
      {
        cache: "no-cache",
      }
    );

    if (!res.ok) return { articles: [] };

    const data = await res.json();
    if (data.articles && Array.isArray(data.articles)) {
      data.articles = data.articles.filter(
        (article: Article) => article.category === "festivals"
      );
    }

    return data;
  } catch (error) {
    console.error("Failed to fetch festival articles:", error);
    return { articles: [] };
  }
}

export default async function FestivalsPage() {
  const { articles = [] } = await getFestivalArticles();

  return (
    <div>
      {/* ヘッダー */}
      <section className="relative bg-red-800 text-white">
        <div className="absolute inset-0 z-0 opacity-30">
          {/* 背景画像を使用する場合はコメントを外す */}
          {/* <Image
            src="/images/festivals-header.jpg"
            alt="日本の祭り"
            fill
            style={{ objectFit: "cover" }}
          /> */}
        </div>
        <div className="container mx-auto px-6 py-24 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">日本の祭り</h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto">
            四季折々の伝統的な祭りから地域の風物詩まで。
            躍動感あふれる日本の祭りの世界を体験しましょう。
          </p>
        </div>
      </section>

      {/* 祭り記事一覧 */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold mb-12 text-center">
            日本各地の祭り
          </h2>

          {articles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {articles.map((article: Article) => (
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
                            記事を読む
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center text-slate-500">
              祭りに関する記事はまだありません。
            </p>
          )}
        </div>
      </section>

      {/* 四季の祭りセクション */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold mb-12 text-center">四季の祭り</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { season: "春", examples: "桜祭り、葵祭" },
              { season: "夏", examples: "祇園祭、天神祭" },
              { season: "秋", examples: "神田祭、お月見" },
              { season: "冬", examples: "雪まつり、どんど焼き" },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div
                  className="w-32 h-32 mx-auto rounded-full relative flex items-center justify-center"
                  style={{
                    background:
                      index === 0
                        ? "linear-gradient(135deg, #ffccd5, #ff758f)"
                        : index === 1
                        ? "linear-gradient(135deg, #90e0ef, #0077b6)"
                        : index === 2
                        ? "linear-gradient(135deg, #ffb703, #fb8500)"
                        : "linear-gradient(135deg, #e9ecef, #adb5bd)",
                  }}
                >
                  <span className="text-white text-2xl font-bold">
                    {item.season}
                  </span>
                </div>
                <h3 className="mt-4 font-bold text-xl">{item.season}の祭り</h3>
                <p className="mt-2 text-gray-600">{item.examples}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 祭りカレンダー */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold mb-8 text-center">
            祭りカレンダー
          </h2>
          <p className="text-center text-lg mb-10 max-w-2xl mx-auto">
            訪日予定に合わせて、日本各地で開催される祭りの日程をチェックできます。
            地域の伝統的なお祭りから現代的なイベントまで、あなたの旅を彩る体験を見つけましょう。
          </p>

          <div className="flex justify-center">
            <Button size="lg" className="px-8 bg-red-700 hover:bg-red-800">
              祭りカレンダーを見る
            </Button>
          </div>
        </div>
      </section>

      {/* 有名な祭り */}
      <section className="py-16 bg-red-50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold mb-10 text-center">
            日本の三大祭り
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg overflow-hidden shadow-md">
              <div className="h-48 bg-slate-200 relative flex items-center justify-center">
                <span className="text-slate-500">祇園祭</span>
                {/* <Image
                  src="/images/gion-matsuri.jpg"
                  alt="祇園祭"
                  fill
                  style={{ objectFit: "cover" }}
                /> */}
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">祇園祭（京都）</h3>
                <p className="text-gray-600 mb-4">
                  7月に京都で開催される日本最大の祭りの一つ。
                  豪華絢爛な山鉾巡行が有名で、1か月にわたり様々な行事が行われます。
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg overflow-hidden shadow-md">
              <div className="h-48 bg-slate-200 relative flex items-center justify-center">
                <span className="text-slate-500">天神祭</span>
                {/* <Image
                  src="/images/tenjin-matsuri.jpg"
                  alt="天神祭"
                  fill
                  style={{ objectFit: "cover" }}
                /> */}
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">天神祭（大阪）</h3>
                <p className="text-gray-600 mb-4">
                  7月24日、25日に大阪で開催される日本三大祭りの一つ。
                  船渡御と呼ばれる川を使った神輿渡御や花火大会が特徴です。
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg overflow-hidden shadow-md">
              <div className="h-48 bg-slate-200 relative flex items-center justify-center">
                <span className="text-slate-500">神田祭</span>
                {/* <Image
                  src="/images/kanda-matsuri.jpg"
                  alt="神田祭"
                  fill
                  style={{ objectFit: "cover" }}
                /> */}
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">神田祭（東京）</h3>
                <p className="text-gray-600 mb-4">
                  奇数年の5月に東京で開催される日本三大祭りの一つ。
                  江戸時代から続く伝統ある祭りで、100基以上の神輿が町を練り歩きます。
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
