import { useEffect, useState } from "react";

type Options = {
  rootSelector?: string;   // 監視のスクロールroot（windowなら不要）
  headerOffset?: number;
};

export function useActiveHeading(
  depsKey: string,
  { headerOffset = 120 }: Options = {}
) {
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    const headings = Array.from(document.querySelectorAll("h2[id], h3[id]")) as HTMLElement[];
    if (!headings.length) return;

    const header = document.querySelector("header") as HTMLElement | null;
    const offset = Math.round((header ? header.getBoundingClientRect().height : headerOffset)) + 16;

    const io = new IntersectionObserver(
      (entries) => {
        // 上から順に「見えているもののうち一番上」を active にする
        const visible = entries
          .filter((e) => e.isIntersecting)
          .map((e) => e.target as HTMLElement);

        if (!visible.length) return;

        visible.sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);
        setActiveId(visible[0].id);
      },
      {
        root: null, // window
        rootMargin: `-${offset}px 0px -70% 0px`,
        threshold: [0, 1],
      }
    );

    headings.forEach((h) => io.observe(h));
    return () => io.disconnect();
  }, [depsKey, headerOffset]);

  return { activeId };
}
