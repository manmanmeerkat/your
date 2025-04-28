import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { categoryItemType } from "@/types/types";
import { memo } from "react";

function CategoryCard({ href, title, img, description }: categoryItemType) {
  return (
    <Link href={href} className="block group h-full">
      <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform group-hover:scale-105 flex flex-col h-full p-4 pt-6">
        <div className="relative flex items-center justify-center">
          <Image
            src={img}
            alt={title}
            width={350}
            height={194}
            loading="lazy"
            sizes="(max-width: 768px) 100vw, 350px"
            className="rounded-md"
          />
        </div>
        <div className="mt-4 text-center md:text-left flex-grow">
          <h3 className="text-xl font-bold mb-2">{title}</h3>
          <p className="text-slate-600">{description}</p>
        </div>
        <div className="mt-4">
          <Button
            size="sm"
            className="w-[160px] font-normal
              border border-rose-700 bg-rose-700 text-white rounded-full
              hover:bg-white hover:text-rose-700 hover:border-rose-700 hover:font-bold
              shadow hover:shadow-lg"
          >
            Explore more ≫
          </Button>
        </div>
      </div>
    </Link>
  );
}

// コンポーネントをメモ化して再レンダリングを最適化
export default memo(CategoryCard);
