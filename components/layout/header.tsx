//components/layout/header.tsx
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { NAVI_LINKS } from "@/constants/constants";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    if (isMenuOpen) {
      setIsVisible(true);
      setAnimateIn(false);

      // DOM表示後、次フレームでアニメーションON
      const timeout = setTimeout(() => {
        setAnimateIn(true);
      }, 10);

      return () => clearTimeout(timeout);
    } else {
      setAnimateIn(false);
      const timeout = setTimeout(() => {
        setIsVisible(false);
      }, 300); // アニメーション時間を短縮（500ms → 300ms）

      return () => clearTimeout(timeout);
    }
  }, [isMenuOpen]);

  // メニューを閉じる関数をメモ化
  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  // デスクトップナビリンクをメモ化
  const desktopNavLinks = useMemo(
    () =>
      NAVI_LINKS.map(({ href, label }) => (
        <li key={href}>
          <Link
            href={href}
            prefetch={true} // プリフェッチを明示的に有効化
            className="block py-2 text-white relative group hover:text-gray-300 transition-colors duration-200"
          >
            {label}
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gray-400 transition-all duration-300 group-hover:w-full" />
          </Link>
        </li>
      )),
    []
  );

  // モバイルナビリンクをメモ化
  const mobileNavLinks = useMemo(
    () =>
      NAVI_LINKS.map(({ href, label }) => (
        <li key={href}>
          <Link
            href={href}
            onClick={closeMenu}
            prefetch={true}
            className="block py-2 text-white relative group hover:text-gray-300 transition-colors duration-200"
          >
            {label}
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gray-400 transition-all duration-300 group-hover:w-full" />
          </Link>
        </li>
      )),
    [closeMenu]
  );

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950 shadow-sm">
      <div className="container mx-auto px-6 md:px-16 py-4">
        <div className="flex justify-between items-center">
          <Link
            href="/"
            prefetch={true}
            className="text-2xl font-bold text-white hover:text-gray-300 transition-colors duration-200"
          >
            Your Secret Japan
          </Link>

          {/* ハンバーガーボタン */}
          <Button
            variant="ghost"
            className="group lg:hidden z-50 relative hover:bg-white transition-colors duration-200"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-colors duration-200 group-hover:stroke-black"
            >
              {isMenuOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </Button>

          {/* デスクトップナビ */}
          <nav className="hidden lg:block">
            <ul className="flex space-x-4">{desktopNavLinks}</ul>
          </nav>
        </div>

        {/* モバイルメニュー（最適化されたアニメーション） */}
        {isVisible && (
          <nav className="fixed inset-0 z-50 bg-black bg-opacity-95">
            <div
              className={`flex flex-col h-full transform transition-all duration-300 ease-out
                ${
                  animateIn
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 -translate-y-4"
                }`}
            >
              <div className="container mx-auto w-full px-6 md:px-16 flex justify-between pt-6">
                <p className="text-2xl font-bold text-white">Menu</p>
                <button
                  type="button"
                  onClick={closeMenu}
                  className="group z-50 p-2 rounded hover:bg-white transition-colors duration-200"
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
                    className="transition-colors duration-200 group-hover:stroke-black"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              <ul className="flex-grow flex flex-col items-center justify-center space-y-6 text-lg">
                {mobileNavLinks}
              </ul>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
