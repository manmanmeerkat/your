"use client";

//components/articleCard/articleCard.tsx
import { articleType } from "@/types/types";
import Link from "next/link";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { useState, useRef, useEffect, useCallback } from "react";

export default function ArticleCard({ article }: { article: articleType }) {
  const { id, slug, title, category, content, summary, images } = article;

  const categoryLabel =
    {
      mythology: "Mythology",
      culture: "Culture",
      festivals: "Festivals",
      customs: "Customs",
    }[category] || "Article";

  // ⭐ 高パフォーマンス画像状態管理
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgContainerRef = useRef<HTMLDivElement>(null);

  // ⭐ Intersection Observer for lazy loading (SSR対応)
  useEffect(() => {
    // ⭐ ブラウザ環境チェック
    if (typeof window === "undefined" || !imgContainerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: "100px", // 100px手前で読み込み開始
        threshold: 0.1,
      }
    );

    const currentRef = imgContainerRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
      observer.disconnect();
    };
  }, []);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  const handleImageError = useCallback(() => {
    setImageError(true);
    setImageLoaded(true);
  }, []);

  return (
    <Link
      href={`/articles/${slug}`}
      data-gtm="post-read"
      data-title={title}
      prefetch={true}
    >
      <Card
        key={id}
        className="flex flex-col md:flex-row h-full min-h-[260px] rounded-xl shadow-md overflow-hidden bg-white 
                        transition-transform duration-300 ease-in-out hover:scale-[1.03]"
      >
        {/* ⭐ Image area - 高パフォーマンス版 */}
        <div
          ref={imgContainerRef}
          className="w-full md:w-[220px] min-h-[208px] bg-slate-100 flex items-center justify-center 
                p-4 md:p-0 md:pl-4 md:pt-0 overflow-hidden rounded-[5px] md:rounded-none relative"
        >
          {images?.[0] ? (
            <>
              {/* ⭐ スケルトンローダー */}
              {!imageLoaded && (
                <div className="absolute inset-0 bg-gradient-to-br from-slate-200 via-slate-100 to-slate-200 animate-pulse rounded-[5px] md:rounded-none flex items-center justify-center">
                  <div className="text-slate-400">
                    <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="3"
                        fill="none"
                        strokeDasharray="24"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                </div>
              )}

              {/* ⭐ エラー表示 */}
              {imageError && (
                <div className="w-full h-52 bg-gradient-to-br from-slate-200 to-slate-300 rounded-[5px] md:rounded-none flex items-center justify-center">
                  <div className="text-center text-slate-500">
                    <div className="text-2xl mb-1">📷</div>
                    <div className="text-xs">No image</div>
                  </div>
                </div>
              )}

              {/* ⭐ 実際の画像（unoptimized + 高パフォーマンス） */}
              {isInView && !imageError && (
                <img
                  src={images[0].url}
                  alt={images[0].altText || title}
                  className={`w-full h-52 object-contain md:object-cover transition-opacity duration-500 ${
                    imageLoaded ? "opacity-100" : "opacity-0"
                  }`}
                  loading="lazy"
                  decoding="async"
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                  style={{
                    maxWidth: "100%",
                    height: "208px",
                    objectFit: "cover",
                  }}
                />
              )}
            </>
          ) : (
            <div className="text-slate-400 h-52 w-full flex items-center justify-center">
              <div className="text-center">
                <div className="text-3xl mb-2">📷</div>
                <div className="text-sm">No image</div>
              </div>
            </div>
          )}
        </div>

        {/* Content area */}
        <div className="md:w-3/5 p-4 flex flex-col justify-between flex-grow bg-white text-left">
          <span className="text-xs inline-flex w-auto max-w-max bg-slate-800 text-white px-2 py-0.5 rounded mb-2">
            {categoryLabel}
          </span>
          <h3 className="text-lg font-semibold mb-1 line-clamp-2">{title}</h3>
          <p className="text-sm text-gray-700 line-clamp-3 flex-grow">
            {summary ||
              content?.slice(0, 100) + "..." ||
              "No content available."}
          </p>
          <div className="mt-4">
            <Button
              size="sm"
              className="w-[120px] font-normal
                        border border-rose-700 bg-rose-700 text-white rounded-full
                        hover:bg-white hover:text-rose-700 hover:border-rose-700 hover:font-bold
                        shadow hover:shadow-lg transition-all duration-300"
            >
              Read more ≫
            </Button>
          </div>
        </div>
      </Card>
    </Link>
  );
}
