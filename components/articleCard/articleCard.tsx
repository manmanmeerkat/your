"use client";

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

  // --- image state ---
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageKey, setImageKey] = useState(0);

  const imageUrl = images?.[0]?.url;
  const imageAlt = images?.[0]?.altText || title;
  const hasValidImage =
    imageUrl && typeof imageUrl === "string" && imageUrl.trim() !== "";

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

  const retryImageLoad = useCallback(() => {
    setImageLoaded(false);
    setImageError(false);
    setImageKey((prev) => prev + 1);
  }, []);

  const bodyText =
    summary || (content ? content.slice(0, 120) + "..." : "No content available.");

  return (
    <Link
      href={`/articles/${slug}`}
      data-gtm="post-read"
      data-title={title}
      prefetch
      className="block h-full"
    >
      <Card
        key={id}
        className="
          h-full flex flex-col
          group
          rounded-2xl overflow-hidden
          text-[#180614]
          shadow-[0_16px_50px_rgba(0,0,0,.25)]
          ring-1 ring-white/10
          transition-all duration-300
          hover:-translate-y-[2px]
          hover:shadow-[0_22px_70px_rgba(0,0,0,.35)]
          bg-[#d8d3ce]
        "
      >
      {/* Image area */}
      <div className="w-full lg:w-full bg-[#d8d3ce]">
        {hasValidImage ? (
          <div className="relative w-full h-56 sm:h-44 lg:h-52 overflow-hidden">
            {/* skeleton */}
            {!imageLoaded && !imageError && (
              <div className="absolute inset-0 bg-gradient-to-br from-slate-200 via-slate-100 to-slate-200 animate-pulse flex items-center justify-center">
                <div className="text-slate-400 text-sm flex flex-col items-center gap-2">
                  <div className="w-6 h-6 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                  <div>Loading...</div>
                </div>
              </div>
            )}

            {/* error */}
            {imageError ? (
              <div className="absolute inset-0 bg-white/30 flex items-center justify-center">
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
            ) : (
              <Image
                key={`img-${id}-${imageKey}`}
                src={imageUrl}
                alt={imageAlt}
                fill
                className={`
                  object-cover
                  transition-all duration-500
                  ${imageLoaded ? "opacity-100" : "opacity-0"}
                  group-hover:scale-[1.04]
                `}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 200px, 33vw"
                onLoad={handleImageLoad}
                onError={handleImageError}
                unoptimized
              />
            )}
          </div>
        ) : (
          <div className="text-slate-400 w-full h-56 sm:h-44 lg:h-52 rounded-xl bg-slate-100 flex items-center justify-center">
            <div className="text-sm">No image</div>
          </div>
        )}
</div>
        {/* Content area */}
        <div className="flex-1 px-6 py-5 flex flex-col text-left">
          <span className="text-xs inline-flex w-max bg-[#2b1e1c] px-2.5 py-1 rounded-md text-[#f3f3f2] mb-3">
            {categoryLabel}
          </span>

          <h3 className="text-[1.1rem] md:text-lg font-semibold leading-snug mb-2 break-words">
            {title}
          </h3>

          <p className="text-sm md:text-[0.95rem] text-gray-700 leading-relaxed line-clamp-3 flex-1">
            {bodyText}
          </p>

          <div className="mt-5 flex justify-end">
            <Button
              className="
                rounded-full
                px-6 py-2
                bg-[#c96a5d]/90
                text-[#f3f3f2]
                backdrop-blur-sm
                shadow-sm
                hover:bg-[#f3f3f2]/90
                hover:text-[#c96a5d]
                transition-all
                duration-200
                hover:-translate-y-[1px]
                hover:shadow-md
              "
            >
              Read more
              <span className="ml-2 inline-block transition-transform duration-200 group-hover/btn:translate-x-1">
                →
              </span>
            </Button>
          </div>
        </div>
      </Card>
    </Link>
  );
}
