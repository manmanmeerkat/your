// components/pagination/Pagination.tsx
import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  memo,
} from "react";
import { Button } from "@/components/ui/button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageHover?: (page: number) => void;
}

// メモ化されたページボタンコンポーネント
const PageButton = memo(
  ({
    page,
    isCurrent,
    onClick,
    onHover,
  }: {
    page: number;
    isCurrent: boolean;
    onClick: () => void;
    onHover?: () => void;
  }) => (
    <Button
      variant={isCurrent ? "default" : "outline"}
      size="sm"
      className={
        isCurrent
          ? "bg-rose-700 text-white border-rose-700 hover:bg-rose-800 min-w-[40px]"
          : "border-white text-white hover:bg-white hover:text-slate-900 transition-all duration-150 min-w-[40px]"
      }
      onClick={onClick}
      onMouseEnter={onHover}
      disabled={isCurrent}
      aria-label={`Go to page ${page}`}
    >
      {page}
    </Button>
  )
);

PageButton.displayName = "PageButton";

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  onPageHover,
}: PaginationProps) {
  const [inputValue, setInputValue] = useState("");
  const [inputError, setInputError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // ページ番号配列をメモ化（パフォーマンス向上）
  const pageNumbers = useMemo((): number[] => {
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage <= 3) {
      return [1, 2, 3, 4, totalPages];
    }

    if (currentPage >= totalPages - 2) {
      return [1, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }

    return [1, currentPage - 1, currentPage, currentPage + 1, totalPages];
  }, [currentPage, totalPages]);

  // ページ変更ハンドラーをメモ化
  const handlePageChange = useCallback(
    (page: number) => {
      if (page >= 1 && page <= totalPages && page !== currentPage) {
        onPageChange(page);
      }
    },
    [currentPage, totalPages, onPageChange]
  );

  // ホバーハンドラーをメモ化
  const handlePageHover = useCallback(
    (page: number) => {
      if (
        onPageHover &&
        page !== currentPage &&
        page >= 1 &&
        page <= totalPages
      ) {
        onPageHover(page);
      }
    },
    [onPageHover, currentPage, totalPages]
  );

  // 前/次ボタンのハンドラー
  const handlePrevious = useCallback(() => {
    handlePageChange(currentPage - 1);
  }, [currentPage, handlePageChange]);

  const handleNext = useCallback(() => {
    handlePageChange(currentPage + 1);
  }, [currentPage, handlePageChange]);

  // 入力検証関数をメモ化
  const validateInput = useCallback(
    (
      value: string
    ): {
      valid: boolean;
      page?: number;
      error?: string;
    } => {
      if (!value.trim()) return { valid: false };

      const page = parseInt(value);

      if (isNaN(page) || page < 1) {
        return { valid: false, error: "Invalid number" };
      }

      if (page > totalPages) {
        return { valid: false, error: `Max: ${totalPages}` };
      }

      if (page === currentPage) {
        return { valid: false, error: "Current page" };
      }

      return { valid: true, page };
    },
    [totalPages, currentPage]
  );

  // 入力変更ハンドラー
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setInputValue(value);

      const validation = validateInput(value);
      setInputError(validation.error || "");

      // 有効なページのプリフェッチ（debounce不要、軽量化）
      if (validation.valid && validation.page) {
        handlePageHover(validation.page);
      }
    },
    [validateInput, handlePageHover]
  );

  // Enterキーハンドラー
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        const validation = validateInput(inputValue);

        if (validation.valid && validation.page) {
          handlePageChange(validation.page);
          setInputValue("");
          setInputError("");
          inputRef.current?.blur();
        }
      }
    },
    [inputValue, validateInput, handlePageChange]
  );

  // フォーカス管理
  const handleFocus = useCallback(() => {
    setInputValue(currentPage.toString());
  }, [currentPage]);

  const handleBlur = useCallback(() => {
    setInputValue("");
    setInputError("");
  }, []);

  // Ctrl+Gショートカット（最適化版）
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "g") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeydown);
    return () => document.removeEventListener("keydown", handleKeydown);
  }, []);

  // 1ページのみの場合は表示しない
  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col items-center gap-3">
      {/* メインナビゲーション */}
      <nav
        className="flex flex-wrap justify-center items-center gap-2"
        aria-label="Pagination navigation"
      >
        {/* Previous button */}
        {currentPage > 1 && (
          <Button
            variant="outline"
            size="sm"
            className="border-white text-white hover:bg-white hover:text-slate-900 transition-colors duration-150"
            onClick={handlePrevious}
            onMouseEnter={() => handlePageHover(currentPage - 1)}
            aria-label="Go to previous page"
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
                <span
                  className="text-white mx-1 select-none"
                  aria-hidden="true"
                >
                  ...
                </span>
              )}

              <PageButton
                page={page}
                isCurrent={isCurrent}
                onClick={() => handlePageChange(page)}
                onHover={() => handlePageHover(page)}
              />
            </React.Fragment>
          );
        })}

        {/* Next button */}
        {currentPage < totalPages && (
          <Button
            variant="outline"
            size="sm"
            className="border-white text-white hover:bg-white hover:text-slate-900 transition-colors duration-150"
            onClick={handleNext}
            onMouseEnter={() => handlePageHover(currentPage + 1)}
            aria-label="Go to next page"
          >
            Next &gt;
          </Button>
        )}
      </nav>

      {/* ページジャンプ機能 */}
      <div className="flex items-center gap-2 text-white text-sm">
        <span>Go to:</span>

        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={`1-${totalPages}`}
            className={`
              w-16 px-2 py-1 text-center text-sm
              bg-slate-800 border rounded
              focus:outline-none focus:ring-1
              ${
                inputError
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-400 focus:border-white focus:ring-white"
              }
              transition-all duration-200
            `}
            aria-label="Jump to page number"
          />

          {/* エラーツールチップ */}
          {inputError && (
            <div
              className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 px-2 py-1 bg-red-600 text-white text-xs rounded whitespace-nowrap z-10"
              role="alert"
            >
              {inputError}
            </div>
          )}
        </div>

        <span className="text-white">of {totalPages}</span>
        <span className="text-gray-400 text-xs">(Ctrl+G)</span>
      </div>
    </div>
  );
}
