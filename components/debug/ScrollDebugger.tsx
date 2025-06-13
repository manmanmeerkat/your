// ScrollDebugger.tsx - 完全版（開発用デバッグコンポーネント）
import React, { useEffect, useState } from "react";

interface ScrollDebuggerProps {
  isEnabled?: boolean; // 本番では false に設定
}

export const ScrollDebugger: React.FC<ScrollDebuggerProps> = ({
  isEnabled = process.env.NODE_ENV === "development",
}) => {
  const [scrollInfo, setScrollInfo] = useState({
    scrollY: 0,
    viewportHeight: 0,
    targetOffset: 0,
    activeHeading: "",
    headings: [] as Array<{
      id: string;
      text: string;
      top: number;
      visible: boolean;
    }>,
  });

  useEffect(() => {
    if (!isEnabled || typeof window === "undefined") return;

    const updateScrollInfo = () => {
      const screenWidth = window.innerWidth;
      let targetOffset = 100; // デフォルト

      // オフセット計算（TableOfContentsと同じロジック）
      if (screenWidth <= 480) {
        targetOffset = 70;
      } else if (screenWidth <= 768) {
        targetOffset = 80;
      } else if (screenWidth <= 1024) {
        targetOffset = 90;
      } else {
        targetOffset = 100;
      }

      // 現在の見出しを検出
      const headings = Array.from(
        document.querySelectorAll("h1[id], h2[id], h3[id]")
      );
      let activeHeading = "";

      const headingData = headings.map((heading) => {
        const rect = heading.getBoundingClientRect();
        const isVisible = rect.top >= 0 && rect.top <= window.innerHeight;
        const isActive =
          rect.top <= targetOffset + 20 && rect.bottom >= targetOffset - 20;

        if (isActive && !activeHeading) {
          activeHeading = heading.id;
        }

        return {
          id: heading.id,
          text: heading.textContent?.trim().substring(0, 30) || "",
          top: Math.round(rect.top),
          visible: isVisible,
        };
      });

      setScrollInfo({
        scrollY: window.pageYOffset,
        viewportHeight: window.innerHeight,
        targetOffset,
        activeHeading,
        headings: headingData,
      });
    };

    // 初期更新
    updateScrollInfo();

    // スクロールイベントリスナー
    const handleScroll = () => {
      requestAnimationFrame(updateScrollInfo);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", updateScrollInfo);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", updateScrollInfo);
    };
  }, [isEnabled]);

  if (!isEnabled) return null;

  return (
    <>
      {/* スクロール位置を示すライン */}
      <div
        style={{
          position: "fixed",
          top: scrollInfo.targetOffset,
          left: 0,
          right: 0,
          height: "3px",
          background:
            "linear-gradient(90deg, transparent, red 20%, orange 50%, red 80%, transparent)",
          zIndex: 999999,
          pointerEvents: "none",
          boxShadow: "0 0 15px rgba(255, 0, 0, 0.6)",
          animation: "pulse 2s infinite",
        }}
      />

      {/* デバッグ情報パネル */}
      <div
        style={{
          position: "fixed",
          top: "10px",
          right: "10px",
          background: "rgba(0, 0, 0, 0.95)",
          color: "white",
          padding: "12px",
          borderRadius: "12px",
          fontFamily: "monospace",
          fontSize: "11px",
          zIndex: 999998,
          minWidth: "280px",
          maxWidth: "320px",
          backdropFilter: "blur(15px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
        }}
      >
        <div
          style={{
            marginBottom: "8px",
            fontWeight: "bold",
            color: "#ff6b6b",
            textAlign: "center",
            borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
            paddingBottom: "6px",
          }}
        >
          📍 Scroll Debugger
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "4px",
            marginBottom: "8px",
          }}
        >
          <div>
            Screen: {window.innerWidth}×{scrollInfo.viewportHeight}
          </div>
          <div>Scroll Y: {Math.round(scrollInfo.scrollY)}</div>
          <div>Target: {scrollInfo.targetOffset}px</div>
          <div
            style={{ color: scrollInfo.activeHeading ? "#4ade80" : "#94a3b8" }}
          >
            Active: {scrollInfo.activeHeading || "None"}
          </div>
        </div>

        {/* 見出し一覧 */}
        <div style={{ marginTop: "10px", fontSize: "10px" }}>
          <div
            style={{
              fontWeight: "bold",
              marginBottom: "6px",
              color: "#60a5fa",
              borderBottom: "1px solid rgba(96, 165, 250, 0.3)",
              paddingBottom: "3px",
            }}
          >
            📋 Headings ({scrollInfo.headings.length}):
          </div>
          <div style={{ maxHeight: "200px", overflowY: "auto" }}>
            {scrollInfo.headings.map((heading) => {
              const isNear =
                Math.abs(heading.top - scrollInfo.targetOffset) <= 50;
              const isActive = heading.id === scrollInfo.activeHeading;

              return (
                <div
                  key={heading.id}
                  style={{
                    padding: "4px 6px",
                    margin: "2px 0",
                    background: isActive
                      ? "rgba(34, 197, 94, 0.3)"
                      : isNear
                      ? "rgba(255, 100, 100, 0.2)"
                      : "transparent",
                    borderRadius: "4px",
                    cursor: "pointer",
                    border: isActive
                      ? "1px solid rgba(34, 197, 94, 0.5)"
                      : "1px solid transparent",
                    transition: "all 0.2s ease",
                  }}
                  onClick={() => {
                    const element = document.getElementById(heading.id);
                    if (element) {
                      element.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      });
                    }
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background =
                      "rgba(96, 165, 250, 0.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = isActive
                      ? "rgba(34, 197, 94, 0.3)"
                      : isNear
                      ? "rgba(255, 100, 100, 0.2)"
                      : "transparent";
                  }}
                >
                  <div
                    style={{
                      fontWeight: isActive ? "bold" : "normal",
                      color: isActive ? "#22c55e" : "#ffffff",
                    }}
                  >
                    {heading.id}
                  </div>
                  <div
                    style={{
                      fontSize: "9px",
                      opacity: 0.7,
                      marginTop: "2px",
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <span>Top: {heading.top}px</span>
                    <span
                      style={{ color: heading.visible ? "#22c55e" : "#ef4444" }}
                    >
                      {heading.visible ? "👁️" : "🚫"}
                    </span>
                  </div>
                  <div
                    style={{ fontSize: "9px", opacity: 0.6, marginTop: "1px" }}
                  >
                    &quot;{heading.text}...&quot;
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 操作ボタン */}
        <div
          style={{
            marginTop: "10px",
            paddingTop: "8px",
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            display: "flex",
            gap: "6px",
            fontSize: "9px",
          }}
        >
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            style={{
              padding: "4px 8px",
              background: "rgba(59, 130, 246, 0.2)",
              border: "1px solid rgba(59, 130, 246, 0.4)",
              borderRadius: "4px",
              color: "white",
              cursor: "pointer",
            }}
          >
            🔝 Top
          </button>
          <button
            onClick={() =>
              window.scrollTo({
                top: document.body.scrollHeight,
                behavior: "smooth",
              })
            }
            style={{
              padding: "4px 8px",
              background: "rgba(245, 101, 101, 0.2)",
              border: "1px solid rgba(245, 101, 101, 0.4)",
              borderRadius: "4px",
              color: "white",
              cursor: "pointer",
            }}
          >
            🔽 Bottom
          </button>
        </div>
      </div>

      {/* CSS アニメーション */}
      <style jsx global>{`
        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
            transform: scaleY(1);
          }
          50% {
            opacity: 0.7;
            transform: scaleY(1.2);
          }
        }

        .debug-heading-marker {
          position: relative;
        }
        .debug-heading-marker::before {
          content: "🎯";
          position: absolute;
          left: -30px;
          top: 0;
          font-size: 16px;
          z-index: 1000;
          animation: bounce 2s infinite;
        }

        @keyframes bounce {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }
      `}</style>
    </>
  );
};
