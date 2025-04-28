import { articleType } from "@/types/types";
import Link from "next/link";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import Image from "next/image";
import { memo } from "react";

// カテゴリーマッピングを定数として外部に定義
const CATEGORY_LABELS: { [key: string]: string } = {
  mythology: "Mythology",
  culture: "Culture",
  festivals: "Festivals",
  customs: "Customs",
};

function ArticleCard({ article }: { article: articleType }) {
  const { id, slug, title, category, content, summary, images } = article;

  // カテゴリーラベルの取得を最適化
  const categoryLabel = CATEGORY_LABELS[category] || "Article";

  // 最初の画像を取得
  const firstImage = images?.[0];

  return (
    <Link href={`/articles/${slug}`} data-gtm="post-read" data-title={title}>
      <Card
        key={id}
        className="flex flex-col md:flex-row h-full min-h-[260px] rounded-xl shadow-md overflow-hidden bg-white 
                  transition-transform duration-300 ease-in-out hover:scale-[1.03]"
      >
        {/* Image area */}
        <div
          className="w-full md:w-[220px] min-h-[208px] bg-slate-100 flex items-center justify-center 
              p-4 md:p-0 md:pl-4 md:pt-0 overflow-hidden rounded-[5px] md:rounded-none"
        >
          {firstImage ? (
            <Image
              src={firstImage.url}
              alt={firstImage.altText || title}
              width={300}
              height={230}
              loading="lazy"
              sizes="(max-width: 768px) 100vw, 300px"
              className="w-full h-52 object-contain md:object-cover"
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
          <p className="text-sm text-gray-700 line-clamp-3">
            {summary ||
              (content && `${content.slice(0, 100)}...`) ||
              "No content available."}
          </p>
          <div className="mt-4">
            <Button
              size="sm"
              className="w-[120px] font-normal
                  border border-rose-700 bg-rose-700 text-white rounded-full
                  hover:bg-white hover:text-rose-700 hover:border-rose-700 hover:font-bold
                  shadow hover:shadow-lg"
            >
              Read more ≫
            </Button>
          </div>
        </div>
      </Card>
    </Link>
  );
}

// コンポーネントをメモ化して不要な再レンダリングを防止
export default memo(ArticleCard);
