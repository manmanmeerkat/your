// FloatingButtonDebugger.tsx - 確実に表示される版
import React, { useState, useEffect } from "react";

interface FloatingButtonDebuggerProps {
  isEnabled?: boolean;
}

export const FloatingButtonDebugger: React.FC<FloatingButtonDebuggerProps> = ({
  isEnabled = true, // デフォルトで有効に変更
}) => {
  const [showDebug, setShowDebug] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [buttonPositions, setButtonPositions] = useState({
    tocButton: { exists: false, rect: null as DOMRect | null },
    scrollButton: { exists: false, rect: null as DOMRect | null },
  });

  // マウント確認
  useEffect(() => {
    setMounted(true);
    console.log("🔍 FloatingButtonDebugger mounted");
  }, []);

  useEffect(() => {
    if (!isEnabled || !mounted) return;

    const updatePositions = () => {
      // より幅広い検索
      const tocButtons = document.querySelectorAll(
        '.floating-toc-button, [data-floating-button="true"], .japanese-style-modern-toc-button, button[aria-label*="table of contents"], button[aria-label*="目次"]'
      );
      const scrollButtons = document.querySelectorAll(
        '.floating-scroll-top-button, button[aria-label*="scroll"], button[aria-label*="top"], button[aria-label*="トップ"]'
      );

      const tocButton = tocButtons[0];
      const scrollButton = scrollButtons[0];

      console.log("🔍 Button search results:", {
        tocButtons: tocButtons.length,
        scrollButtons: scrollButtons.length,
        tocButton: !!tocButton,
        scrollButton: !!scrollButton,
      });

      setButtonPositions({
        tocButton: {
          exists: !!tocButton,
          rect: tocButton?.getBoundingClientRect() || null,
        },
        scrollButton: {
          exists: !!scrollButton,
          rect: scrollButton?.getBoundingClientRect() || null,
        },
      });
    };

    updatePositions();

    const interval = setInterval(updatePositions, 2000);
    const handleResize = () => updatePositions();

    window.addEventListener("resize", handleResize);

    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", handleResize);
    };
  }, [isEnabled, mounted, showDebug]);

  // 確実に表示するため、条件を緩く
  if (!mounted) {
    return (
      <div
        style={{
          position: "fixed",
          top: "10px",
          left: "10px",
          zIndex: 999999,
          background: "orange",
          color: "white",
          padding: "4px 8px",
          borderRadius: "4px",
          fontSize: "12px",
        }}
      >
        Loading Debug...
      </div>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 999999,
      }}
    >
      {/* 必ず表示されるデバッグ切り替えボタン */}
      <button
        onClick={() => {
          console.log("🔍 Debug toggle clicked, current state:", showDebug);
          setShowDebug(!showDebug);
        }}
        style={{
          position: "fixed",
          top: "10px",
          left: "10px",
          zIndex: 999999,
          padding: "8px 12px",
          background: showDebug ? "rgba(255, 0, 0, 0.9)" : "rgba(0, 0, 0, 0.9)",
          color: "white",
          border: "2px solid white",
          borderRadius: "6px",
          fontSize: "12px",
          cursor: "pointer",
          fontFamily: "monospace",
          fontWeight: "bold",
          pointerEvents: "auto",
          boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
        }}
      >
        {showDebug ? "🔍 HIDE DEBUG" : "🔍 SHOW DEBUG"}
      </button>

      {/* 常に表示される簡易ステータス */}
      <div
        style={{
          position: "fixed",
          top: "10px",
          left: "150px",
          zIndex: 999999,
          padding: "4px 8px",
          background: "rgba(0, 0, 0, 0.8)",
          color: "white",
          borderRadius: "4px",
          fontSize: "10px",
          fontFamily: "monospace",
          pointerEvents: "none",
        }}
      >
        TOC: {buttonPositions.tocButton.exists ? "✅" : "❌"} | SCROLL:{" "}
        {buttonPositions.scrollButton.exists ? "✅" : "❌"}
      </div>

      {/* デバッグ表示 */}
      {showDebug && (
        <>
          {/* 目次ボタンの予定位置（赤い点線円） */}
          <div
            style={{
              position: "fixed",
              bottom: "1.5rem",
              right: "1.5rem",
              width: "3.5rem",
              height: "3.5rem",
              border: "3px dashed rgba(255, 0, 0, 0.8)",
              borderRadius: "50%",
              background: "rgba(255, 0, 0, 0.2)",
              zIndex: 999998,
              pointerEvents: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "10px",
              color: "red",
              fontWeight: "bold",
              fontFamily: "monospace",
            }}
          >
            TOC
            <br />
            EXPECTED
          </div>

          {/* スクロールボタンの予定位置（青い点線円） */}
          <div
            style={{
              position: "fixed",
              bottom: "1.5rem",
              left: "1.5rem",
              width: "3rem",
              height: "3rem",
              border: "3px dashed rgba(0, 100, 255, 0.8)",
              borderRadius: "50%",
              background: "rgba(0, 100, 255, 0.2)",
              zIndex: 999998,
              pointerEvents: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "10px",
              color: "blue",
              fontWeight: "bold",
              fontFamily: "monospace",
            }}
          >
            TOP
            <br />
            EXPECTED
          </div>

          {/* 実際のボタン位置の枠線（緑色） */}
          {buttonPositions.tocButton.exists &&
            buttonPositions.tocButton.rect && (
              <div
                style={{
                  position: "fixed",
                  top: buttonPositions.tocButton.rect.top - 3,
                  left: buttonPositions.tocButton.rect.left - 3,
                  width: buttonPositions.tocButton.rect.width + 6,
                  height: buttonPositions.tocButton.rect.height + 6,
                  border: "3px solid rgba(0, 255, 0, 0.9)",
                  borderRadius: "50%",
                  zIndex: 999997,
                  pointerEvents: "none",
                  boxShadow: "0 0 15px rgba(0, 255, 0, 0.6)",
                }}
              />
            )}

          {buttonPositions.scrollButton.exists &&
            buttonPositions.scrollButton.rect && (
              <div
                style={{
                  position: "fixed",
                  top: buttonPositions.scrollButton.rect.top - 3,
                  left: buttonPositions.scrollButton.rect.left - 3,
                  width: buttonPositions.scrollButton.rect.width + 6,
                  height: buttonPositions.scrollButton.rect.height + 6,
                  border: "3px solid rgba(0, 255, 0, 0.9)",
                  borderRadius: "50%",
                  zIndex: 999997,
                  pointerEvents: "none",
                  boxShadow: "0 0 15px rgba(0, 255, 0, 0.6)",
                }}
              />
            )}

          {/* 詳細情報パネル */}
          <div
            style={{
              position: "fixed",
              bottom: "10px",
              left: "50%",
              transform: "translateX(-50%)",
              background: "rgba(0, 0, 0, 0.95)",
              color: "white",
              padding: "16px",
              borderRadius: "12px",
              fontSize: "11px",
              fontFamily: "monospace",
              zIndex: 999999,
              minWidth: "320px",
              textAlign: "center",
              border: "2px solid rgba(255, 255, 255, 0.2)",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.5)",
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                marginBottom: "12px",
                fontWeight: "bold",
                fontSize: "12px",
              }}
            >
              🔍 Floating Button Debug Info
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
                fontSize: "10px",
              }}
            >
              <div style={{ textAlign: "left" }}>
                <div
                  style={{
                    color: "#ff6b6b",
                    fontWeight: "bold",
                    marginBottom: "4px",
                  }}
                >
                  📍 TOC Button:
                </div>
                <div>Expected: bottom: 1.5rem, right: 1.5rem</div>
                <div>
                  Status:{" "}
                  {buttonPositions.tocButton.exists ? "✅ Found" : "❌ Missing"}
                </div>
                {buttonPositions.tocButton.rect && (
                  <div>
                    Actual: left:{" "}
                    {Math.round(buttonPositions.tocButton.rect.left)}px, top:{" "}
                    {Math.round(buttonPositions.tocButton.rect.top)}px
                  </div>
                )}
                <div>
                  Size:{" "}
                  {buttonPositions.tocButton.rect
                    ? `${Math.round(
                        buttonPositions.tocButton.rect.width
                      )}×${Math.round(buttonPositions.tocButton.rect.height)}`
                    : "N/A"}
                </div>
              </div>

              <div style={{ textAlign: "left" }}>
                <div
                  style={{
                    color: "#4dabf7",
                    fontWeight: "bold",
                    marginBottom: "4px",
                  }}
                >
                  📍 Scroll Button:
                </div>
                <div>Expected: bottom: 1.5rem, left: 1.5rem</div>
                <div>
                  Status:{" "}
                  {buttonPositions.scrollButton.exists
                    ? "✅ Found"
                    : "❌ Missing"}
                </div>
                {buttonPositions.scrollButton.rect && (
                  <div>
                    Actual: left:{" "}
                    {Math.round(buttonPositions.scrollButton.rect.left)}px, top:{" "}
                    {Math.round(buttonPositions.scrollButton.rect.top)}px
                  </div>
                )}
                <div>
                  Size:{" "}
                  {buttonPositions.scrollButton.rect
                    ? `${Math.round(
                        buttonPositions.scrollButton.rect.width
                      )}×${Math.round(
                        buttonPositions.scrollButton.rect.height
                      )}`
                    : "N/A"}
                </div>
              </div>
            </div>

            <div
              style={{
                marginTop: "12px",
                fontSize: "9px",
                opacity: 0.8,
                borderTop: "1px solid rgba(255,255,255,0.2)",
                paddingTop: "8px",
              }}
            >
              🔴 Expected position | 🟢 Actual position | Window:{" "}
              {window.innerWidth}×{window.innerHeight}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
