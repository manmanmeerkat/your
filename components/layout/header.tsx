"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { NAVI_LINKS } from "@/constants/constants";

// 🎯 型定義
interface NavLinkProps {
  href: string;
  label: string;
  onClick?: () => void;
  prefetch?: boolean;
}

// 🚀 最適化されたナビリンクコンポーネント
const OptimizedNavLink = ({
  href,
  label,
  onClick,
  prefetch = true,
}: NavLinkProps) => {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  // ホバー時の積極的プリフェッチ
  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    if (prefetch) {
      router.prefetch(href);
    }
  }, [router, href, prefetch]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setIsPressed(false);
  }, []);

  // マウスダウン時の即座フィードバック
  const handleMouseDown = useCallback(() => {
    setIsPressed(true);
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsPressed(false);
  }, []);

  // 高速クリックハンドラ
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();

      // 即座に視覚的フィードバック
      setIsPressed(true);

      // メニューを閉じる（モバイル用）
      if (onClick) {
        onClick();
      }

      // 即座にナビゲーション実行
      router.push(href);

      // 短時間後にプレス状態をリセット
      setTimeout(() => setIsPressed(false), 100);
    },
    [router, href, onClick]
  );

  return (
    <Link
      href={href}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      className={`
        block py-2 text-[#f3f3f2] relative group transition-all duration-150
        ${
          isPressed ? "transform scale-95 text-gray-400" : "transform scale-100"
        }
        ${isHovered ? "text-gray-300" : "text-[#f3f3f2]"}
      `}
      style={{
        willChange: "transform, color",
      }}
    >
      {label}
      <span
        className={`
          absolute bottom-0 left-0 h-0.5 bg-gray-400 transition-all duration-200
          ${isHovered ? "w-full" : "w-0"}
        `}
        style={{ willChange: "width" }}
      />
    </Link>
  );
};

// ハンバーガーアイコンコンポーネント
const HamburgerIcon = ({ isOpen }: { isOpen: boolean }) => (
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
    className="transition-all duration-200 group-hover:stroke-black"
    style={{ willChange: "stroke" }}
  >
    {isOpen ? (
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
);

export default function Header() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);

  const timeoutRef = useRef<NodeJS.Timeout>();
  const prefetchedRef = useRef<Set<string>>(new Set());

  // 全ナビリンクを即座にプリフェッチ
  useEffect(() => {
    NAVI_LINKS.forEach(({ href }) => {
      if (!prefetchedRef.current.has(href)) {
        router.prefetch(href);
        prefetchedRef.current.add(href);
      }
    });
  }, [router]);

  // アニメーション制御
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (isMenuOpen) {
      setIsVisible(true);
      setAnimateIn(false);

      requestAnimationFrame(() => {
        setAnimateIn(true);
      });
    } else {
      setAnimateIn(false);
      timeoutRef.current = setTimeout(() => {
        setIsVisible(false);
      }, 200);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isMenuOpen]);

  // メニュー制御
  const toggleMenu = useCallback(() => {
    setIsMenuOpen((prev) => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  // スクロール制御
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
    }

    return () => {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    };
  }, [isMenuOpen]);

  // キーボードイベント
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMenuOpen) {
        e.preventDefault();
        closeMenu();
      }
    };

    if (isMenuOpen) {
      document.addEventListener("keydown", handleKeyDown, { passive: false });
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen, closeMenu]);

  // デスクトップナビリンク
  const desktopNavLinks = useMemo(
    () =>
      NAVI_LINKS.map(({ href, label }) => (
        <li key={href}>
          <OptimizedNavLink href={href} label={label} />
        </li>
      )),
    []
  );

  // モバイルナビリンク
  const mobileNavLinks = useMemo(
    () =>
      NAVI_LINKS.map(({ href, label }) => (
        <li key={href}>
          <OptimizedNavLink href={href} label={label} onClick={closeMenu} />
        </li>
      )),
    [closeMenu]
  );

  // ロゴクリック処理
  const handleLogoClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      router.push("/");
    },
    [router]
  );

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 bg-[#180614] shadow-sm"
      style={{
        willChange: "transform",
        backfaceVisibility: "hidden",
      }}
    >
      <div className="container mx-auto px-6 md:px-16 py-4">
        <div className="flex justify-between items-center">
          {/* ロゴ */}
          <Link
            href="/"
            onClick={handleLogoClick}
            className="text-2xl font-bold text-white hover:text-gray-300 transition-colors duration-150"
            style={{ willChange: "color" }}
          >
            Your Secret Japan
          </Link>

          {/* ハンバーガーボタン */}
          <button
            type="button"
            className="group lg:hidden z-50 relative hover:bg-white transition-all duration-150 p-2 rounded active:scale-95"
            onClick={toggleMenu}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
            style={{ willChange: "transform, background-color" }}
          >
            <HamburgerIcon isOpen={isMenuOpen} />
          </button>

          {/* デスクトップナビ */}
          <nav
            className="hidden lg:block"
            role="navigation"
            aria-label="Main navigation"
          >
            <ul className="flex space-x-4">{desktopNavLinks}</ul>
          </nav>
        </div>

        {/* モバイルメニュー */}
        {isVisible && (
          <nav
            className="fixed inset-0 z-50 bg-[#2b1e1c] bg-opacity-95"
            role="navigation"
            aria-label="Mobile navigation"
            style={{
              willChange: "opacity, transform",
              backfaceVisibility: "hidden",
            }}
          >
            {/* オーバーレイ */}
            <div
              className="absolute inset-0"
              onClick={closeMenu}
              aria-hidden="true"
            />

            <div
              className={`relative flex flex-col h-full transition-all duration-200 ease-out
                ${
                  animateIn
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 -translate-y-2"
                }`}
              style={{
                willChange: "opacity, transform",
                backfaceVisibility: "hidden",
              }}
            >
              {/* メニューヘッダー */}
              <div className="container mx-auto w-full px-6 md:px-16 flex justify-between pt-6">
                <p className="text-2xl font-bold text-[#f3f3f2]">Menu</p>
                <button
                  type="button"
                  onClick={closeMenu}
                  className="group z-50 p-2 rounded hover:bg-white transition-all duration-150 active:scale-95"
                  aria-label="Close menu"
                  style={{ willChange: "transform, background-color" }}
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
                    className="transition-colors duration-150 group-hover:stroke-black"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              {/* ナビリンク */}
              <ul
                className="flex-grow flex flex-col items-center justify-center space-y-6 text-lg"
                role="list"
              >
                {mobileNavLinks}
              </ul>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
