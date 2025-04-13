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
  // ページ番号を生成する関数
  const getPageNumbers = (): number[] => {
    // 表示するページボタンの数
    const maxVisibleButtons = 5;

    // ページが少ない場合は全て表示
    if (totalPages <= maxVisibleButtons) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // 現在のページが最初の方にある場合
    if (currentPage <= 3) {
      return [1, 2, 3, 4, totalPages];
    }

    // 現在のページが最後の方にある場合
    if (currentPage >= totalPages - 2) {
      return [1, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }

    // 現在のページが中間にある場合
    return [1, currentPage - 1, currentPage, currentPage + 1, totalPages];
  };

  const pageNumbers = getPageNumbers();

  return (
    <nav className="flex flex-wrap justify-center items-center gap-2">
      {/* 「前へ」ボタン */}
      <Button
        variant="outline"
        size="sm"
        className="border-white text-white hover:bg-white hover:text-slate-900"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
      >
        &lt; Prev
      </Button>

      {/* ページ番号ボタン */}
      {pageNumbers.map((page, index) => {
        // ページが連続していない場合は省略記号を表示
        if (index > 0 && page - pageNumbers[index - 1] > 1) {
          return (
            <React.Fragment key={`ellipsis-${index}`}>
              <span className="text-white mx-1">...</span>
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                className={
                  currentPage === page
                    ? "bg-rose-700 text-white border-rose-700 hover:bg-rose-800"
                    : "border-white text-white hover:bg-white hover:text-slate-900"
                }
                onClick={() => onPageChange(page)}
              >
                {page}
              </Button>
            </React.Fragment>
          );
        }

        return (
          <Button
            key={page}
            variant={currentPage === page ? "default" : "outline"}
            size="sm"
            className={
              currentPage === page
                ? "bg-rose-700 text-white border-rose-700 hover:bg-rose-800"
                : "border-white text-white hover:bg-white hover:text-slate-900"
            }
            onClick={() => onPageChange(page)}
          >
            {page}
          </Button>
        );
      })}

      {/* 「次へ」ボタン */}
      <Button
        variant="outline"
        size="sm"
        className="border-white text-white hover:bg-white hover:text-slate-900"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
      >
        Next &gt;
      </Button>
    </nav>
  );
}
