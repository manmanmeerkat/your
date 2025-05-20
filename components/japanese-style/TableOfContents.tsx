// TableOfContents.tsx
import React from "react";
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
  // 目次がない場合は何も表示しない
  if (tableOfContents.length === 0) {
    return null;
  }

  return (
    <>
      {/* モバイル用オーバーレイ */}
      <div
        className={`japanese-style-modern-overlay ${
          showMobileToc ? "visible" : ""
        }`}
        onClick={closeMobileToc}
      />

      {/* サイドバー */}
      <aside
        className={`japanese-style-modern-sidebar scrollbar-custom ${
          showMobileToc ? "mobile-visible" : ""
        }`}
      >
        <h3 className="japanese-style-modern-sidebar-title">Contents</h3>

        {/* モバイル用閉じるボタン */}
        <div
          className="japanese-style-modern-close-button"
          onClick={closeMobileToc}
        />

        <nav>
          {tableOfContents.map((item) => (
            <div
              key={item.id}
              className={`japanese-style-modern-toc-item ${
                activeSection === item.id ? "active" : ""
              }`}
              data-level={item.level}
              onClick={() => scrollToHeading(item.id)}
            >
              {item.text}
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
};
