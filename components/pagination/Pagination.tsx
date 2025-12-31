import React, { memo, useCallback, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageHover?: (page: number) => void;
  disabled?: boolean;
  showQuickJumper?: boolean;
}

const PageButton = memo(function PageButton({
  page,
  isCurrent,
  disabled,
  onClick,
  onHover,
}: {
  page: number;
  isCurrent: boolean;
  disabled: boolean;
  onClick: () => void;
  onHover?: () => void;
}) {
  return (
    <Button
      size="sm"
      onClick={onClick}
      onMouseEnter={onHover}
      disabled={disabled || isCurrent}
      aria-current={isCurrent ? "page" : undefined}
      aria-label={`Go to page ${page}`}
      className={[
        "min-w-[28px] px-2 py-1 rounded border text-sm font-medium",
        isCurrent
          ? "bg-[#df7163] text-[#f3f3f2] border-[#df7163]"
          : "bg-transparent text-[#f3f3f2] border-white/60 hover:bg-[#df7163] hover:border-[#df7163]",
      ].join(" ")}
    >
      {page}
    </Button>
  );
});

const NavButton = memo(function NavButton({
  children,
  disabled,
  onClick,
  onHover,
  ariaLabel,
}: {
  children: React.ReactNode;
  disabled: boolean;
  onClick: () => void;
  onHover?: () => void;
  ariaLabel: string;
}) {
  return (
    <Button
      size="sm"
      onClick={onClick}
      onMouseEnter={onHover}
      disabled={disabled}
      aria-label={ariaLabel}
      className="
        border border-white/60
        bg-transparent
        text-[#f3f3f2]
        hover:bg-white/10
      "
    >
      {children}
    </Button>
  );
});

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  onPageHover,
  disabled = false,
  showQuickJumper = true,
}: PaginationProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  const pageNumbers = useMemo(() => {
    const maxVisible = 5;
    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 3) return [1, 2, 3, 4, totalPages];
    if (currentPage >= totalPages - 2) {
      return [1, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, currentPage - 1, currentPage, currentPage + 1, totalPages];
  }, [currentPage, totalPages]);

  const go = useCallback(
    (p: number) => {
      if (disabled) return;
      if (p < 1 || p > totalPages || p === currentPage) return;
      onPageChange(p);
    },
    [disabled, totalPages, currentPage, onPageChange]
  );

  const validate = useCallback(
    (s: string) => {
      const n = parseInt(s, 10);
      if (!s.trim()) return { ok: false, msg: "" };
      if (!Number.isFinite(n) || n < 1) return { ok: false, msg: "Invalid" };
      if (n > totalPages) return { ok: false, msg: `Max: ${totalPages}` };
      if (n === currentPage) return { ok: false, msg: "Current" };
      return { ok: true, n };
    },
    [totalPages, currentPage]
  );

  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const next = e.target.value.replace(/[^0-9]/g, "");
      setValue(next);

      const v = validate(next);
      setError(v.ok ? "" : v.msg || "");

      if (v.ok && v.n && onPageHover) onPageHover(v.n);
    },
    [validate, onPageHover]
  );

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const v = validate(value);
        if (v.ok && v.n) {
          go(v.n);
          setValue("");
          setError("");
          inputRef.current?.blur();
        }
      }
      if (e.key === "Escape") {
        setValue("");
        setError("");
        inputRef.current?.blur();
      }
    },
    [value, validate, go]
  );

  const canPrev = currentPage > 1;
  const canNext = currentPage < totalPages;

  return (
    <div className="flex flex-col items-center gap-3">
      <nav
        aria-label="Pagination navigation"
        className={["flex flex-wrap items-center justify-center gap-2", disabled ? "opacity-60" : ""].join(" ")}
      >
        {canPrev && (
          <NavButton
            ariaLabel="Go to previous page"
            disabled={disabled}
            onClick={() => go(currentPage - 1)}
            onHover={onPageHover ? () => onPageHover(currentPage - 1) : undefined}
          >
            &lt; Prev
          </NavButton>
        )}

        {pageNumbers.map((p, idx) => {
          const prev = pageNumbers[idx - 1];
          const showDots = idx > 0 && p - prev > 1;

          return (
            <React.Fragment key={p}>
              {showDots && (
                <span className="mx-1 select-none text-white/70" aria-hidden="true">
                  ...
                </span>
              )}
              <PageButton
                page={p}
                isCurrent={p === currentPage}
                disabled={disabled}
                onClick={() => go(p)}
                onHover={onPageHover ? () => onPageHover(p) : undefined}
              />
            </React.Fragment>
          );
        })}

        {canNext && (
          <NavButton
            ariaLabel="Go to next page"
            disabled={disabled}
            onClick={() => go(currentPage + 1)}
            onHover={onPageHover ? () => onPageHover(currentPage + 1) : undefined}
          >
            Next &gt;
          </NavButton>
        )}
      </nav>

      {showQuickJumper && (
        <div className="flex items-center gap-2 text-sm text-white/70">
          <span>Go to:</span>

          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={value}
              onChange={onInputChange}
              onKeyDown={onKeyDown}
              placeholder={`1-${totalPages}`}
              disabled={disabled}
              className={[
                "w-16 rounded border bg-slate-900/40 px-2 py-1 text-center text-sm",
                "focus:outline-none focus:ring-1",
                error ? "border-[#df7163] focus:ring-[#df7163]" : "border-white/30 focus:ring-white/60",
                disabled ? "opacity-60" : "",
              ].join(" ")}
              aria-label="Jump to page number"
            />

            {error && (
              <div className="absolute left-1/2 top-full z-10 mt-1 -translate-x-1/2 whitespace-nowrap rounded bg-[#df7163] px-2 py-1 text-xs text-[#f3f3f2]">
                {error}
              </div>
            )}
          </div>

          <span>of {totalPages}</span>
        </div>
      )}
    </div>
  );
}
