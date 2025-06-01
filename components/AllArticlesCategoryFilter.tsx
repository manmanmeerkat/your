// 🚀 クライアントコンポーネント: カテゴリーフィルター
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
        variant={isActive ? "default" : "outline"}
        className={
          isActive
            ? "bg-[#df7163] hover:bg-[#df7163]"
            : "border-white hover:bg-white hover:text-[#df7163] "
        }
        onClick={onClick}
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
    <div className="sticky top-16 z-20 bg-[#180614] py-4 shadow-md">
      <div className="flex flex-wrap justify-start md:justify-center gap-3 px-4">
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
  );
}

export default AllArticlesCategoryFilter;
