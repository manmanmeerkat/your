"use client";

import React, { useState, useEffect } from "react";

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
  initialVisibleItems?: number; // 初期表示する項目数（デフォルト: 3）
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({
  tableOfContents,
  activeSection,
  scrollToHeading,
  showMobileToc,
  closeMobileToc,
  initialVisibleItems = 3, // デフォルトで3項目まで表示
}) => {
  // 展開/折りたたみの状態管理
  const [isExpanded, setIsExpanded] = useState(false);

  // デバッグ用ログ
  useEffect(() => {
    console.log("TableOfContents レンダリング:", {
      totalItems: tableOfContents?.length || 0,
      initialVisibleItems,
      isExpanded,
      shouldShowButton: (tableOfContents?.length || 0) > initialVisibleItems,
    });
  }, [tableOfContents, initialVisibleItems, isExpanded]);

  // 早期リターンでエラーを防ぐ
  if (!tableOfContents || tableOfContents.length === 0) {
    console.log("目次が空または未定義です");
    return null;
  }

  // 表示制御のロジック
  const totalItems = tableOfContents.length;
  const shouldShowViewMore = totalItems > initialVisibleItems;
  const displayedItems = isExpanded
    ? tableOfContents
    : tableOfContents.slice(0, initialVisibleItems);

  console.log("表示制御:", {
    totalItems,
    shouldShowViewMore,
    displayedItemsCount: displayedItems.length,
    isExpanded,
  });

  // View moreボタンのクリックハンドラー
  const handleViewMoreClick = () => {
    console.log("View moreボタンがクリックされました。現在の状態:", isExpanded);
    setIsExpanded((prev) => {
      const newState = !prev;
      console.log("新しい状態:", newState);
      return newState;
    });
  };

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
        {/* タイトル */}
        <h3
          className="japanese-style-modern-sidebar-title"
          onClick={handleTitleClick}
          style={{
            cursor: "default",
            position: "relative",
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
          {/* 表示する目次項目 */}
          {displayedItems.map((item, index) => (
            <div
              key={`${item.id}-${index}`}
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

          {/* View more / View less ボタン */}
          {shouldShowViewMore && (
            <div
              style={{
                marginTop: "1rem",
                borderTop: "1px solid rgba(241, 144, 114, 0.2)",
                paddingTop: "1rem",
              }}
            >
              <button
                onClick={handleViewMoreClick}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  background:
                    "linear-gradient(135deg, rgba(139, 69, 19, 0.15) 0%, rgba(160, 82, 45, 0.12) 50%, rgba(139, 69, 19, 0.15) 100%)",
                  border: "1px solid rgba(218, 165, 32, 0.4)",
                  borderRadius: "8px",
                  color: "#daa520",
                  fontSize: "0.9rem",
                  fontWeight: "500",
                  cursor: "pointer",
                  textAlign: "center" as const,
                  letterSpacing: "0.05em",
                  transition: "all 0.3s ease",
                  fontFamily: "inherit",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background =
                    "linear-gradient(135deg, rgba(139, 69, 19, 0.25) 0%, rgba(160, 82, 45, 0.2) 50%, rgba(139, 69, 19, 0.25) 100%)";
                  e.currentTarget.style.borderColor = "rgba(218, 165, 32, 0.6)";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background =
                    "linear-gradient(135deg, rgba(139, 69, 19, 0.15) 0%, rgba(160, 82, 45, 0.12) 50%, rgba(139, 69, 19, 0.15) 100%)";
                  e.currentTarget.style.borderColor = "rgba(218, 165, 32, 0.4)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
                type="button"
                aria-label={
                  isExpanded ? "目次を折りたたむ" : "目次をもっと見る"
                }
              >
                {isExpanded ? "View less <<" : "View more >>"}
              </button>
            </div>
          )}
        </nav>

        {/* デバッグ情報（開発時のみ表示） */}
        {process.env.NODE_ENV === "development" && (
          <div
            style={{
              marginTop: "1rem",
              padding: "0.5rem",
              background: "rgba(255,0,0,0.1)",
              fontSize: "0.7rem",
              color: "#fff",
            }}
          >
            <div>総項目数: {totalItems}</div>
            <div>表示項目数: {displayedItems.length}</div>
            <div>展開状態: {isExpanded ? "true" : "false"}</div>
            <div>ボタン表示: {shouldShowViewMore ? "true" : "false"}</div>
          </div>
        )}
      </aside>
    </>
  );
};
