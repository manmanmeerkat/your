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
  if (tableOfContents.length === 0) {
    return null;
  }

  // 🚨 修正：×ボタンのクリック処理を簡素化
  const handleCloseButtonClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    console.log("×ボタンがクリックされました - closeMobileToc実行");
    closeMobileToc();
  };

  // 🚨 修正：タイトル領域のクリック処理（×ボタン以外では何もしない）
  const handleTitleClick = (event: React.MouseEvent) => {
    // タイトル部分がクリックされても目次は閉じない
    event.preventDefault();
  };

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
        {/* 🚨 修正：Hydrationエラー回避のため、relativeクラスを直接h3に適用 */}
        <h3
          className="japanese-style-modern-sidebar-title relative"
          onClick={handleTitleClick}
          style={{ cursor: "default" }}
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
