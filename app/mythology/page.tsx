// app/mythology/page.tsx
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

async function getMythologyArticles() {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.NODE_ENV === "development"
        ? "http://localhost:3000"
        : "https://yourwebsite.com");

    const res = await fetch(
      `${baseUrl}/api/articles?category=mythology&published=true`,
      {
        cache: "no-cache",
      }
    );

    if (!res.ok) return { articles: [] };

    const data = await res.json();
    if (data.articles && Array.isArray(data.articles)) {
      data.articles = data.articles.filter(
        (article: Article) => article.category === "mythology"
      );
    }

    return data;
  } catch (error) {
    console.error("Failed to fetch mythology articles:", error);
    return { articles: [] };
  }
}

export default async function MythologyPage() {
  const { articles = [] } = await getMythologyArticles();

  return (
    <div>
      {/* ヘッダー */}
      <section className="relative bg-slate-900 text-white">
        <div className="absolute inset-0 z-0 opacity-30">
          {/* 背景画像を使用する場合はコメントを外す */}
          {/* <Image
            src="/images/mythology-header.jpg"
            alt="日本神話"
            fill
            style={{ objectFit: "cover" }}
          /> */}
        </div>
        <div className="container mx-auto px-6 py-24 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">日本神話</h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto">
            古事記や日本書紀に記された天地創造や神々の冒険。
            日本の神話の世界を旅しましょう。
          </p>
        </div>
      </section>

      {/* 神話記事一覧 */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold mb-12 text-center">
            日本神話の物語
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
              神話に関する記事はまだありません。
            </p>
          )}
        </div>
      </section>

      {/* 神々ギャラリー */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold mb-12 text-center">
            日本神話の神々
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6 text-center">
            {[
              "イザナギ",
              "イザナミ",
              "天照大神",
              "スサノオ",
              "ツクヨミ",
              "大国主",
            ].map((god, index) => (
              <div key={index}>
                <div className="w-24 h-24 mx-auto bg-slate-200 rounded-full relative flex items-center justify-center">
                  <span className="text-slate-500 text-sm">{god}</span>
                  {/* <Image
                      src={`/images/god-${index + 1}.jpg`}
                      alt={god}
                      fill
                      style={{ objectFit: "cover" }}
                    /> */}
                </div>
                <p className="mt-2 font-medium">{god}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
