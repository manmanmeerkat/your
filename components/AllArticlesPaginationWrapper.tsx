// 🚀 クライアントコンポーネント: ページネーション
// components/AllArticlesPaginationWrapper.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Pagination } from "@/components/pagination/Pagination";

interface AllArticlesPaginationWrapperProps {
  currentPage: number;
  totalPages: number;
  currentCategory: string;
}

function AllArticlesPaginationWrapper({
  currentPage,
  totalPages,
}: AllArticlesPaginationWrapperProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());

    router.push(`/all-articles?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="mt-12 flex justify-center">
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
}

export default AllArticlesPaginationWrapper;
