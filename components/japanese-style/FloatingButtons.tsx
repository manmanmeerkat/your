// FloatingButtons.tsx
import React from "react";

interface FloatingButtonsProps {
  showScrollTop: boolean;
  scrollToTop: () => void;
  toggleMobileToc: () => void;
}

export const FloatingButtons: React.FC<FloatingButtonsProps> = ({
  toggleMobileToc,
}) => {
  return (
    <>
      {/* 目次ボタン（モバイル用）のみ表示 */}
      <button
        className="japanese-style-modern-toc-button"
        onClick={toggleMobileToc}
        aria-label="目次を表示"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h7"
          />
        </svg>
      </button>
    </>
  );
};
