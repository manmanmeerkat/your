import React from "react";
import { Button } from "@/components/ui/button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  // ページ番号を生成
  const getPageNumbers = (): number[] => {
    const maxVisibleButtons = 5;

    if (totalPages <= maxVisibleButtons) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage <= 3) {
      return [1, 2, 3, 4, totalPages];
    }

    if (currentPage >= totalPages - 2) {
      return [1, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }

    return [1, currentPage - 1, currentPage, currentPage + 1, totalPages];
  };

  // ボタンのスタイル決め
  const getButtonClass = (isActive: boolean) =>
    isActive
      ? "bg-rose-700 text-white border-rose-700 hover:bg-rose-800"
      : "border-white text-white hover:bg-white hover:text-slate-900";

  const pageNumbers = getPageNumbers();

  return (
    <nav className="flex flex-wrap justify-center items-center gap-2">
      {/* Prevボタン */}
      {currentPage > 1 && (
        <Button
          variant="outline"
          size="sm"
          className={getButtonClass(false)}
          onClick={() => onPageChange(currentPage - 1)}
        >
          &lt; Prev
        </Button>
      )}

      {/* ページ番号ボタン */}
      {pageNumbers.map((page, index) => {
        const isCurrent = page === currentPage;

        return (
          <React.Fragment key={page}>
            {/* 省略記号 */}
            {index > 0 && page - pageNumbers[index - 1] > 1 && (
              <span className="text-white mx-1">...</span>
            )}

            <Button
              variant={isCurrent ? "default" : "outline"}
              size="sm"
              className={getButtonClass(isCurrent)}
              onClick={() => onPageChange(page)}
            >
              {page}
            </Button>
          </React.Fragment>
        );
      })}

      {/* Nextボタン */}
      {currentPage < totalPages && (
        <Button
          variant="outline"
          size="sm"
          className={getButtonClass(false)}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Next &gt;
        </Button>
      )}
    </nav>
  );
}