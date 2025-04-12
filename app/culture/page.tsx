import Image from "next/image";
import { articleType } from "@/types/types";
import ArticleCard from "../../components/articleCard/articleCard"; 
import { CULTURE_CATEGORIES } from "@/constants/constants";
import RedBubble from "@/components/redBubble/RedBubble";
import { WhiteLine } from "@/components/whiteLine/whiteLine";

async function getCultureArticles(): Promise<{ articles: articleType[] }> {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.NODE_ENV === "development"
        ? "http://localhost:3000"
        : "https://yourwebsite.com");

    const res = await fetch(
      `${baseUrl}/api/articles?category=culture&published=true`,
      { cache: "no-cache" }
    );

    if (!res.ok) return { articles: [] };

    const data = await res.json();
    return {
      articles: Array.isArray(data.articles)
        ? data.articles.filter((a: articleType) => a.category === "culture")
        : [],
    };
  } catch (error) {
    console.error("Failed to fetch culture articles:", error);
    return { articles: [] };
  }
}

export default async function CulturePage() {
  const { articles = [] } = await getCultureArticles();

  return (
    <div>
      {/* ヘッダー */}
      <section className="relative bg-slate-900 text-white pb-8">
        <div className="absolute inset-0 z-0 opacity-40">
          <Image
            src="/images/category-top/culture.jpg"
            alt="Japanese Culture"
            fill
            style={{ objectFit: "cover" }}
          />
        </div>
        <div className="container mx-auto px-6 py-36 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Japanese Culture</h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto text-left text-justify">
            Japan has cultivated a rich cultural heritage for over a thousand years, blending refined traditions, craftsmanship, and everyday practices. We will explore the depth and beauty of Japanese culture through arts such as the tea ceremony, ceramics, kimono, and ukiyo-e.
          </p>
        </div>
      </section>

      {/* 文化記事一覧 */}
      <section className="py-16 bg-slate-950">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold mb-12 text-center text-white">
            The charm of Japanese culture
          </h2>

          {articles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:px-16">
              {articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          ) : (
            <p className="text-center text-slate-500 text-white">
              Culture posts will be available soon.
            </p>
          )}
        </div>
      </section>

      <WhiteLine/>

      {/* 文化カテゴリー */}
      <section className="py-16 bg-slate-950">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold mb-12 text-center text-white">
            Japanese Culture Category
          </h2>
          <div
            className="
              grid 
              gap-6 
              grid-cols-[repeat(auto-fit,minmax(8rem,1fr))]
              justify-items-center
            "
          >
            {CULTURE_CATEGORIES.map((category, index) => (
              <div key={index} className="text-center">
                <div className="w-32 h-32 bg-indigo-100 rounded-full relative overflow-hidden mx-auto">
                  <Image
                    src={category.img}
                    alt={category.name}
                    fill
                    style={{ objectFit: "cover" }}
                  />
                </div>
                <p className="mt-2 font-medium text-white">{category.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <WhiteLine/>

       {/* Redbubble商品紹介セクション */}
       <RedBubble/>

      <WhiteLine/>

      {/* 文化体験セクション */}
      {/* <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold mb-8 text-center">文化体験を探す</h2>
          <p className="text-center text-lg mb-10 max-w-2xl mx-auto">
            日本滞在中に伝統文化を体験してみませんか？茶道、着物着付け、和食作りなど、
            さまざまな日本文化体験があなたを待っています。
          </p>
          <div className="flex justify-center">
            <Button size="lg" className="px-8">
              体験を探す
            </Button>
          </div>
        </div>
      </section> */}
    </div>
  );
}
