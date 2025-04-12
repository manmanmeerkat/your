"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Slider from "../components/top/slider/Slider";
import ArticleCard from "../components/articleCard/articleCard";
import CategoryCard from "../components/top/categoryCard/categoryCard";
import { articleType } from "@/types/types";
import { CATEGORY_ITEMS } from "@/constants/constants";
import { GetInTouch } from "@/components/getInTouch/GetInTouch";

export default function Home() {
  const [articles, setArticles] = useState<articleType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const baseUrl =
          process.env.NEXT_PUBLIC_SITE_URL ||
          (process.env.NODE_ENV === "development"
            ? "http://localhost:3000"
            : "https://yourwebsite.com");

        const res = await fetch(`${baseUrl}/api/articles?published=true`, {
          cache: "no-cache",
        });

        const data = await res.json();
        const sorted = [...(data.articles || [])]
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 6);

        setArticles(sorted);
      } catch (e) {
        console.error("記事取得エラー:", e);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div className="bg-slate-900 scroll-smooth">
      {/* Hero セクション */}
      <section className="relative bg-slate-900 text-white md:px-16">
        <div className="absolute inset-0 z-0">
          <Slider />
        </div>
        <div className="relative z-10 container mx-auto px-4 py-40">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-lg">
            Explore Japan's hidden charms
          </h1>
          <p className="text-xl mb-8 drop-shadow-md">
            Ancient myths, seasonal festivals, and rich traditional culture.<br></br>
            We will introduce you to a side of Japan you may not have known before.
          </p>
          <div className="flex gap-4 flex-wrap">
            <Link href="#categories" scroll={true}>
              <Button
                size="lg"
                className="w-[260px] font-normal
                          border border-rose-700 bg-rose-700 text-white
                          hover:bg-white hover:text-rose-700 hover:border-rose-700 hover:font-bold
                          shadow hover:shadow-lg"
              >
                Explore Categories ≫
              </Button>
            </Link>
            <Link href="#latest-articles" scroll={true}>
              <Button
                size="lg"
                variant="outline"
                className="font-normal w-[220px] text-center
                          border-white text-white
                          hover:bg-white hover:text-black hover:font-bold"
              >
                Latest Articles ≫
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* カテゴリーセクション */}
      <section id="categories" className="py-16 bg-slate-950">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center text-white">Categories to Explore</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:px-16">
            {CATEGORY_ITEMS.map((item) => (
              <CategoryCard
                key={item.href}
                href={item.href}
                title={item.title}
                image={item.img}
                description={item.description}
              />
            ))}
          </div>
        </div>
      </section>

      <div className="container mx-auto px-8 bg-slate-900">
        <hr className="border-t border-white opacity-60 my-0.1" />
      </div>

      {/* 最新記事セクション */}
      <section id="latest-articles" className="py-16 md:px-16 bg-slate-950">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-12 text-white">Latest Posts</h2>
          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
            </div>
          ) : articles.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((a) => (
                <ArticleCard key={a.id} article={a} />
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-white">No posts yet.</p>
          )}
          <div className="mt-20">
            <Link href="/articles">
              <Button
                size="lg"
                className="w-[220px] font-normal
                          border border-rose-700 bg-rose-700 text-white
                          hover:bg-white hover:text-rose-700 hover:border-rose-700 hover:font-bold
                          shadow hover:shadow-lg"
              >
                View all posts ≫
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-8 bg-slate-900">
        <hr className="border-t border-white opacity-60 my-0.1" />
      </div>

      {/* お問い合わせ */}
      <GetInTouch/>

      <div className="container mx-auto px-8 bg-slate-900">
        <hr className="border-t border-white opacity-60 my-0.1" />
      </div>
    </div>
  );
}