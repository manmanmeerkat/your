"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import ArticleCard from "../../articleCard/articleCard";
import { articleType } from "@/types/types";
import { useState } from "react";
import { SectionTitle } from "@/components/sectionTitle/SectionTitle";

type LatestArticlesSectionProps = {
  articles: articleType[];
};

export default function LatestArticlesSection({
  articles,
}: LatestArticlesSectionProps) {
  const [isNavigating, setIsNavigating] = useState(false);

  return (
    <section id="latest-articles">
      <div className="container mx-auto max-w-6xl">
        {/* Title block */}
        <div className="text-center mb-10">
          <SectionTitle>Latest Articles</SectionTitle>

          <p className="mt-4 text-sm md:text-base text-[#f3f3f2]/70">
            Fresh stories—myths, culture, festivals, and everyday customs.
          </p>
        </div>

        {/* Grid */}
        {articles.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {articles.map((a) => (
            <ArticleCard key={a.id} article={a} />
          ))}
        </div>
        ) : (
          <p className="text-center text-white/70">No posts yet.</p>
        )}

        {/* CTA */}
        <div className="mt-16 flex justify-center">
          <Link
            href="/all-articles"
            prefetch
            onClick={() => setIsNavigating(true)}
          >
            <Button
              size="lg"
              disabled={isNavigating}
              className="
                min-w-[240px] h-12
                flex items-center justify-center
                leading-none font-semibold tracking-wide
                border border-[#c96a5d] bg-[#c96a5d] text-[#f3f3f2]
                hover:brightness-110 hover:-translate-y-[1px]
                transition-all duration-200
                shadow-md hover:shadow-lg
                disabled:opacity-70 disabled:cursor-not-allowed
                group
              "
            >
              {isNavigating ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
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
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  <span>Loading...</span>
                </span>
              ) : (
                <>
                  View all Articles
                  <span className="ml-2 inline-block transition-transform duration-200 group-hover:translate-x-1">
                    →
                  </span>
                </>
              )}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
