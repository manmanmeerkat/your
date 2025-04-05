// app/customs/page.tsx
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

async function getCustomsArticles() {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.NODE_ENV === "development"
        ? "http://localhost:3000"
        : "https://yourwebsite.com");

    const res = await fetch(
      `${baseUrl}/api/articles?category=customs&published=true`,
      {
        cache: "no-cache",
      }
    );

    if (!res.ok) return { articles: [] };

    const data = await res.json();
    if (data.articles && Array.isArray(data.articles)) {
      data.articles = data.articles.filter(
        (article: Article) => article.category === "customs"
      );
    }

    return data;
  } catch (error) {
    console.error("Failed to fetch customs articles:", error);
    return { articles: [] };
  }
}

export default async function CustomsPage() {
  const { articles = [] } = await getCustomsArticles();

  return (
    <div>
      {/* ヘッダー */}
      <section className="relative bg-amber-900 text-white">
        <div className="absolute inset-0 z-0 opacity-30">
          {/* 背景画像を使用する場合はコメントを外す */}
          {/* <Image
            src="/images/customs-header.jpg"
            alt="日本の伝統"
            fill
            style={{ objectFit: "cover" }}
          /> */}
        </div>
        <div className="container mx-auto px-6 py-24 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">日本の伝統</h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto">
            千年以上受け継がれてきた日本の伝統工芸や技術、生活様式。
            先人の知恵と美しさが息づく日本の伝統文化を探索しましょう。
          </p>
        </div>
      </section>

      {/* 伝統記事一覧 */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold mb-12 text-center">
            受け継がれる日本の伝統
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
              伝統に関する記事はまだありません。
            </p>
          )}
        </div>
      </section>

      {/* 伝統工芸カテゴリー */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold mb-12 text-center">
            日本の伝統工芸
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6 text-center">
            {["陶芸", "織物", "漆芸", "木工", "金工", "和紙"].map(
              (craft, index) => (
                <div key={index}>
                  <div className="w-24 h-24 mx-auto bg-amber-100 rounded-full relative flex items-center justify-center">
                    <span className="text-amber-900 text-sm">{craft}</span>
                    {/* <Image
                      src={`/images/craft-${index + 1}.jpg`}
                      alt={craft}
                      fill
                      style={{ objectFit: "cover" }}
                    /> */}
                  </div>
                  <p className="mt-2 font-medium">{craft}</p>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* 伝統体験セクション */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold mb-8 text-center">
            伝統工芸を体験する
          </h2>
          <p className="text-center text-lg mb-10 max-w-2xl mx-auto">
            職人の工房を訪れ、何世代にもわたって受け継がれてきた技術を間近で見る。
            そして自分自身で伝統工芸の制作を体験してみませんか？
          </p>

          <div className="flex justify-center">
            <Button size="lg" className="px-8 bg-amber-700 hover:bg-amber-800">
              工房訪問の予約
            </Button>
          </div>
        </div>
      </section>

      {/* 伝統と現代セクション */}
      <section className="py-16 bg-amber-50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold mb-8 text-center">
            伝統と現代の融合
          </h2>
          <div className="max-w-4xl mx-auto">
            <p className="text-lg mb-6 text-center">
              日本の伝統技術は現代においても進化し続けています。
              何世紀も前から伝わる技法と現代のデザインが融合した、
              新しい日本の伝統の形をご紹介します。
            </p>
            <div className="grid md:grid-cols-2 gap-8 mt-10">
              <div className="bg-white rounded-lg p-6 shadow-md">
                <h3 className="text-xl font-semibold mb-3">伝統を守る</h3>
                <p>
                  伝統工芸の技術を次世代に伝え、継承していくための取り組みや、
                  歴史的な技法を守りながら製作されている作品をご紹介します。
                </p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-md">
                <h3 className="text-xl font-semibold mb-3">伝統を革新する</h3>
                <p>
                  伝統的な技術をベースに、現代のニーズに合わせて発展させた
                  革新的な製品や、国際的に評価されている日本の職人技をご紹介します。
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
