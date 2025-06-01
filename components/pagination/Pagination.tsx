// components/pagination/Pagination.tsx (プリレンダリング最適化版)
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
  siblingCount?: number;
  showQuickJumper?: boolean;
}

// 🚀 CSS最適化：軽量スタイル版ページボタン
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
    size="sm"
    className={`
      min-w-[20px] px-2 py-1 rounded border text-sm font-medium
      ${isCurrent
        ? "bg-[#df7163] text-[#f3f3f2] border-[#df7163]"
        : "bg-transparent text-[#f3f3f2] border-[#f3f3f2] hover:bg-[#df7163] hover:text-[#f3f3f2] hover:border-[#df7163]"}
    `}
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

// 🚀 CSS最適化：軽量ナビボタン
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
      className="pagination-nav"
      onClick={onClick}
      onMouseEnter={onHover}
      disabled={disabled}
      aria-label={`Go to ${direction === "prev" ? "previous" : "next"} page`}
      style={{
        borderColor: "white",
        color: "white",
        transition: "all 0.1s ease",
      }}
    >
      {children}
    </Button>
  )
);

NavButton.displayName = "NavButton";

// 🚀 プリレンダリング用のスケルトン
const PaginationSkeleton = memo(() => (
  <div className="flex flex-col items-center gap-3">
    <nav
      className="flex justify-center items-center gap-2"
      aria-label="Pagination"
    >
      {/* スケルトンボタン（瞬時表示） */}
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="w-10 h-8 bg-slate-700 rounded animate-pulse"
        />
      ))}
    </nav>
    <div className="flex items-center gap-2 text-white text-sm">
      <span>Go to:</span>
      <div className="w-16 h-6 bg-slate-700 rounded animate-pulse" />
      <span>of -</span>
    </div>
  </div>
));

