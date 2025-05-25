// components/pagination/Pagination.tsx
import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { Button } from "@/components/ui/button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageHover?: (page: number) => void;
  disabled?: boolean; // 新しい prop で外部から制御可能
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  onPageHover,
  disabled = false,
}: PaginationProps) {
  const [inputValue, setInputValue] = useState("");
  const [inputError, setInputError] = useState("");
  const [isChanging, setIsChanging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // ページ番号配列の生成（安定版）
  const pageNumbers = useMemo((): number[] => {
    // 基本的な検証
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

  // 安全なページ変更ハンドラー
  const handlePageChange = useCallback(
    async (page: number) => {
      // 二重実行防止
      if (isChanging || disabled) return;

      // 範囲チェック
      if (page < 1 || page > totalPages || page === currentPage) return;

      try {
        setIsChanging(true);

        // 短時間の遅延でUI応答性を向上
        await new Promise((resolve) => setTimeout(resolve, 50));

        onPageChange(page);
      } catch (error) {
        console.error("Page change error:", error);
      } finally {
        // 最小限の遅延後にロック解除
        setTimeout(() => setIsChanging(false), 200);
      }
    },
    [currentPage, totalPages, onPageChange, isChanging, disabled]
  );

  // 安全なホバーハンドラー（デバウンス付き）
  const handlePageHover = useCallback(
    (page: number) => {
      if (!onPageHover || disabled || isChanging) return;
      if (page === currentPage || page < 1 || page > totalPages) return;

      // 既存のタイムアウトをクリア
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // デバウンス処理
      timeoutRef.current = setTimeout(() => {
        try {
          onPageHover(page);
        } catch (error) {
          console.error("Page hover error:", error);
        }
      }, 100);
    },
    [onPageHover, currentPage, totalPages, disabled, isChanging]
  );

  // 入力検証（堅牢版）
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

  // 入力変更ハンドラー
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setInputValue(value);

      const validation = validateInput(value);
      setInputError(validation.error || "");

      // 有効なページのホバー（軽量版）
      if (validation.valid && validation.page) {
        handlePageHover(validation.page);
      }
    },
    [validateInput, handlePageHover]
  );

  // Enterキー処理
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

  // フォーカス管理
  const handleFocus = useCallback(() => {
    if (!disabled) {
      setInputValue(currentPage.toString());
    }
  }, [currentPage, disabled]);

  const handleBlur = useCallback(() => {
    setInputValue("");
    setInputError("");
  }, []);

  // ショートカットキー
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "g" && !disabled) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeydown);
    return () => {
      document.removeEventListener("keydown", handleKeydown);
      // クリーンアップ
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [disabled]);

  // 不正な状態での安全な表示
  if (!totalPages || totalPages < 1 || !currentPage || currentPage < 1) {
    return null;
  }

  // 1ページのみの場合は表示しない
  if (totalPages <= 1) return null;

  const isOperationDisabled = disabled || isChanging;

  return (
    <div className="flex flex-col items-center gap-3">
      {/* ロード状態インジケーター */}
      {isChanging && (
        <div className="flex items-center gap-2 text-white text-sm">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          <span>Loading...</span>
        </div>
      )}

      {/* メインナビゲーション */}
      <nav
        className={`flex flex-wrap justify-center items-center gap-2 transition-opacity duration-200 ${
          isOperationDisabled ? "opacity-50 pointer-events-none" : "opacity-100"
        }`}
        aria-label="Pagination navigation"
      >
        {/* Previous button */}
        {currentPage > 1 && (
          <Button
            variant="outline"
            size="sm"
            className="border-white text-white hover:bg-white hover:text-slate-900 transition-colors duration-150"
            onClick={() => handlePageChange(currentPage - 1)}
            onMouseEnter={() => handlePageHover(currentPage - 1)}
            disabled={isOperationDisabled}
            aria-label="Go to previous page"
          >
            &lt; Prev
          </Button>
        )}

        {/* ページ番号ボタン */}
        {pageNumbers.map((page, index) => {
          const isCurrent = page === currentPage;

          return (
            <React.Fragment key={`page-${page}`}>
              {/* 省略記号 */}
              {index > 0 && page - pageNumbers[index - 1] > 1 && (
                <span
                  className="text-white mx-1 select-none"
                  aria-hidden="true"
                >
                  ...
                </span>
              )}

              <Button
                variant={isCurrent ? "default" : "outline"}
                size="sm"
                className={
                  isCurrent
                    ? "bg-rose-700 text-white border-rose-700 hover:bg-rose-800 min-w-[40px]"
                    : "border-white text-white hover:bg-white hover:text-slate-900 transition-all duration-150 min-w-[40px]"
                }
                onClick={() => handlePageChange(page)}
                onMouseEnter={() => handlePageHover(page)}
                disabled={isCurrent || isOperationDisabled}
                aria-label={`Go to page ${page}`}
                aria-current={isCurrent ? "page" : undefined}
              >
                {page}
              </Button>
            </React.Fragment>
          );
        })}

        {/* Next button */}
        {currentPage < totalPages && (
          <Button
            variant="outline"
            size="sm"
            className="border-white text-white hover:bg-white hover:text-slate-900 transition-colors duration-150"
            onClick={() => handlePageChange(currentPage + 1)}
            onMouseEnter={() => handlePageHover(currentPage + 1)}
            disabled={isOperationDisabled}
            aria-label="Go to next page"
          >
            Next &gt;
          </Button>
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
