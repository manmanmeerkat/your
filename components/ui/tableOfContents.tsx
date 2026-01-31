// components/ui/tableOfContents.tsx
"use client";

import React from "react";
import type { TocItem } from "@/app/utils/toc";

type Props = {
  items: TocItem[];
  activeId: string;
  onClickItem: (id: string) => void;
};

export function TableOfContents({ items, activeId, onClickItem }: Props) {
  const initialVisibleItems = 5;
  const [expanded, setExpanded] = React.useState(false);
  const shouldShowViewMore = items.length > initialVisibleItems;
  const visible = expanded ? items : items.slice(0, initialVisibleItems);

  return (
    <section
      aria-label="Table of contents"
      className="
        mx-6 mb-8 overflow-hidden rounded-2xl
        border border-[rgba(255,255,255,0.14)]
        shadow-[0_18px_45px_rgba(0,0,0,0.45),_inset_0_1px_0_rgba(255,255,255,0.07)]
        bg-gradient-to-br from-[#221a18cc] via-[#15110f] to-[#0f0c0a]
      "
    >
      <div
        className="
          relative
          bg-gradient-to-br from-[rgba(255,255,255,0.08)] via-[rgba(255,255,255,0.04)] to-[rgba(255,255,255,0.08)]
          border-b border-[rgba(255,255,255,0.14)]
        "
      >
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-[#c96a5d]/55 to-transparent" />

        <h3
          className="
            m-0 py-4 text-center
            text-[1.22rem] font-semibold tracking-[0.12em]
            text-[#f5ede3]
            drop-shadow-[0_1px_0_rgba(0,0,0,0.55)]
          "
        >
          Contents
        </h3>
      </div>

      <nav className="flex flex-col gap-2 p-6">
        {visible.map((item) => {
          const isActive = activeId === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onClickItem(item.id)}
              className={[
                "group relative w-full text-left",
                "rounded-xl transition-all duration-200",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20",
                item.level === 1 ? "pl-5 pr-10 py-3" : "pl-8 pr-10 py-2.5",
                item.level === 1
                  ? "text-[1.02rem] font-semibold leading-snug"
                  : "text-[0.95rem] font-medium leading-snug",
                isActive
                  ? "text-[#e9c58a] bg-white/6"
                  : "text-[#f3f3f2] hover:bg-white/6 hover:text-[#e9c58a]",
              ].join(" ")}
            >
              <span
                aria-hidden="true"
                className={[
                  "absolute top-1/2 -translate-y-1/2 rounded-full",
                  "w-[3px] h-[62%]",
                  item.level === 1 ? "left-0" : "left-3",
                  isActive ? "bg-[#e9c58a]" : "bg-[#c96a5d]",
                ].join(" ")}
              />

              <span className="block">{item.text}</span>

              <span
                aria-hidden="true"
                className="
                  absolute right-3 top-1/2 -translate-y-1/2
                  text-white/30
                  transition-all duration-200
                  group-hover:text-white/60 group-hover:translate-x-[1px]
                "
              >
                ›
              </span>
            </button>
          );
        })}

        {shouldShowViewMore && (
          <div
            className="
              mt-4 overflow-hidden rounded-xl
              border border-[rgba(255,255,255,0.14)]
              bg-white/6
            "
          >
            <button
              onClick={() => setExpanded((p) => !p)}
              type="button"
              className="
                w-full px-5 py-4
                text-center text-[0.95rem] font-semibold tracking-[0.08em]
                text-[#f5ede3]
                bg-transparent
                transition-all duration-200
                hover:bg-white/8 hover:-translate-y-[1px]
                focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20
              "
            >
              {expanded ? "View less <<" : "View more >>"}
            </button>
          </div>
        )}
      </nav>
    </section>
  );
}
