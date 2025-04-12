// app/festivals/page.tsx
import Image from "next/image";
import { SEASONAL_FESTIVALS } from "@/constants/constants";
import ArticleCard from "../../components/articleCard/articleCard";
import { articleType } from "@/types/types";
import { THREE_BIG_FESTIVALS } from "@/constants/constants";
import { WhiteLine } from "@/components/whiteLine/whiteLine";
import RedBubble from "@/components/redBubble/RedBubble";

async function getFestivalArticles() {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.NODE_ENV === "development"
        ? "http://localhost:3000"
        : "https://yourwebsite.com");

    const res = await fetch(
      `${baseUrl}/api/articles?category=festivals&published=true`,
      { cache: "no-cache" }
    );

    if (!res.ok) return { articles: [] };

    const data = await res.json();
    if (data.articles && Array.isArray(data.articles)) {
      data.articles = data.articles.filter(
        (article: articleType) => article.category === "festivals"
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
      <section className="relative bg-slate-900 text-white pt-16 pb-16">
        <div className="absolute inset-0 z-0 opacity-40">
          <Image
            src="/images/category-top/festival.jpg"
            alt="Japanese Festivals"
            fill
            style={{ objectFit: "cover" }}
          />
        </div>
        <div className="container mx-auto px-6 py-24 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Japanese Festivals</h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto text-left text-justify">
            Japan’s festivals reflect the beauty of the changing seasons and the spirit of each region. We will explore the vibrant world of Japanese festivals through traditional celebrations, local customs, and cultural events.
          </p>
        </div>
      </section>

      {/* 記事一覧 */}
      <section className="py-16 bg-slate-950">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold mb-12 text-center text-white">
            Festivals around Japan
          </h2>

          {articles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:px-16">
              {articles.map((article: articleType) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          ) : (
            <p className="text-center text-slate-500 text-white">
              Festivals posts will be available soon.
            </p>
          )}
        </div>
      </section>

      <WhiteLine/>

      {/* 四季の祭り */}
      <section className="py-16 bg-slate-950">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold mb-12 text-center text-white">Seasonal Festivals</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {SEASONAL_FESTIVALS.map((item, index) => (
              <div key={index} className="text-center">
                <div
                  className="w-32 h-32 mx-auto rounded-full relative flex items-center justify-center overflow-hidden">
                  <Image
                    src={item.img}
                    alt={`${item.season} icon`}
                    fill
                    style={{ objectFit: "cover" }}
                  />
                </div>
                <h3 className="mt-4 font-bold text-xl text-white">{item.label}</h3>
                <p className="mt-2 text-white">
                  {item.example1}<br/>
                  {item.example2}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <WhiteLine/>

      {/* 祭りカレンダー */}
      {/* <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold mb-8 text-center">祭りカレンダー</h2>
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
      </section> */}

      {/* 日本三大祭り */}
      
      <section className="py-16 bg-slate-950 md:px-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold mb-10 text-center text-white">
            Japan's Three Biggest Festivals
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {THREE_BIG_FESTIVALS.map((festival, idx) => (
              <div key={idx} className="bg-white rounded-lg overflow-hidden shadow-md">
                <div className="h-48 bg-slate-200 relative">
                  <Image
                    src={festival.img}
                    alt={festival.alt}
                    fill
                    style={{ objectFit: "cover" }}
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">{festival.title}</h3>
                  <p className="text-gray-600 mb-4">{festival.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <WhiteLine/>

      <RedBubble/>

      <WhiteLine/>

    </div>
  );
}