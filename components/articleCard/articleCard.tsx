"use client";

//components/articleCard/articleCard.tsx
import { articleType } from "@/types/types";
import Link from "next/link";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { useState, useCallback, useEffect } from "react";
import Image from "next/image";

export default function ArticleCard({ article }: { article: articleType }) {
  const { id, slug, title, category, content, summary, images } = article;

  const categoryLabel =
    {
      mythology: "Mythology",
      culture: "Culture",
      festivals: "Festivals",
      customs: "Customs",
    }[category] || "Article";

  // 画像状態管理
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageKey, setImageKey] = useState(0);

  // 画像URL取得
  const imageUrl = images?.[0]?.url;
  const imageAlt = images?.[0]?.altText || title;
  const hasValidImage =
    imageUrl && typeof imageUrl === "string" && imageUrl.trim() !== "";

  // 記事が変更された時に状態をリセット
  useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
    setImageKey((prev) => prev + 1);
  }, [id, imageUrl]);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
    setImageError(false);
  }, []);

  const handleImageError = useCallback(() => {
    setImageError(true);
    setImageLoaded(true);
  }, []);

  // 画像読み込みの再試行
  const retryImageLoad = useCallback(() => {
    setImageLoaded(false);
    setImageError(false);
    setImageKey((prev) => prev + 1);
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
        className="flex flex-col md:flex-row h-full min-h-[260px] rounded-xl shadow-md overflow-hidden bg-[#f3f3f2]
                    transition-transform duration-300 ease-in-out hover:scale-[1.03] text-[#180614]"
      >
        {/* Image area */}
        <div
          className="w-full md:w-[220px] min-h-[208px] bg-slate-100 flex items-center justify-center 
                p-4 md:p-0 md:pl-4 md:pt-0 overflow-hidden rounded-[5px] md:rounded-none relative"
        >
          {hasValidImage ? (
            <>
              {/* スケルトンローダー */}
              {!imageLoaded && !imageError && (
                <div className="absolute inset-0 bg-gradient-to-br from-slate-200 via-slate-100 to-slate-200 animate-pulse rounded-[5px] md:rounded-none flex items-center justify-center">
                  <div className="text-slate-400 text-sm flex flex-col items-center gap-2">
                    <div className="w-6 h-6 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                    <div>Loading...</div>
                  </div>
                </div>
              )}

              {/* エラー表示 */}
              {imageError && (
                <div className="w-full h-52 bg-gradient-to-br from-slate-200 to-slate-300 rounded-[5px] md:rounded-none flex items-center justify-center">
                  <div className="text-center text-slate-500">
                    <div className="text-xs mb-2">Failed to load</div>
                    <Button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        retryImageLoad();
                      }}
                      className="text-xs px-2 py-1 bg-slate-400 text-white rounded hover:bg-slate-500 transition-colors"
                    >
                      Retry
                    </Button>
                  </div>
                </div>
              )}

              {/* 実際の画像 */}
              {!imageError && (
                <Image
                  key={`img-${id}-${imageKey}`}
                  src={imageUrl}
                  alt={imageAlt}
                  className={`w-full h-52 object-contain md:object-cover transition-opacity duration-500 ${
                    imageLoaded ? "opacity-100" : "opacity-0"
                  }`}
                  width={800}
                  height={208}
                  loading="eager"
                  decoding="async"
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                  unoptimized
                />
              )}
            </>
          ) : (
            <div className="text-slate-400 h-52 w-full flex items-center justify-center">
              <div className="text-center">
                <div className="text-sm">No image</div>
              </div>
            </div>
          )}
        </div>

        {/* Content area */}
        <div className="md:w-3/5 px-6 sm:px-16 md:px-4 py-4 flex flex-col justify-between flex-grow bg-[#f3f3f2] text-left">
          <span className="text-xs inline-flex w-auto max-w-max bg-slate-800 px-2 py-0.5 rounded mb-2 text-[#f3f3f2]">
            {categoryLabel}
          </span>
          <h3 className="text-lg font-semibold mb-1 leading-tight">{title}</h3>
          <p className="text-sm text-gray-700 line-clamp-3 flex-grow">
            {summary ||
              content?.slice(0, 100) + "..." ||
              "No content available."}
          </p>
          <div className="mt-4">
            <Button
              size="sm"
              className="w-[120px] font-normal
                        border border-[#df7163] bg-[#df7163] text-[#f3f3f2] rounded-full
                        hover:bg-[#f3f3f2] hover:text-[#df7163] hover:border-[#df7163] hover:font-bold
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
