import Link from "next/link";
import { Button } from "@/components/ui/button";
import ArticleCard from "../../articleCard/articleCard";
import { articleType } from "@/types/types";

type LatestArticlesSectionProps = {
  articles: articleType[];
};

export default function LatestArticlesSection({
  articles,
}: LatestArticlesSectionProps) {
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
      <div className="mt-20">
        <Link href="/all-articles">
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
    </>
  );
}
