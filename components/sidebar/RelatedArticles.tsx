// components/sidebar/RelatedArticles.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { articleType } from "@/types/types";

interface RelatedArticlesProps {
  currentCategory: string;
  currentArticleId: string;
}

const CATEGORY_LABELS = {
  mythology: "Mythology",
  culture: "Culture",
  festivals: "Festivals",
  customs: "Customs",
} as const;

export default function RelatedArticles({
  currentCategory,
  currentArticleId,
}: RelatedArticlesProps) {
  const [relatedArticles, setRelatedArticles] = useState<articleType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRelatedArticles = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/articles?category=${currentCategory}&published=true&pageSize=20`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch related articles");
        }

        const data = await response.json();

        const filteredArticles = data.articles.filter(
          (article: articleType) => article.id !== currentArticleId
        );

        const shuffled = [...filteredArticles].sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, 3);

        setRelatedArticles(selected);
      } catch (err) {
        console.error("Error fetching related articles:", err);
        setError("Failed to load related articles");
      } finally {
        setLoading(false);
      }
    };

    if (currentCategory && currentArticleId) {
      fetchRelatedArticles();
    }
  }, [currentCategory, currentArticleId]);

  if (loading) {
    return (
      <div className="w-full bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="p-6">
          <h3 className="text-xl font-bold mb-6 text-center text-orange-400 pb-3 border-b border-slate-700">
            More Japanese{" "}
            {CATEGORY_LABELS[currentCategory as keyof typeof CATEGORY_LABELS]}
          </h3>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="animate-pulse flex gap-4 p-3 bg-slate-700/50 rounded-lg"
              >
                <div className="bg-slate-600 w-20 h-20 rounded-lg flex-shrink-0"></div>
                <div className="flex-1 space-y-3 py-2">
                  <div className="bg-slate-600 h-4 rounded w-3/4"></div>
                  <div className="bg-slate-600 h-3 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || relatedArticles.length === 0) {
    return null;
  }

  return (
    <div className="w-full bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-xl">
      <div className="p-6">
        <h3 className="text-xl font-bold mb-6 text-center text-orange-400 pb-3 border-b border-slate-700">
          More Japanese{" "}
          {CATEGORY_LABELS[currentCategory as keyof typeof CATEGORY_LABELS]}
        </h3>

        <div className="space-y-4">
          {relatedArticles.map((article) => (
            <RelatedArticleCard key={article.id} article={article} />
          ))}
        </div>

        <div className="mt-8 pt-6 border-t border-slate-700 text-center">
          <Link
            href={`/${currentCategory}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            View All{" "}
            {CATEGORY_LABELS[currentCategory as keyof typeof CATEGORY_LABELS]}
            <span className="text-lg">≫</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

function RelatedArticleCard({ article }: { article: articleType }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const imageUrl = article.images?.[0]?.url;
  const imageAlt = article.images?.[0]?.altText || article.title;
  const hasValidImage =
    imageUrl && typeof imageUrl === "string" && imageUrl.trim() !== "";

  return (
    <Link href={`/articles/${article.slug}`} className="block group">
      <div className="flex gap-4 p-3 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-all duration-300 border border-slate-600/50 hover:border-orange-500/50 hover:shadow-lg">
        {/* 画像エリア - 余白修正 */}
        <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-slate-600 relative border border-slate-500">
          {hasValidImage ? (
            <>
              {!imageLoaded && !imageError && (
                <div className="absolute inset-0 bg-slate-600 animate-pulse flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-orange-400/30 border-t-orange-400 rounded-full animate-spin"></div>
                </div>
              )}

              {imageError && (
                <div className="w-full h-full bg-slate-600 flex items-center justify-center">
                  <div className="text-slate-400 text-sm">🖼️</div>
                </div>
              )}

              {!imageError && (
                <Image
                  src={imageUrl}
                  alt={imageAlt}
                  width={80}
                  height={80}
                  className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-110 ${
                    imageLoaded ? "opacity-100" : "opacity-0"
                  }`}
                  style={{ margin: 0, padding: 0 }}
                  onLoad={() => setImageLoaded(true)}
                  onError={() => setImageError(true)}
                  unoptimized
                />
              )}
            </>
          ) : (
            <div className="w-full h-full bg-slate-600 flex items-center justify-center">
              <div className="text-slate-400 text-sm">🖼️</div>
            </div>
          )}
        </div>

        {/* コンテンツエリア */}
        <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
          <h4 className="font-semibold text-slate-100 group-hover:text-orange-300 transition-colors duration-200 leading-tight mb-3 line-clamp-2">
            {article.title}
          </h4>

          <div className="inline-flex items-center gap-2 text-sm font-medium text-orange-400 group-hover:text-orange-300 transition-all duration-200">
            <span>Read more</span>
            <span className="transform group-hover:translate-x-1 transition-transform duration-200">
              ≫
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
