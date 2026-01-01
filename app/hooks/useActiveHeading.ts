import { useCallback, useLayoutEffect, useState } from "react";

type Options = {
  containerSelector: string;
  headerOffset?: number;
};

function getScrollRoot(containerSelector: string): HTMLElement {
  const container = document.querySelector(containerSelector) as HTMLElement | null;
  const scrollRoot =
    (container?.closest("[data-scroll-root]") as HTMLElement | null) ||
    (document.scrollingElement as HTMLElement) ||
    document.documentElement;
  return scrollRoot;
}

function getScrollTop(root: HTMLElement): number {
  // document系
  if (root === document.documentElement || root === document.body || root === document.scrollingElement) {
    return window.scrollY || root.scrollTop || 0;
  }
  // 要素スクロール
  return root.scrollTop;
}

function scrollToTop(root: HTMLElement, top: number, behavior: ScrollBehavior) {
  if (root === document.documentElement || root === document.body || root === document.scrollingElement) {
    window.scrollTo({ top, behavior });
  } else {
    root.scrollTo({ top, behavior });
  }
}

export function useActiveHeading(
  depsKey: string,
  { containerSelector, headerOffset = 120 }: Options
) {
  const [activeId, setActiveId] = useState("");

  const getHeaderOffset = useCallback(() => {
    const header = document.querySelector("header");
    const h = header?.getBoundingClientRect().height ?? headerOffset;
    return Math.round(h);
  }, [headerOffset]);

  const computeActive = useCallback(() => {
    const headings = document.querySelectorAll(
      `${containerSelector} h1[id], ${containerSelector} h2[id]`
    );
    if (!headings.length) return;

    const scrollRoot = getScrollRoot(containerSelector);
    const offset = getHeaderOffset();

    const currentScrollY = getScrollTop(scrollRoot);
    const windowHeight = scrollRoot === document.scrollingElement ? window.innerHeight : scrollRoot.clientHeight;

    const documentHeight =
      scrollRoot === document.scrollingElement
        ? Math.max(document.documentElement.scrollHeight, document.body.scrollHeight)
        : scrollRoot.scrollHeight;

    const viewportCenter = currentScrollY + windowHeight / 3;

    let nextId = "";
    let closest = Infinity;

    headings.forEach((h) => {
      const el = h as HTMLElement;

      // ✅ scrollRoot 基準で「要素のドキュメント上位置」を復元
      const rect = el.getBoundingClientRect();
      const rootRect = (scrollRoot === document.scrollingElement)
        ? { top: 0 }
        : scrollRoot.getBoundingClientRect();

      const elementTop = rect.top - rootRect.top + currentScrollY;

      const distance = Math.abs(elementTop - viewportCenter);

      if (elementTop <= currentScrollY + offset && distance < closest) {
        closest = distance;
        nextId = el.id;
      }
    });

    if (currentScrollY + windowHeight >= documentHeight - 100) {
      const last = headings[headings.length - 1] as HTMLElement;
      nextId = last?.id || nextId;
    }
    
    setActiveId((prev) => (prev === nextId ? prev : nextId));
  }, [containerSelector, getHeaderOffset]);

    useLayoutEffect(() => {
      const scrollRoot = getScrollRoot(containerSelector);

      const onScroll: EventListener = () => {
        computeActive();
      };

      const onResize = () => {
        requestAnimationFrame(() => computeActive());
      };

      scrollRoot.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onResize);

      const timer = window.setTimeout(() => computeActive(), 0);

      return () => {
        scrollRoot.removeEventListener("scroll", onScroll); // ✅ any不要
        window.removeEventListener("resize", onResize);
        window.clearTimeout(timer);
      };
    }, [computeActive, containerSelector, depsKey]);


const scrollToHeading = useCallback((id: string) => {
  document.body.classList.remove("toc-open");

  const el = document.getElementById(id);
  if (!el) return;

  const scrollRoot = getScrollRoot(containerSelector);
  const header = document.querySelector("header") as HTMLElement | null;
  const offset = header ? header.offsetHeight : 120;

  // 1) まず通常スクロール
  const currentY = getScrollTop(scrollRoot);
  const rect = el.getBoundingClientRect();
  const rootRect = (scrollRoot === document.scrollingElement)
    ? { top: 0 }
    : scrollRoot.getBoundingClientRect();

  const elTopInRootDoc = rect.top - rootRect.top + currentY;
  const target = Math.max(0, elTopInRootDoc - offset);

  scrollToTop(scrollRoot, target, "smooth");

  // 2) 「1回だけ」補正（遅延レンダリング対策）
  //    画像ロードやフォント描画でレイアウトが動いたら差分だけ合わせる
  const settleOnce = () => {
    const yNow = getScrollTop(scrollRoot);

    const rect2 = el.getBoundingClientRect();
    const rootRect2 = (scrollRoot === document.scrollingElement)
      ? { top: 0 }
      : scrollRoot.getBoundingClientRect();

    const elTop2 = rect2.top - rootRect2.top + yNow;
    const target2 = Math.max(0, elTop2 - offset);

    // “差が十分あるときだけ” 1回補正（小さい差は無視して震え防止）
    if (Math.abs(target2 - yNow) >= 2) {
      scrollToTop(scrollRoot, target2, "auto"); // 1回だけ
    }
  };

  // requestAnimationFrameを2回 + 少し遅延で、画像の後追いレイアウトに強くする
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      window.setTimeout(settleOnce, 120);
    });
  });

}, [containerSelector]);


  return { activeId, scrollToHeading };
}
