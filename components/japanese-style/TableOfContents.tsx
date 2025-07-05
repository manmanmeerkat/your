"use client";

import React from "react";

// 🚨 型定義をローカルで定義（循環インポートを回避）
export type TocItem = {
  id: string;
  text: string;
  level: number;
};

interface TableOfContentsProps {
  tableOfContents: TocItem[];
  activeSection: string;
  scrollToHeading: (id: string) => void;
  showMobileToc: boolean;
  closeMobileToc: () => void;
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({
  tableOfContents,
  activeSection,
  scrollToHeading,
  showMobileToc,
  closeMobileToc,
}) => {
  // 早期リターンでエラーを防ぐ
  if (!tableOfContents || tableOfContents.length === 0) {
    return null;
  }

  // 🚨 修正：×ボタンのクリック処理を簡素化
  const handleCloseButtonClick = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
    event.stopPropagation();
    console.log("×ボタンがクリックされました - closeMobileToc実行");
    closeMobileToc();
  };

  // 🚨 修正：タイトル領域のクリック処理（×ボタン以外では何もしない）
  const handleTitleClick = (event: React.MouseEvent<HTMLHeadingElement>) => {
    // タイトル部分がクリックされても目次は閉じない
    event.preventDefault();
  };

  // 🚨 重要修正: 見出しクリック時は scrollToHeading のみを呼び出し
  const handleHeadingClick = (item: TocItem) => {
    console.log("目次項目がクリックされました:", item.id, item.text);
    console.log("scrollToHeading のみ実行 - スクロール位置復元なし");

    // 🚨 重要: scrollToHeading のみ呼び出し
    scrollToHeading(item.id);
  };

  // 🚨 オーバーレイクリック処理
  const handleOverlayClick = () => {
    console.log("オーバーレイがクリックされました - closeMobileToc実行");
    closeMobileToc();
  };

  return (
    <>
      {/* モバイル用オーバーレイ */}
      <div
        className={`japanese-style-modern-overlay ${
          showMobileToc ? "visible" : ""
        }`}
        onClick={handleOverlayClick}
        role="button"
        tabIndex={-1}
        aria-label="目次を閉じる"
      />

      {/* サイドバー */}
      <aside
        className={`japanese-style-modern-sidebar scrollbar-custom ${
          showMobileToc ? "mobile-visible" : ""
        }`}
        role="navigation"
        aria-label="目次"
      >
        {/* 🚨 修正：Hydrationエラー回避のため、relativeクラスを直接h3に適用 */}
        <h3
          className="japanese-style-modern-sidebar-title"
          onClick={handleTitleClick}
          style={{
            cursor: "default",
            position: "relative", // インラインスタイルで指定
          }}
        >
          Contents
          {/* 🚨 修正：×ボタンを h3 の子要素として配置 */}
          <button
            className="japanese-style-modern-close-button"
            onClick={handleCloseButtonClick}
            aria-label="目次を閉じる"
            type="button"
          >
            ✕
          </button>
        </h3>

        <nav role="navigation">
          {tableOfContents.map((item) => (
            <div
              key={item.id}
              className={`japanese-style-modern-toc-item ${
                activeSection === item.id ? "active" : ""
              }`}
              data-level={item.level}
              onClick={() => handleHeadingClick(item)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleHeadingClick(item);
                }
              }}
              style={{ cursor: "pointer" }}
              role="button"
              tabIndex={0}
              aria-label={`${item.text}へ移動`}
            >
              {item.text}
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
};
