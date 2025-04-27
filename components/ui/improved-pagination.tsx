"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";

interface ImprovedPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function ImprovedPagination({
  currentPage,
  totalPages,
  onPageChange,
}: ImprovedPaginationProps) {
  const [inputPage, setInputPage] = useState<string>("");

  // ページ番号の配列を生成する
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5; // 最大表示ページ数

    if (totalPages <= maxVisiblePages) {
      // ページ数が少ない場合はすべて表示
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // 常に最初のページを表示
      pageNumbers.push(1);

      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);

      // 省略記号が必要かどうかを確認
      if (startPage > 2) {
        pageNumbers.push("ellipsis_start");
      }

      // 現在のページ周辺のページを表示
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }

      // 後方の省略記号が必要かどうかを確認
      if (endPage < totalPages - 1) {
        pageNumbers.push("ellipsis_end");
      }

      // 常に最後のページを表示
      pageNumbers.push(totalPages);
    }

    return pageNumbers;
  };

  // ページ番号を入力して移動する処理
  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 数字のみ許可
    const value = e.target.value.replace(/[^0-9]/g, "");
    setInputPage(value);
  };

  // ページ入力フォームの送信処理
  const handlePageInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pageNumber = parseInt(inputPage, 10);

    if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= totalPages) {
      onPageChange(pageNumber);
      setInputPage(""); // 入力をクリア
    } else {
      // 無効な入力の場合は値をクリア
      setInputPage("");
    }
  };

  // 総ページ数が1以下の場合はページネーションを表示しない
  if (totalPages <= 1) {
    return null;
  }

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex flex-wrap justify-center items-center gap-2 pt-4">
      {/* 最初のページボタン */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
      >
        最初
      </Button>

      {/* 前のページボタン */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        前へ
      </Button>

      {/* ページ番号ボタン */}
      <div className="flex flex-wrap items-center gap-1 mx-1">
        {pageNumbers.map((pageNum, index) => {
          // 省略記号の場合
          if (pageNum === "ellipsis_start" || pageNum === "ellipsis_end") {
            return (
              <span key={`${pageNum}_${index}`} className="px-2">
                ...
              </span>
            );
          }

          // 数値の場合（ページ番号）
          return (
            <Button
              key={pageNum}
              variant={currentPage === pageNum ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange(Number(pageNum))}
              className={
                currentPage === pageNum
                  ? "bg-primary text-primary-foreground"
                  : ""
              }
            >
              {pageNum}
            </Button>
          );
        })}
      </div>

      {/* 次のページボタン */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        次へ
      </Button>

      {/* 最後のページボタン */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
      >
        最後
      </Button>

      {/* 直接ページ番号を入力するフォーム */}
      <form onSubmit={handlePageInputSubmit} className="flex items-center ml-3">
        <label htmlFor="page-input" className="text-sm text-gray-500 mr-2">
          ページ指定:
        </label>
        <input
          id="page-input"
          type="text"
          value={inputPage}
          onChange={handlePageInputChange}
          className="w-16 h-8 border border-gray-300 rounded px-2 text-sm"
          placeholder={currentPage.toString()}
          aria-label="ページ番号を入力"
        />
        <Button
          type="submit"
          variant="outline"
          size="sm"
          className="ml-1"
          disabled={!inputPage}
        >
          移動
        </Button>
      </form>

      {/* 総ページ数表示 */}
      <div className="text-sm text-gray-500 ml-2">全 {totalPages} ページ</div>
    </div>
  );
}
