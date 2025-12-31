"use client";

import { useState, useMemo, useCallback } from "react";
import { DesktopUI } from "../desktopUI/DesktopUI";
import { MobileScrollUI } from "../mobileScrollUI/MobileScrollUI";
import { GodData } from "@/types/types";

const TABS = [
  { label: "All", value: "all" },
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
] as const;

type GodsGalleryProps = {
  gods: GodData[];
  slugMap: Record<string, string>;
};

export default function GodsGallery({ gods, slugMap }: GodsGalleryProps) {
  const [activeTab, setActiveTab] = useState<"all" | "male" | "female">("all");

  const filteredGods = useMemo(() => {
    return activeTab === "all"
      ? gods
      : gods.filter((god) => god.gender === activeTab);
  }, [gods, activeTab]);

  const handleTabChange = useCallback(
    (tabValue: "all" | "male" | "female") => {
      setActiveTab(tabValue);
    },
    []
  );

  if (!gods || gods.length === 0) {
    return (
      <div className="text-center text-white">
        <p>No gods available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Tabs */}
      <div className="flex justify-center gap-3 md:gap-4 mb-10">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => handleTabChange(tab.value)}
            className={`
              h-9 px-5 rounded-full text-sm
              border transition-all duration-200 shadow-sm
              ${activeTab === tab.value
                ? "bg-[#f3f3f2] text-[#df7163] border-[#df7163] font-semibold"
                : "bg-[#df7163]/90 text-[#f3f3f2] border-[#df7163]"}
              hover:bg-[#f3f3f2] hover:text-[#df7163]
              active:scale-95
            `}
          >
            {tab.label}
          </button>
        ))}
    </div>

      {/* Content */}
      {filteredGods.length > 0 ? (
        <>
          <DesktopUI gods={filteredGods} slugMap={slugMap} />
          <MobileScrollUI gods={filteredGods} slugMap={slugMap} />
        </>
      ) : (
        <div className="text-center text-white py-8">
          <p>No gods match the selected category.</p>
        </div>
      )}
    </div>
  );
}
