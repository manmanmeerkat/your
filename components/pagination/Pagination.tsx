import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageHover?: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  onPageHover,
}: PaginationProps) {
  const [inputValue, setInputValue] = useState("");
  const [inputError, setInputError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Generate page numbers
  const getPageNumbers = (): number[] => {
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
  };

  // Button styles
  const getButtonClass = (isActive: boolean) =>
    isActive
      ? "bg-rose-700 text-white border-rose-700 hover:bg-rose-800"
      : "border-white text-white hover:bg-white hover:text-slate-900 transition-all duration-150";

  // Handle hover for prefetch
  const handlePageHover = (page: number) => {
    if (
      onPageHover &&
      page !== currentPage &&
      page >= 1 &&
      page <= totalPages
    ) {
      onPageHover(page);
    }
  };

  // Validate input
  const validateInput = (
    value: string
  ): { valid: boolean; page?: number; error?: string } => {
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
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    const validation = validateInput(value);
    setInputError(validation.error || "");

    // Prefetch valid page
    if (validation.valid && validation.page) {
      handlePageHover(validation.page);
    }
  };

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const validation = validateInput(inputValue);

      if (validation.valid && validation.page) {
        onPageChange(validation.page);
        setInputValue("");
        setInputError("");
        inputRef.current?.blur();
      }
    }
  };

  // Focus management
  const handleFocus = () => {
    setInputValue(currentPage.toString());
  };

  const handleBlur = () => {
    setInputValue("");
    setInputError("");
  };

  // Ctrl+G shortcut
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

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Main navigation */}
      <nav className="flex flex-wrap justify-center items-center gap-2">
        {/* Previous button */}
        {currentPage > 1 && (
          <Button
            variant="outline"
            size="sm"
            className={getButtonClass(false)}
            onClick={() => onPageChange(currentPage - 1)}
            onMouseEnter={() => handlePageHover(currentPage - 1)}
          >
            &lt; Prev
          </Button>
        )}

        {/* Page number buttons */}
        {pageNumbers.map((page, index) => {
          const isCurrent = page === currentPage;

          return (
            <React.Fragment key={page}>
              {/* Ellipsis */}
              {index > 0 && page - pageNumbers[index - 1] > 1 && (
                <span className="text-white mx-1">...</span>
              )}

              <Button
                variant={isCurrent ? "default" : "outline"}
                size="sm"
                className={`${getButtonClass(isCurrent)} min-w-[20px]`}
                onClick={() => onPageChange(page)}
                onMouseEnter={() => handlePageHover(page)}
                disabled={isCurrent}
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
            className={getButtonClass(false)}
            onClick={() => onPageChange(currentPage + 1)}
            onMouseEnter={() => handlePageHover(currentPage + 1)}
          >
            Next &gt;
          </Button>
        )}
      </nav>

      {/* Jump to page */}
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
              focus:outline-none 
              ${
                inputError
                  ? "border-red-500"
                  : "border-gray-400 focus:border-white"
              }
              transition-colors duration-200
            `}
          />

          {inputError && (
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 px-2 py-1 bg-red-600 text-white text-xs rounded whitespace-nowrap">
              {inputError}
            </div>
          )}
        </div>

        <span className="text-white">of {totalPages}</span>
      </div>
    </div>
  );
}
