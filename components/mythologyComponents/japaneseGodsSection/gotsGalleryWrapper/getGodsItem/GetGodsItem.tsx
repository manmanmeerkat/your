import Image from "next/image";
import { useCallback } from "react";
import { GodData } from "@/types/types";
import Link from "next/link";

export const GetGodsItem = ({
  god,
  slug,
  isMobile = false,
}: {
  god: GodData;
  slug: string;
  isMobile?: boolean;
}) => {
  // クリック時に正確なスクロール位置を記録（デバッグ付き）
  const handleGodClick = useCallback(() => {
    // 複数の方法でスクロール位置を取得
    const scrollY1 = window.pageYOffset;
    const scrollY2 = document.documentElement.scrollTop;
    const scrollY3 = document.body.scrollTop;
    const finalScrollY = scrollY1 || scrollY2 || scrollY3;

    // 神々セクションの位置も記録
    const godsSection = document.getElementById("about-japanese-gods");
    let godsSectionTop = 0;
    if (godsSection) {
      godsSectionTop = godsSection.getBoundingClientRect().top + finalScrollY;
    }

    const returnData = {
      url: window.location.pathname + window.location.search,
      exactScrollY: finalScrollY,
      godsSectionTop: godsSectionTop,
      sectionId: "about-japanese-gods",
      timestamp: Date.now(),
      debug: {
        scrollY1,
        scrollY2,
        scrollY3,
        windowInnerHeight: window.innerHeight,
        documentHeight: document.documentElement.scrollHeight,
      },
    };

    sessionStorage.setItem("gods-return-data", JSON.stringify(returnData));

    console.log("神々クリック - 詳細位置保存:", returnData);
  }, []);

  return (
    <Link
      href={`/category-item/${slug}`}
      prefetch={true}
      onClick={handleGodClick}
      className={`
        group flex-shrink-0 transition-transform duration-200 hover:scale-105
        ${isMobile ? "w-36 flex flex-col items-center" : "w-36 flex flex-col items-center"}
      `}
    >
      <div className="w-32 h-32 bg-slate-200 rounded-full relative overflow-hidden">
        <Image
          src={god.img}
          alt={god.name}
          fill
          sizes="(max-width: 768px) 128px, 128px"
          style={{ objectFit: "cover" }}
          className="group-hover:scale-110 transition-transform duration-300"
          priority={false}
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD..."
        />
      </div>

      <p
        className={`
          mt-2 text-sm text-white group-hover:underline leading-tight text-center
          line-clamp-2 min-h-[2.5rem]
        `}
      >
        {god.name}
      </p>
    </Link>
  );
};