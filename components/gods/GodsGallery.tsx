"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/button";

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
  { label: "全て", value: "all" },
  { label: "男神", value: "male" },
  { label: "女神", value: "female" },
];

export default function GodsGallery({ gods, slugMap }: GodsGalleryProps) {
  const [activeTab, setActiveTab] = useState("all");

  const getGodSlug = (name: string): string => {
    if (slugMap[name]) {
      return slugMap[name];
    }
    return name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  };

  const filteredGods =
    activeTab === "all" ? gods : gods.filter((g) => g.gender === activeTab);

  return (
    <div className="w-full">
      {/* タブボタン */}
      <div className="flex justify-center gap-4 mb-6">
        {TABS.map((tab) => (
          <Button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
              ${activeTab === tab.value ? "bg-white text-black" : "bg-slate-700 text-white"}`}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {filteredGods.length > 0 && (
        <>
          {/* デスクトップ表示: グリッド */}
          <div className="hidden lg:grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 justify-items-center text-center">
            {filteredGods.map((god, index) => {
              const slug = getGodSlug(god.name);
              return (
                <Link
                  href={`/category-item/${slug}`}
                  key={index}
                  className="w-36 flex flex-col items-center justify-start group"
                >
                  <div className="w-24 h-24 bg-slate-200 rounded-full relative overflow-hidden">
                    <Image
                      src={god.img}
                      alt={god.name}
                      fill
                      style={{ objectFit: "cover" }}
                      className="group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <p className="mt-2 text-xs text-white group-hover:underline leading-tight text-center max-w-[8rem] break-words">
                    {god.name}
                  </p>
                </Link>
              );
            })}
          </div>

          {/* モバイル表示: 横スクロール */}
          <div className="lg:hidden overflow-x-auto whitespace-nowrap px-4 scrollbar-custom">
            <div className="inline-flex gap-8">
              {filteredGods.map((god, index) => {
                const slug = getGodSlug(god.name);
                return (
                  <Link
                    href={`/category-item/${slug}`}
                    key={index}
                    className="inline-block w-28 flex-shrink-0 text-center group"
                  >
                    <div className="w-24 h-24 bg-slate-200 rounded-full relative overflow-hidden mx-auto">
                      <Image
                        src={god.img}
                        alt={god.name}
                        fill
                        style={{ objectFit: "cover" }}
                        className="group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    <p className="mt-1 text-xs text-white group-hover:underline break-words leading-tight">
                      {god.name}
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
