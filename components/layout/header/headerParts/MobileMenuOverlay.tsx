"use client";

import { Button } from "@/components/ui/button";
import React, { useEffect, useCallback, useRef } from "react";

type MobileMenuOverlayProps = {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

export default function MobileMenuOverlay({ isOpen, onClose, children }: MobileMenuOverlayProps) {
  const ref = useRef<HTMLDivElement>(null);

  // スクロールロック
  useEffect(() => {
    if (!isOpen) return;

    const prevOverflow = document.body.style.overflow;
    const prevTouchAction = document.body.style.touchAction;

    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";

    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.touchAction = prevTouchAction;
    };
  }, [isOpen]);

  // ✅ inert を DOM 属性として付け外し
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (!isOpen) {
      el.setAttribute("inert", "");
      el.setAttribute("aria-hidden", "true");
    } else {
      el.removeAttribute("inert");
      el.removeAttribute("aria-hidden");
    }
  }, [isOpen]);

  // ✅ 閉じる前に focus を逃がす
  const safeClose = useCallback(() => {
    const active = document.activeElement as HTMLElement | null;
    if (active && active.closest('[data-mobile-menu="overlay"]')) {
      active.blur();
    }
    onClose();
  }, [onClose]);

  // ESC で閉じる
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.preventDefault();
      safeClose();
    };

    document.addEventListener("keydown", onKeyDown, { passive: false });
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, safeClose]);

  return (
    <div
      ref={ref}
      data-mobile-menu="overlay"
      className={[
        "fixed inset-0 z-[999] lg:hidden transition-opacity duration-200",
        isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
      ].join(" ")}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={safeClose} />

      {/* Panel */}
      <nav
        className="fixed top-0 left-0 w-full h-screen bg-[#2d211b] overflow-hidden"
        role="navigation"
        aria-label="Mobile navigation"
      >
        <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(90%_70%_at_50%_10%,rgba(255,255,255,0.10),rgba(45,33,27,0)_60%)]" />
        <div className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.10),rgba(0,0,0,0.55))]" />

        <div
          className={[
            "relative z-10 flex flex-col h-full transition-all duration-200 ease-out",
            isOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2",
            "[will-change:opacity,transform]",
          ].join(" ")}
        >
          <div className="container mx-auto w-full px-6 md:px-16 flex justify-between pt-6">
            <p className="text-2xl font-bold text-[#f3f3f2]">Menu</p>

            <Button
              type="button"
              variant="ghost"
              onClick={safeClose}
              className={[
                "group p-2 rounded hover:bg-white transition-all duration-150 active:scale-95",
                "[will-change:transform,background-color]",
              ].join(" ")}
              aria-label="Close menu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-colors duration-150 group-hover:stroke-black [will-change:stroke]"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </Button>
          </div>

          <ul className="flex-grow flex flex-col items-center justify-center space-y-6 text-lg" role="list">
            {children}
          </ul>
        </div>
      </nav>
    </div>
  );
}
