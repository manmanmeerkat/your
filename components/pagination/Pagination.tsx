// components/pagination/Pagination.tsx (最適化版)
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
  disabled?: boolean;
}

// 🚀 メモ化されたページボタンコンポーネント
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
          : "border-white text-white hover:bg-white hover:text-slate-900 transition-all duration-150 min-w-[40px]"
      }
      onClick={onClick}
      onMouseEnter={onHover}
      disabled={isCurrent || disabled}
      aria-label={`Go to page ${page}`}
      aria-current={isCurrent ? "page" : undefined}
    >
      {page}
    </Button>
  )
);

PageButton.displayName = "PageButton";

// 🚀 メモ化されたナビゲーションボタン
const NavButton = memo(
  ({
    direction,
    onClick,
    onHover,
    disabled,
    children,
  }: {
    direction: "prev" | "next";
    onClick: () => void;
    onHover?: () => void;
    disabled: boolean;
    children: React.ReactNode;
  }) => (
    <Button
      variant="outline"
      size="sm"
      className="border-white text-white hover:bg-white hover:text-slate-900 transition-colors duration-150"
      onClick={onClick}
      onMouseEnter={onHover}
      disabled={disabled}
      aria-label={`Go to ${direction === "prev" ? "previous" : "next"} page`}
    >
      {children}
    </Button>
  )
);

NavButton.displayName = "NavButton";

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

  // 🚀 ページ番号配列をメモ化
  const pageNumbers = useMemo((): number[] => {
    if (!totalPages || totalPages < 1 || !currentPage || currentPage < 1) {
      return [1];
    }

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

  // 🚀 ページ変更ハンドラーをメモ化
  const handlePageChange = useCallback(
    (page: number) => {
      if (
        page >= 1 &&
        page <= totalPages &&
        page !== currentPage &&
        !disabled
      ) {
        onPageChange(page);
      }
    },
    [currentPage, totalPages, onPageChange, disabled]
  );

  // 🚀 ホバーハンドラーをメモ化（デバウンス付き）
  const handlePageHover = useCallback(
    (page: number) => {
      if (
        !onPageHover ||
        disabled ||
        page === currentPage ||
        page < 1 ||
        page > totalPages
      )
        return;

      // 軽量化：デバウンスタイムを短縮
      const timeoutId = setTimeout(() => {
        try {
          onPageHover(page);
        } catch {
          // エラーは静かに処理
        }
      }, 100); // 150ms → 100ms に短縮

      return () => clearTimeout(timeoutId);
    },
    [onPageHover, currentPage, totalPages, disabled]
  );

  // 🚀 事前生成されたイベントハンドラー
  const { pageHandlers, hoverHandlers } = useMemo(() => {
    const clickHandlers: Record<number, () => void> = {};
    const mouseHandlers: Record<number, () => void> = {};

    pageNumbers.forEach((page) => {
      clickHandlers[page] = () => handlePageChange(page);
      mouseHandlers[page] = () => handlePageHover(page);
    });

    return {
      pageHandlers: clickHandlers,
      hoverHandlers: mouseHandlers,
    };
  }, [pageNumbers, handlePageChange, handlePageHover]);

  // 前/次ボタンのハンドラー
  const handlePrevious = useCallback(() => {
    handlePageChange(currentPage - 1);
  }, [currentPage, handlePageChange]);

  const handleNext = useCallback(() => {
    handlePageChange(currentPage + 1);
  }, [currentPage, handlePageChange]);

  const handlePrevHover = useCallback(() => {
    if (currentPage > 1) handlePageHover(currentPage - 1);
  }, [currentPage, handlePageHover]);

  const handleNextHover = useCallback(() => {
    if (currentPage < totalPages) handlePageHover(currentPage + 1);
  }, [currentPage, totalPages, handlePageHover]);

  // 🚀 入力検証をメモ化
  const validateInput = useCallback(
    (
      value: string
    ): {
      valid: boolean;
      page?: number;
      error?: string;
    } => {
      const trimmed = value.trim();
      if (!trimmed) return { valid: false };

      const page = parseInt(trimmed, 10);

      if (isNaN(page) || !Number.isInteger(page) || page < 1) {
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

  // 🚀 入力関連ハンドラーをメモ化
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setInputValue(value);

      const validation = validateInput(value);
      setInputError(validation.error || "");

      // 有効なページのホバー
      if (validation.valid && validation.page) {
        handlePageHover(validation.page);
      }
    },
    [validateInput, handlePageHover]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();

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

  const handleFocus = useCallback(() => {
    if (!disabled) {
      setInputValue(currentPage.toString());
    }
  }, [currentPage, disabled]);

  const handleBlur = useCallback(() => {
    setInputValue("");
    setInputError("");
  }, []);

  // 🚀 キーボードショートカット（軽量化）
  useEffect(() => {
    if (disabled) return;

    const handleKeydown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "g") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeydown, { passive: false });
    return () => document.removeEventListener("keydown", handleKeydown);
  }, [disabled]);

  // 不正な状態での安全な表示
  if (!totalPages || totalPages < 1 || !currentPage || currentPage < 1) {
    return null;
  }

  // 1ページのみの場合は表示しない
  if (totalPages <= 1) return null;

  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < totalPages;
  const isOperationDisabled = disabled;

  return (
    <div className="flex flex-col items-center gap-3">
      {/* メインナビゲーション */}
      <nav
        className={`flex flex-wrap justify-center items-center gap-2 transition-opacity duration-200 ${
          isOperationDisabled ? "opacity-50 pointer-events-none" : "opacity-100"
        }`}
        aria-label="Pagination navigation"
      >
        {/* Previous button */}
        {canGoPrev && (
          <NavButton
            direction="prev"
            onClick={handlePrevious}
            onHover={handlePrevHover}
            disabled={isOperationDisabled}
          >
            &lt; Prev
          </NavButton>
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
                onClick={pageHandlers[page]}
                onHover={hoverHandlers[page]}
                disabled={isOperationDisabled}
              />
            </React.Fragment>
          );
        })}

        {/* Next button */}
        {canGoNext && (
          <NavButton
            direction="next"
            onClick={handleNext}
            onHover={handleNextHover}
            disabled={isOperationDisabled}
          >
            Next &gt;
          </NavButton>
        )}
      </nav>

      {/* ページジャンプ機能 */}
      <div
        className={`flex items-center gap-2 text-white text-sm transition-opacity duration-200 ${
          isOperationDisabled ? "opacity-50" : "opacity-100"
        }`}
      >
        <span>Go to:</span>

        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={`1-${totalPages}`}
            disabled={isOperationDisabled}
            className={`
              w-16 px-2 py-1 text-center text-sm
              bg-slate-800 border rounded
              focus:outline-none focus:ring-1
              disabled:opacity-50 disabled:cursor-not-allowed
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
