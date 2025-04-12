import { articleType } from "@/types/types";
import Link from "next/link";
import { Button } from "../ui/button";
import { Card } from "../ui/card";

export default function ArticleCard({ article }: { article: articleType }) {
  const { id, slug, title, category, content, summary, createdAt, images } = article;

  const categoryLabel = {
    mythology: "Mythology",
    culture: "Culture",
    festivals: "Festivals",
    customs: "Customs",
  }[category] || "Article";

  return (
    <Card key={id} className="flex flex-col md:flex-row h-full min-h-[260px] rounded-xl shadow-md overflow-hidden bg-white">
        {/* Image area */}
        <div className="md:w-2/5 min-h-[208px] bg-slate-100 flex items-center justify-center pl-2 pr-0 pt-4 md:pt-0">
            {images?.[0] ? (
            <img
                src={images[0].url}
                alt={images[0].altText || title}
                className="h-52 w-full object-cover rounded-[5px]"
            />
            ) : (
            <div className="text-slate-400 h-52 w-full flex items-center justify-center">
                No image
            </div>
            )}
        </div>

        {/* Content area */}
        <div className="md:w-3/5 p-4 flex flex-col justify-between flex-grow bg-white text-left">
        <span className="text-xs inline-flex w-auto max-w-max bg-slate-800 text-white px-2 py-0.5 rounded mb-2">
            {categoryLabel}
        </span>
            <h3 className="text-lg font-semibold mb-1">{title}</h3>
            {/* <p className="text-xs text-gray-500 mb-2">
            {new Date(createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
            })}
            </p> */}
            <p className="text-sm text-gray-700 line-clamp-3">
            {summary || content?.slice(0, 100) + "..." || "No content available."}
            </p>
            <div className="mt-4">
            <Link href={`/articles/${slug}`}>
                <Button
                size="sm"
                className="w-[120px] font-normal
                    border border-rose-700 bg-rose-700 text-white rounded-full
                    hover:bg-white hover:text-rose-700 hover:border-rose-700 hover:font-bold
                    shadow hover:shadow-lg"
                >
                Read more ≫
                </Button>
            </Link>
            </div>
        </div>
    </Card>
  );
}