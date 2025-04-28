// components/top/latestArticles/LatestArticlesSection.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import ArticleCard from "@/components/articleCard/articleCard";
import { articleType } from "@/types/types";

interface LatestArticlesSectionProps {
  articles: articleType[];
}

export default function LatestArticlesSection({
  articles,
}: LatestArticlesSectionProps) {
  return (
    <section id="latest-articles" className="py-16 md:px-16 bg-slate-950">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-12 text-white">Latest Posts</h2>
        {articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <p className="text-slate-500 text-white">No posts yet.</p>
        )}
        <div className="mt-20">
          <Link href="/all-articles" prefetch={false}>
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
  );
}
