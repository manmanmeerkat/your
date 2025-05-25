// components/pagination/Pagination.tsx (瞬時表示版)
import React, { useState, useRef, useEffect, useCallback, memo } from "react";
import { Button } from "@/components/ui/button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageHover?: (page: number) => void;
  disabled?: boolean;
}

// 🚀 超軽量ページボタン（最小限の処理）
const PageButton = memo(
  ({
    page,
    isCurrent,
    onClick,
    onHover,
    disabled,
  }: {
    page: number;
    isCurrent: boolean;
    onClick: () => void;
    onHover?: () => void;
    disabled: boolean;
  }) => (
    <Button
      variant={isCurrent ? "default" : "outline"}
      size="sm"
      className={
        isCurrent
          ? "bg-rose-700 text-white border-rose-700 hover:bg-rose-800 min-w-[40px]"
          : "border-white text-white hover:bg-white hover:text-slate-900 min-w-[40px]"
      }
      onClick={onClick}
      onMouseEnter={onHover}
      disabled={isCurrent || disabled}
    >
      {page}
    </Button>
  )
);

PageButton.displayName = "PageButton";

// 🚀 瞬時計算：ページ番号配列生成（複雑な条件分岐を削除）
const getPageNumbers = (current: number, total: number): number[] => {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 3) return [1, 2, 3, 4, total];
  if (current >= total - 2) return [1, total - 3, total - 2, total - 1, total];
  return [1, current - 1, current, current + 1, total];
};

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  onPageHover,
  disabled = false,
}: PaginationProps) {
  const [inputValue, setInputValue] = useState("");
  const [inputError, setInputError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // 🚀 瞬時計算：複雑なuseMemoを削除して直接計算
  const pageNumbers = getPageNumbers(currentPage, totalPages);

  // 🚀 シンプルなハンドラー（メモ化を最小限に）
  const handlePageClick = useCallback(
    (page: number) => {
      if (
        page !== currentPage &&
        !disabled &&
        page >= 1 &&
        page <= totalPages
      ) {
        onPageChange(page);
      }
    },
    [currentPage, totalPages, onPageChange, disabled]
  );

  const handlePageHover = useCallback(
    (page: number) => {
      if (onPageHover && !disabled && page !== currentPage) {
        onPageHover(page);
      }
    },
    [onPageHover, currentPage, disabled]
  );

  // 🚀 入力関連も軽量化
  const validateAndSetError = useCallback(
    (value: string) => {
      if (!value.trim()) {
        setInputError("");
        return null;
      }

      const page = parseInt(value, 10);
      if (isNaN(page) || page < 1) {
        setInputError("Invalid");
        return null;
      }
      if (page > totalPages) {
        setInputError(`Max: ${totalPages}`);
        return null;
      }
      if (page === currentPage) {
        setInputError("Current");
        return null;
      }

      setInputError("");
      return page;
    },
    [totalPages, currentPage]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setInputValue(value);
      const validPage = validateAndSetError(value);
      if (validPage && onPageHover) {
        handlePageHover(validPage);
      }
    },
    [validateAndSetError, onPageHover, handlePageHover]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        const page = validateAndSetError(inputValue);
        if (page) {
          handlePageClick(page);
          setInputValue("");
          setInputError("");
          inputRef.current?.blur();
        }
      }
    },
    [inputValue, validateAndSetError, handlePageClick]
  );

  // 🚀 キーボードショートカット（軽量版）
  useEffect(() => {
    if (disabled) return;
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "g") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [disabled]);

  // 🚀 早期リターン（計算を最小限に）
  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col items-center gap-3">
      {/* 🚀 メインナビゲーション（直接レンダリング） */}
      <nav
        className="flex flex-wrap justify-center items-center gap-2"
        aria-label="Pagination"
      >
        {/* Previous button */}
        {currentPage > 1 && (
          <Button
            variant="outline"
            size="sm"
            className="border-white text-white hover:bg-white hover:text-slate-900"
            onClick={() => handlePageClick(currentPage - 1)}
            onMouseEnter={() => handlePageHover(currentPage - 1)}
            disabled={disabled}
          >
            &lt; Prev
          </Button>
        )}

        {/* 🚀 ページボタン（直接マップ、複雑な計算なし） */}
        {pageNumbers.map((page, i) => (
          <React.Fragment key={page}>
            {/* 省略記号（シンプルな条件） */}
            {i > 0 && page - pageNumbers[i - 1] > 1 && (
              <span className="text-white mx-1">...</span>
            )}

            <PageButton
              page={page}
              isCurrent={page === currentPage}
              onClick={() => handlePageClick(page)}
              onHover={() => handlePageHover(page)}
              disabled={disabled}
            />
          </React.Fragment>
        ))}

        {/* Next button */}
        {currentPage < totalPages && (
          <Button
            variant="outline"
            size="sm"
            className="border-white text-white hover:bg-white hover:text-slate-900"
            onClick={() => handlePageClick(currentPage + 1)}
            onMouseEnter={() => handlePageHover(currentPage + 1)}
            disabled={disabled}
          >
            Next &gt;
          </Button>
        )}
      </nav>

      {/* 🚀 ページジャンプ（シンプル版） */}
      <div className="flex items-center gap-2 text-white text-sm">
        <span>Go to:</span>
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setInputValue(currentPage.toString())}
            onBlur={() => {
              setInputValue("");
              setInputError("");
            }}
            placeholder={`1-${totalPages}`}
            disabled={disabled}
            className={`w-16 px-2 py-1 text-center text-sm bg-slate-800 border rounded focus:outline-none ${
              inputError
                ? "border-red-500"
                : "border-gray-400 focus:border-white"
            }`}
          />
          {inputError && (
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 px-2 py-1 bg-red-600 text-white text-xs rounded">
              {inputError}
            </div>
          )}
        </div>
        <span>of {totalPages}</span>
        <span className="text-gray-400 text-xs">(Ctrl+G)</span>
      </div>
    </div>
  );
}
