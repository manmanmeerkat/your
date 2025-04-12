import Image from "next/image";
import ArticleCard from "../../components/articleCard/articleCard";
import { articleType } from "@/types/types";
import { JAPANESE_GODS } from "@/constants/constants";
import RedBubble from "@/components/redBubble/RedBubble";
import { WhiteLine } from "@/components/whiteLine/whiteLine";

async function getMythologyArticles(): Promise<{ articles: articleType[] }> {
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
    return {
      articles: Array.isArray(data.articles)
        ? data.articles.filter((a: articleType) => a.category === "mythology")
        : [],
    };
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
        <div className="absolute inset-0 z-0 opacity-40">
          <Image
            src="/images/category-top/mythology.jpg"
            alt="Japanese Mythology"
            fill
            style={{ objectFit: "cover" }}
          />
        </div>
        <div className="container mx-auto px-6 py-36 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Japanese Mythology</h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto text-left text-justify">
            Japan’s mythology weaves timeless tales of divine creation, heroic adventures, and sacred traditions. We will explore the enchanting world of Japanese mythology through stories of gods such as Amaterasu, Susanoo, and Izanagi, as recorded in the Kojiki and Nihon Shoki.
          </p>
        </div>
      </section>

      {/* 神話記事一覧 */}
      <section className="py-16 bg-slate-950">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold mb-12 text-center text-white">
            Japanese mythological stories
          </h2>

          {articles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch md:px-16">
              {articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          ) : (
            <p className="text-center text-slate-500 text-white">
              Mythology posts will be available soon.
            </p>
          )}
        </div>
      </section>

      <WhiteLine/>

      {/* 神々ギャラリー */}
      <section className="py-16 bg-slate-950">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold mb-12 text-center text-white">
            About Japanese Gods
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 text-center">
            {JAPANESE_GODS.map((god, index) => (
              <div key={index}>
                <div className="w-32 h-32 mx-auto bg-slate-200 rounded-full relative overflow-hidden">
                  <Image
                    src={god.img}
                    alt={god.name}
                    fill
                    style={{ objectFit: "cover" }}
                  />
                </div>
                <p className="mt-2 font-medium text-sm sm:text-base text-white">{god.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <WhiteLine/>

      {/* Redbubble商品紹介セクション */}
      <RedBubble/>

      <WhiteLine/>

    </div>
  );
}