import React, { useEffect } from "react";
import { TocItem } from "@/components/articleClientPage/ArticleClientPage";

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
  // ×ボタンのクリック処理
  useEffect(() => {
    const handleCloseButtonClick = (event: Event) => {
      const target = event.target as HTMLElement;
      if (target.classList.contains("japanese-style-modern-sidebar-title")) {
        const rect = target.getBoundingClientRect();
        const clickX = (event as MouseEvent).clientX;
        const clickY = (event as MouseEvent).clientY;

        if (
          clickX > rect.right - 60 &&
          clickY > rect.top &&
          clickY < rect.bottom
        ) {
          console.log("×ボタンがクリックされました - closeMobileToc実行");
          closeMobileToc(); // ×ボタン専用の関数を使用（スクロール位置復元あり）
        }
      }
    };

    if (showMobileToc) {
      document.addEventListener("click", handleCloseButtonClick);
    }

    return () => {
      document.removeEventListener("click", handleCloseButtonClick);
    };
  }, [showMobileToc, closeMobileToc]);

  if (tableOfContents.length === 0) {
    return null;
  }

  // 🚨 重要修正: 見出しクリック時は scrollToHeading のみを呼び出し
  // closeMobileToc は絶対に呼び出さない（スクロール位置復元を防ぐため）
  const handleHeadingClick = (item: TocItem) => {
    console.log("目次項目がクリックされました:", item.id, item.text);
    console.log("scrollToHeading のみ実行 - スクロール位置復元なし");

    // 🚨 重要: scrollToHeading のみ呼び出し
    // この関数内で目次を閉じる処理とスクロールを同時に行う
    scrollToHeading(item.id);
  };

  return (
    <>
      {/* モバイル用オーバーレイ */}
      <div
        className={`japanese-style-modern-overlay ${
          showMobileToc ? "visible" : ""
        }`}
        onClick={() => {
          console.log("オーバーレイがクリックされました - closeMobileToc実行");
          closeMobileToc(); // オーバーレイクリック時は専用関数を使用（スクロール位置復元あり）
        }}
      />

      {/* サイドバー */}
      <aside
        className={`japanese-style-modern-sidebar scrollbar-custom ${
          showMobileToc ? "mobile-visible" : ""
        }`}
      >
        <h3
          className="japanese-style-modern-sidebar-title"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = e.clientX;
            console.log(
              "タイトル領域クリック:",
              clickX,
              "ボタン位置:",
              rect.right - 60
            );
            if (clickX > rect.right - 60) {
              console.log(
                "×ボタン領域がクリックされました - closeMobileToc実行"
              );
              closeMobileToc(); // ×ボタンクリック時は専用関数を使用（スクロール位置復元あり）
            }
          }}
          style={{ cursor: "default" }}
        >
          Contents
        </h3>

        <nav>
          {tableOfContents.map((item) => (
            <div
              key={item.id}
              className={`japanese-style-modern-toc-item ${
                activeSection === item.id ? "active" : ""
              }`}
              data-level={item.level}
              onClick={() => handleHeadingClick(item)}
              style={{ cursor: "pointer" }}
            >
              {item.text}
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
};
