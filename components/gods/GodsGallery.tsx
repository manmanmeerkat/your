// components/gods/GodsGallery.tsx - 戻り先記録機能付き（Button修正版）
"use client";

import { useState, useMemo, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";

interface GodData {
  name: string;
  img: string;
  gender: "male" | "female";
}

interface GodsGalleryProps {
  gods: GodData[];
  slugMap: Record<string, string>;
}

const TABS = [
  { label: "All", value: "all" },
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
] as const;

// 🎯 神のアイテムコンポーネント（戻り先記録機能付き）
const GodItem = ({
  god,
  slug,
  isMobile = false,
}: {
  god: GodData;
  slug: string;
  isMobile?: boolean;
}) => {
  // 🚀 クリック時に正確なスクロール位置を記録（デバッグ付き）
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
      className={`
        group transition-transform duration-200 hover:scale-105
        ${
          isMobile
            ? "inline-block flex-shrink-0 text-left"
            : "w-36 flex flex-col items-center justify-start"
        }
      `}
      prefetch={true}
      onClick={handleGodClick} // 🎯 クリック時に戻り先を記録
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
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkbHB0eH/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/2gAMAwEAAhEDEQA/AKrAAAAAAAAAAAAAAAAA//2Q=="
          unoptimized={false}
        />
      </div>
      <p
        className={`
        mt-2 text-sm text-white group-hover:underline leading-tight
        ${isMobile ? "text-left" : "text-center"}
      `}
      >
        {god.name}
      </p>
    </Link>
  );
};

// デスクトップグリッドコンポーネント
const DesktopGrid = ({
  gods,
  slugMap,
}: {
  gods: GodData[];
  slugMap: Record<string, string>;
}) => {
  const getGodSlug = useCallback(
    (name: string): string => {
      if (slugMap[name]) {
        return slugMap[name];
      }
      return name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
    },
    [slugMap]
  );

  return (
    <div className="hidden lg:grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 justify-items-center text-center">
      {gods.map((god, index) => {
        const slug = getGodSlug(god.name);
        return (
          <GodItem
            key={`${god.name}-${index}`}
            god={god}
            slug={slug}
            isMobile={false}
          />
        );
      })}
    </div>
  );
};

// モバイル横スクロールコンポーネント
const MobileScroll = ({
  gods,
  slugMap,
}: {
  gods: GodData[];
  slugMap: Record<string, string>;
}) => {
  const getGodSlug = useCallback(
    (name: string): string => {
      if (slugMap[name]) {
        return slugMap[name];
      }
      return name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
    },
    [slugMap]
  );

  return (
    <div className="lg:hidden overflow-x-auto whitespace-nowrap px-4 scrollbar-custom">
      <div className="inline-flex gap-8">
        {gods.map((god, index) => {
          const slug = getGodSlug(god.name);
          return (
            <GodItem
              key={`mobile-${god.name}-${index}`}
              god={god}
              slug={slug}
              isMobile={true}
            />
          );
        })}
      </div>
    </div>
  );
};

export default function GodsGallery({ gods, slugMap }: GodsGalleryProps) {
  const [activeTab, setActiveTab] = useState<"all" | "male" | "female">("all");

  // フィルタリングをメモ化
  const filteredGods = useMemo(() => {
    return activeTab === "all"
      ? gods
      : gods.filter((god) => god.gender === activeTab);
  }, [gods, activeTab]);

  // タブ変更をメモ化
  const handleTabChange = useCallback((tabValue: "all" | "male" | "female") => {
    setActiveTab(tabValue);
  }, []);

  if (!gods || gods.length === 0) {
    return (
      <div className="text-center text-white">
        <p>神々のデータが見つかりません</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* タブボタン - ネイティブbutton使用 */}
      <div className="flex justify-center gap-4 mb-6">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleTabChange(tab.value)}
            className={`
              w-20 h-10 font-normal rounded-full text-sm 
              transition-all duration-200 border shadow-sm
              ${
                activeTab === tab.value
                  ? "bg-[#f3f3f2] text-[#df7163] border-[#df7163] font-bold shadow-md"
                  : "bg-[#df7163] text-[#f3f3f2] border-[#df7163]"
              }
              hover:bg-[#f3f3f2] hover:text-[#df7163] hover:border-[#df7163] 
              hover:shadow-lg hover:font-bold hover:scale-105 active:scale-95
            `}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* コンテンツ表示 */}
      {filteredGods.length > 0 ? (
        <>
          {/* デスクトップ表示 */}
          <DesktopGrid gods={filteredGods} slugMap={slugMap} />

          {/* モバイル表示 */}
          <MobileScroll gods={filteredGods} slugMap={slugMap} />
        </>
      ) : (
        <div className="text-center text-white py-8">
          <p>選択されたカテゴリに該当する神々が見つかりません</p>
        </div>
      )}
    </div>
  );
}
