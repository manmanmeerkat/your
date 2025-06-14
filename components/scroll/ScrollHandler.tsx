// components/scroll/ScrollHandler.tsx - デバッグ機能付き位置復元
"use client";

import { useEffect } from "react";

interface ExactScrollData {
  originalScrollY: number;
  godsSectionTop: number;
  shouldRestorePosition: boolean;
  disablePaginationScroll: boolean; // pagination無効化フラグ
  timestamp: number;
  debugInfo: {
    scrollY1: number;
    scrollY2: number;
    scrollY3: number;
    windowInnerHeight: number;
    documentHeight: number;
  };
}

export default function ScrollHandler() {
  useEffect(() => {
    console.log("ScrollHandler: 初期化");

    // 🎯 デバッグ用：現在のページ状態をログ出力
    const logCurrentState = (label: string) => {
      console.log(`${label} - 現在の状態:`, {
        scrollY: window.pageYOffset,
        documentHeight: document.documentElement.scrollHeight,
        windowHeight: window.innerHeight,
        readyState: document.readyState,
        timestamp: Date.now(),
      });
    };

    logCurrentState("ScrollHandler初期化時");

    // 🎯 位置復元の実行
    const restoreExactPosition = () => {
      try {
        const exactScrollData = sessionStorage.getItem("exact-scroll-restore");

        if (exactScrollData) {
          const data: ExactScrollData = JSON.parse(exactScrollData);

          console.log("位置復元データ発見:", data);
          logCurrentState("復元前");

          // 5分以内のデータのみ有効
          const isRecent = Date.now() - data.timestamp < 5 * 60 * 1000;

          if (isRecent && data.shouldRestorePosition) {
            console.log("位置復元実行開始");

            // 🚀 pagination自動スクロールを無効化
            if (data.disablePaginationScroll) {
              // pagination-wrapperの自動スクロールを一時的に無効化
              window.DISABLE_PAGINATION_SCROLL = true;
              console.log("pagination自動スクロール無効化");

              // 5秒後に再有効化（安全のため）
              setTimeout(() => {
                window.DISABLE_PAGINATION_SCROLL = false;
                sessionStorage.removeItem("disable-pagination-scroll");
                console.log("pagination自動スクロール再有効化");
              }, 5000);
            }

            // データをクリア（一度だけ実行）
            sessionStorage.removeItem("exact-scroll-restore");

            // 🚀 段階的な位置復元
            const performRestore = (attempt: number) => {
              const targetScrollY = data.originalScrollY;

              console.log(`復元試行 ${attempt}: 目標位置 ${targetScrollY}`);

              // 即座に移動
              window.scrollTo({
                top: targetScrollY,
                left: 0,
                behavior: "auto", // アニメーションなし
              });

              // 復元確認
              setTimeout(() => {
                const currentY = window.pageYOffset;
                console.log(
                  `復元確認 ${attempt}: 目標 ${targetScrollY}, 現在 ${currentY}, 差分 ${Math.abs(
                    targetScrollY - currentY
                  )}`
                );

                // 位置が正確でない場合は再試行
                if (Math.abs(targetScrollY - currentY) > 5 && attempt < 5) {
                  console.log(`位置が不正確のため再試行: ${attempt + 1}`);
                  setTimeout(() => performRestore(attempt + 1), 50);
                } else {
                  console.log("位置復元完了または最大試行回数到達");
                  logCurrentState("復元後");
                }
              }, 10);
            };

            // 即座に最初の復元を実行
            performRestore(1);
          } else if (!isRecent) {
            console.log("位置復元データが古いため削除");
            sessionStorage.removeItem("exact-scroll-restore");
          }
        } else {
          console.log("位置復元データなし");
        }
      } catch (error) {
        console.error("位置復元エラー:", error);
        sessionStorage.removeItem("exact-scroll-restore");
      }
    };

    // 🎯 複数のタイミングで位置復元を試行（段階的アプローチ）

    // 1. 即座に実行
    console.log("復元タイミング1: 即座実行");
    restoreExactPosition();

    // 2. 次のイベントループで実行
    setTimeout(() => {
      console.log("復元タイミング2: 次のイベントループ");
      restoreExactPosition();
    }, 0);

    // 3. 少し遅延して実行
    setTimeout(() => {
      console.log("復元タイミング3: 10ms後");
      restoreExactPosition();
    }, 10);

    // 4. DOMContentLoaded
    const handleDOMContentLoaded = () => {
      console.log("復元タイミング4: DOMContentLoaded");
      setTimeout(restoreExactPosition, 0);
    };

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", handleDOMContentLoaded);
    } else {
      handleDOMContentLoaded();
    }

    // 5. window load
    const handleLoad = () => {
      console.log("復元タイミング5: window load");
      setTimeout(restoreExactPosition, 0);
    };

    if (document.readyState !== "complete") {
      window.addEventListener("load", handleLoad);
    } else {
      handleLoad();
    }

    // 6. popstate（ブラウザの戻るボタン）
    const handlePopState = () => {
      console.log("復元タイミング6: popstate");
      setTimeout(restoreExactPosition, 50);
    };
    window.addEventListener("popstate", handlePopState);

    // 7. pageshow（ページがキャッシュから復元された場合）
    const handlePageShow = (event: PageTransitionEvent) => {
      console.log("復元タイミング7: pageshow", event.persisted);
      setTimeout(restoreExactPosition, 0);
    };
    window.addEventListener("pageshow", handlePageShow);

    // 8. 最後の保険として少し遅れて実行
    setTimeout(() => {
      console.log("復元タイミング8: 最終保険 (200ms後)");
      restoreExactPosition();
    }, 200);

    // クリーンアップ
    return () => {
      document.removeEventListener("DOMContentLoaded", handleDOMContentLoaded);
      window.removeEventListener("load", handleLoad);
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, []);

  // このコンポーネントは見た目を持たない
  return null;
}
