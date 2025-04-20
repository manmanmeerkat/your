// components/pagination-wrapper.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Pagination } from "@/components/pagination/Pagination";

interface PaginationWrapperProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
}

export default function PaginationWrapper({
  currentPage,
  totalPages,
  basePath,
}: PaginationWrapperProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePageChange = (page: number) => {
    // 現在のクエリパラメータをコピー
    const params = new URLSearchParams(searchParams.toString());

    // ページパラメータを更新
    params.set("page", page.toString());

    // ルーターを使用して新しいページへ移動
    router.push(`${basePath}?${params.toString()}`);
  };

  return (
    <Pagination
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={handlePageChange}
    />
  );
}
