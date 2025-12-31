// components/AllArticlesCategoryFilter.tsx
"use client";

import { memo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CATEGORIES } from "@/constants/constants";

const CategoryButton = memo(
  ({
    category,
    currentCategory,
    count,
    onClick,
  }: {
    category: { id: string; name: string } | null;
    currentCategory: string;
    count: number;
    onClick: () => void;
  }) => {
    const isActive = category
      ? currentCategory === category.id
      : !currentCategory;
    const label = category ? category.name : "All";

    return (
      <Button
        variant="ghost"
        onClick={onClick}
        className={[
          "relative rounded-xl px-4 py-2 text-sm",
          "transition-all duration-150",
          "backdrop-blur-sm",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60",
          "active:scale-[0.98]",

      isActive
        ? [
            "!bg-[#c96a5d]/95 !text-white",
            "hover:!bg-[#c96a5d]/95",
            "active:!bg-[#c96a5d]/95",
            "shadow-[0_10px_20px_rgba(201,106,93,0.25)]",
          ].join(" ")
        : [
            "!bg-white/10 !text-white/85",
            "hover:!bg-[#c96a5d]/25 hover:!text-white",
            "active:!bg-[#c96a5d]/35",
            "hover:ring-2 hover:ring-white/30",
          ].join(" "),
        ].join(" ")}
      >
        {label} ({count})
      </Button>
    );
  }
);

CategoryButton.displayName = "CategoryButton";

interface AllArticlesCategoryFilterProps {
  currentCategory: string;
  totalCount: number;
  categoryCounts: Record<string, number>;
}

function AllArticlesCategoryFilter({
  currentCategory,
  totalCount,
  categoryCounts,
}: AllArticlesCategoryFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleCategoryChange = (categoryId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (categoryId) {
      params.set("category", categoryId);
    } else {
      params.delete("category");
    }
    params.set("page", "1"); // カテゴリ変更時は1ページ目に戻る

    router.push(`/all-articles?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="sticky top-16 z-20">
      <div className="container mx-auto max-w-6xl px-6">
        <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 backdrop-blur-md shadow-lg px-4 py-4">
          <div className="flex flex-wrap justify-center gap-3">
            <CategoryButton
              category={null}
              currentCategory={currentCategory}
              count={totalCount}
              onClick={() => handleCategoryChange("")}
            />

            {CATEGORIES.map((category) => (
              <CategoryButton
                key={category.id}
                category={category}
                currentCategory={currentCategory}
                count={categoryCounts[category.id] || 0}
                onClick={() => handleCategoryChange(category.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AllArticlesCategoryFilter;