PaginationSkeleton.displayName = "PaginationSkeleton";

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  onPageHover,
  disabled = false,
}: PaginationProps) {
  const [inputValue, setInputValue] = useState(""); // 🔥 常に空文字列で初期化
  const [inputError, setInputError] = useState("");
  const [isRendered, setIsRendered] = useState(false); // 🚀 レンダリング状態
  const [isFocused, setIsFocused] = useState(false); // 🆕 フォーカス状態管理
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout>(); // 🆕 デバウンス用タイマー

  // 🚀 プリレンダリング：初回レンダリング後に実際のUIを表示
  useEffect(() => {
    // 非同期でレンダリング状態を更新（ブロッキングしない）
    const timeoutId = setTimeout(() => {
      setIsRendered(true);
    }, 0); // 次のティックで実行

    return () => clearTimeout(timeoutId);
  }, [currentPage, totalPages]);

  // 🚀 ページ番号計算の最適化（変更時のみ再計算）
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

  // 🚀 パフォーマンス改善：startTransitionを使用
  const handlePageChange = useCallback(
    (page: number) => {
      if (
        page >= 1 &&
        page <= totalPages &&
        page !== currentPage &&
        !disabled
      ) {
        // 🆕 React 18のstartTransitionを使用してノンブロッキング更新
        React.startTransition(() => {
          onPageChange(page);
        });
      }
    },
    [currentPage, totalPages, onPageChange, disabled]
  );

  // 🚀 デバウンス付きホバーハンドラー
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

      // 既存のタイマーをクリア
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // デバウンス処理（200ms）
      debounceTimerRef.current = setTimeout(() => {
        try {
          onPageHover(page);
        } catch {
          // エラーは静かに処理
        }
      }, 200);
    },
    [onPageHover, currentPage, totalPages, disabled]
  );

  // 🚀 ハンドラーのメモ化最適化
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

  // 🚀 入力値検証の最適化
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

  // 🔥 修正：入力変更時にデフォルト値を設定しない
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;

      // 数字以外の文字を除去（リアルタイム）
      const numericValue = value.replace(/[^0-9]/g, "");
      setInputValue(numericValue);

      const validation = validateInput(numericValue);
      setInputError(validation.error || "");

      // ホバープレビューは有効なページの場合のみ
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
          setInputValue(""); // 🔥 修正：成功後は空文字列に戻す
          setInputError("");
          inputRef.current?.blur();
        }
      } else if (e.key === "Escape") {
        // ESCキーで入力をクリア
        setInputValue("");
        setInputError("");
        inputRef.current?.blur();
      }
    },
    [inputValue, validateInput, handlePageChange]
  );

  // 🔥 修正：フォーカス時にデフォルト値を設定しない
  const handleFocus = useCallback(() => {
    if (!disabled) {
      setIsFocused(true);
      // デフォルト値は設定しない（プレースホルダーのみ表示）
    }
  }, [disabled]);

  // 🔥 修正：ブラー時の処理
  const handleBlur = useCallback(() => {
    setIsFocused(false);
    setInputValue(""); // 常に空文字列に戻す
    setInputError("");
  }, []);

  // 🚀 キーボードショートカットの改善
  useEffect(() => {
    if (disabled) return;

    const handleKeydown = (e: KeyboardEvent) => {
      // 入力フィールドにフォーカスがある場合は無視
      if (document.activeElement === inputRef.current) return;

      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          if (currentPage > 1) handlePageChange(currentPage - 1);
          break;
        case "ArrowRight":
          e.preventDefault();
          if (currentPage < totalPages) handlePageChange(currentPage + 1);
          break;
        case "Home":
          e.preventDefault();
          if (currentPage !== 1) handlePageChange(1);
          break;
        case "End":
          e.preventDefault();
          if (currentPage !== totalPages) handlePageChange(totalPages);
          break;
        default:
          // Ctrl+G または Cmd+G でページジャンプにフォーカス
          if ((e.ctrlKey || e.metaKey) && e.key === "g") {
            e.preventDefault();
            inputRef.current?.focus();
          }
          break;
      }
    };

    document.addEventListener("keydown", handleKeydown, { passive: false });
    return () => document.removeEventListener("keydown", handleKeydown);
  }, [disabled, currentPage, totalPages, handlePageChange]);

  // 🚀 クリーンアップの改善
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // 不正な状態での安全な表示
  if (!totalPages || totalPages < 1 || !currentPage || currentPage < 1) {
    return null;
  }

  // 1ページのみの場合は表示しない
  if (totalPages <= 1) return null;

  // 🚀 プリレンダリング：スケルトンを最初に表示
  if (!isRendered) {
    return <PaginationSkeleton />;
  }

  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < totalPages;
  const isOperationDisabled = disabled;

  return (
    <>
      <div className="flex flex-col items-center gap-3">
        {/* メインナビゲーション */}
        <nav
          className={`flex flex-wrap justify-center items-center gap-2 transition-opacity duration-200 ${
            isOperationDisabled
              ? "opacity-50 pointer-events-none"
              : "opacity-100"
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
                    className="text-[#f3f3f2] mx-1 select-none"
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

        {/* 🔥 修正：ページジャンプ機能（デフォルト値なし） */}
        <div
          className={`flex items-center gap-2 text-[#f3f3f2] text-sm transition-opacity duration-200 ${
            isOperationDisabled ? "opacity-50" : "opacity-50"
          }`}
        >
          <span>Go to:</span>

          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={inputValue} // 🔥 常に空文字列または入力された値のみ
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={handleFocus}
              onBlur={handleBlur}
              placeholder={isFocused ? "page" : `1-${totalPages}`} // 🔥 動的プレースホルダー
              disabled={isOperationDisabled}
              className={`
                w-16 px-2 py-1 text-center text-sm
                bg-slate-800 border rounded
                focus:outline-none focus:ring-1
                disabled:opacity-50 disabled:cursor-not-allowed
                ${isFocused ? "pagination-input-focused" : ""}
                ${
                  inputError
                    ? "border-[#df7163] focus:ring-[#df7163]"
                    : "border-gray-400 focus:border-[#f3f3f2] focus:ring-white"
                }
                transition-all duration-200
              `}
              aria-label="Jump to page number"
              title="Use Ctrl+G to quickly focus this input" // 🆕 ヒント追加
            />

            {/* エラーツールチップ */}
            {inputError && (
              <div
                className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 px-2 py-1 bg-[#df7163] text-[#f3f3f2] text-xs rounded whitespace-nowrap z-10"
                role="alert"
              >
                {inputError}
              </div>
            )}
          </div>

          <span className="text-[#f3f3f2]">of {totalPages}</span>
        </div>
      </div>
    </>
  );
}
