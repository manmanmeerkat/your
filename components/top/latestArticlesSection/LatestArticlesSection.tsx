"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import ArticleCard from "../../articleCard/articleCard";
import { articleType } from "@/types/types";
import { useState } from "react";

type LatestArticlesSectionProps = {
  articles: articleType[];
};

export default function LatestArticlesSection({
  articles,
}: LatestArticlesSectionProps) {
  const [isNavigating, setIsNavigating] = useState(false);

  const handleNavigation = () => {
    setIsNavigating(true);
  };

  return (
    <>
      <h2 className="text-3xl font-bold mb-12 text-white">Latest Posts</h2>
      {articles.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((a) => (
            <ArticleCard key={a.id} article={a} />
          ))}
        </div>
      ) : (
        <p className="text-slate-500 text-white">No posts yet.</p>
      )}
      <div className="mt-20 text-center">
        <Link href="/all-articles" prefetch={true} onClick={handleNavigation}>
          <Button
            size="lg"
            disabled={isNavigating}
            className="w-[220px] font-normal
                      border border-rose-700 bg-rose-700 text-white
                      hover:bg-white hover:text-rose-700 hover:border-rose-700 hover:font-bold
                      shadow hover:shadow-lg
                      disabled:opacity-70 disabled:cursor-not-allowed
                      transition-all duration-200
                      transform hover:scale-105"
          >
            {isNavigating ? (
              <div className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-4 w-4 flex-shrink-0"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Loading...</span>
              </div>
            ) : (
              "View all posts ≫"
            )}
          </Button>
        </Link>
      </div>
    </>
  );
}
